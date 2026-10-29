"""Analizador de ejercicios de Biometra.

Uso:
    python main.py <video> --exercise press_militar --job-id abc123 [--csv] [--informe]
    python main.py --listar                                   # ejercicios disponibles (JSON)
    python main.py <video> --exercise X --guardar-landmarks   # guarda los puntos del cuerpo (.npz)
    python main.py <video> --exercise X --desde-landmarks f.npz   # reanaliza sin volver a ejecutar MediaPipe

stdout: SOLO un JSON final. Logs por stderr.
"""
import argparse
import csv
import json
import os
import sys
import warnings

import numpy as np

from biometra import informe
from biometra.exercises import CONFIGS, load_exercise
from biometra.video_io import extract_landmarks, log, render_video

warnings.filterwarnings("ignore", category=RuntimeWarning)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def emit(payload, code=0):
    print(json.dumps(payload, ensure_ascii=False))
    sys.exit(code)


def write_csv(path, lm, tiempos):
    with open(path, "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["frame", "time", "landmark_id", "x", "y", "z", "visibility"])
        for i, frame in enumerate(lm):
            if np.isnan(frame[0, 0]):
                continue
            for k, (x, y, z, v) in enumerate(frame):
                wr.writerow([i, round(float(tiempos[i]), 4), k, x, y, z, v])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video", nargs="?")
    ap.add_argument("--exercise", default="press_militar", choices=sorted(CONFIGS))
    ap.add_argument("--job-id", default=None)
    ap.add_argument("--out-dir", default=os.path.join(BASE_DIR, "output"))
    ap.add_argument("--model", default=os.path.join(BASE_DIR, "models", "pose_landmarker_full.task"))
    ap.add_argument("--csv", action="store_true", help="Exporta también los landmarks en CSV")
    ap.add_argument("--listar", action="store_true", help="Imprime en JSON los ejercicios disponibles y termina")
    ap.add_argument("--guardar-landmarks", action="store_true",
                    help="Guarda los puntos del cuerpo en <job>_landmarks.npz para poder reanalizar sin MediaPipe")
    ap.add_argument("--desde-landmarks", default=None,
                    help="Usa un .npz guardado en vez de ejecutar MediaPipe (reanálisis rápido al ajustar umbrales)")
    ap.add_argument("--informe", action="store_true",
                    help="Crea <job>_informe.html (video + tabla + enlaces) y muestra un resumen en la terminal")
    args = ap.parse_args()

    if args.listar:
        emit({"ejercicios": [
            {"clave": k, "titulo": c["title"], "tipo": c.get("tipo", "repeticiones"), "camara": c["camera"],
             "advertencias": c.get("advertencias_extra", [])}
            for k, c in sorted(CONFIGS.items(), key=lambda kv: kv[1]["title"])]})
    if not args.video:
        ap.error("falta el video (o usa --listar)")

    video = os.path.abspath(args.video)
    if not os.path.exists(video):
        emit({"estado": "error", "error": f"No existe el video: {video}"}, 1)
    if args.desde_landmarks:
        if not os.path.exists(args.desde_landmarks):
            emit({"estado": "error", "error": f"No existe el archivo de landmarks: {args.desde_landmarks}"}, 1)
    elif not os.path.exists(args.model):
        emit({"estado": "error", "error": f"No existe el modelo: {args.model}"}, 1)

    os.makedirs(args.out_dir, exist_ok=True)
    base = args.job_id or os.path.splitext(os.path.basename(video))[0]
    out_video = os.path.abspath(os.path.join(args.out_dir, f"{base}_pose.mp4"))
    out_csv = os.path.abspath(os.path.join(args.out_dir, f"{base}_landmarks.csv"))
    out_npz = os.path.abspath(os.path.join(args.out_dir, f"{base}_landmarks.npz"))

    try:
        exercise = load_exercise(args.exercise)

        if args.desde_landmarks:
            log("1/3 Cargando landmarks guardados (sin MediaPipe)...")
            d = np.load(args.desde_landmarks, allow_pickle=False)
            lm, tiempos, fps = d["landmarks"], d["tiempos"], float(d["fps"])
            size, info = tuple(int(v) for v in d["size"]), json.loads(str(d["info"]))
        else:
            log("1/3 Extrayendo landmarks...")
            from biometra.pose import PoseExtractor          # solo se importa cuando hace falta (MediaPipe es pesado)
            with PoseExtractor(args.model) as extractor:
                lm, tiempos, fps, size, info = extract_landmarks(video, extractor)
        if args.guardar_landmarks:
            np.savez_compressed(out_npz, landmarks=lm, tiempos=tiempos, fps=fps, size=np.array(size),
                                info=json.dumps(info))

        con_persona = float((~np.isnan(lm[:, 0, 0])).mean())
        if con_persona < 0.3:
            emit({"estado": "error",
                  "error": "No se detecta a una persona en la mayor parte del video. "
                           "Asegúrate de que se vea el cuerpo completo y haya buena iluminación."}, 1)

        log("2/3 Analizando...")
        analysis = exercise.analyze(lm, tiempos, size)

        log("3/3 Generando video anotado...")
        h264 = render_video(video, out_video, lm, fps, size, analysis.overlay, analysis.highlight)

        if args.csv:
            write_csv(out_csv, lm, tiempos)

        advertencias = [
            "Las métricas son estimaciones 2D a partir de un solo ángulo de cámara.",
            f"Ángulo de cámara recomendado: {exercise.camera}.",
            "Los umbrales de conteo y feedback son aproximados y deben validarse con casos reales.",
        ]
        advertencias += exercise.cfg.get("advertencias_extra", [])
        if con_persona < 0.8:
            advertencias.append("La persona no se detectó en todo el video; el análisis puede ser parcial.")

        payload = {
            "estado": "completado",
            "video": video,
            "video_procesado": out_video,
            "video_procesado_h264": h264,
            "datos": out_csv if args.csv else None,
            "landmarks_npz": out_npz if args.guardar_landmarks else None,
            "analisis": {
                "ejercicio": exercise.key,
                "fps": round(fps, 2),
                "video_info": info,
                "titulo": exercise.title,
                "metricas_clave": exercise.cfg.get("overlay", []),
                "puntuacion": analysis.score,
                "metricas": analysis.metrics,
                "tipo": exercise.cfg.get("tipo", "repeticiones"),
                "repeticiones": analysis.reps,
                **analysis.extra,
                "feedback": analysis.feedback,
                "advertencias": advertencias,
            },
        }
        if args.informe:
            ruta = os.path.join(args.out_dir, f"{base}_informe.html")
            informe.escribir_informe(payload, ruta)
            print("\n" + informe.resumen_texto(payload) + "\n", file=sys.stderr)
            log(f"Informe con video: {ruta}")
        emit(payload)
    except SystemExit:
        raise
    except Exception as e:
        log(f"Error: {e!r}")
        emit({"estado": "error", "error": f"Error durante el análisis: {e}"}, 1)


if __name__ == "__main__":
    main()