"""Analizador de ejercicios de Biometra.

Uso:
    python main.py <video> --exercise press_militar --job-id abc123 [--csv]

stdout: SOLO un JSON final. Logs por stderr.
"""
import argparse
import csv
import json
import os
import sys
import warnings

import numpy as np

from biometra.exercises import CONFIGS, load_exercise
from biometra.pose import PoseExtractor
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
    ap.add_argument("video")
    ap.add_argument("--exercise", default="press_militar", choices=sorted(CONFIGS))
    ap.add_argument("--job-id", default=None)
    ap.add_argument("--out-dir", default=os.path.join(BASE_DIR, "output"))
    ap.add_argument("--model", default=os.path.join(BASE_DIR, "models", "pose_landmarker_full.task"))
    ap.add_argument("--csv", action="store_true", help="Exporta también los landmarks en CSV")
    args = ap.parse_args()

    video = os.path.abspath(args.video)
    if not os.path.exists(video):
        emit({"estado": "error", "error": f"No existe el video: {video}"}, 1)
    if not os.path.exists(args.model):
        emit({"estado": "error", "error": f"No existe el modelo: {args.model}"}, 1)

    os.makedirs(args.out_dir, exist_ok=True)
    base = args.job_id or os.path.splitext(os.path.basename(video))[0]
    out_video = os.path.abspath(os.path.join(args.out_dir, f"{base}_pose.mp4"))
    out_csv = os.path.abspath(os.path.join(args.out_dir, f"{base}_landmarks.csv"))

    try:
        exercise = load_exercise(args.exercise)

        log("1/3 Extrayendo landmarks...")
        with PoseExtractor(args.model) as extractor:
            lm, tiempos, fps, size, info = extract_landmarks(video, extractor)

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
        if con_persona < 0.8:
            advertencias.append("La persona no se detectó en todo el video; el análisis puede ser parcial.")

        emit({
            "estado": "completado",
            "video": video,
            "video_procesado": out_video,
            "video_procesado_h264": h264,
            "datos": out_csv if args.csv else None,
            "analisis": {
                "ejercicio": exercise.key,
                "fps": round(fps, 2),
                "video_info": info,
                "titulo": exercise.title,
                "puntuacion": analysis.score,
                "metricas": analysis.metrics,
                "tipo": exercise.cfg.get("tipo", "repeticiones"),
                "repeticiones": analysis.reps,
                **analysis.extra,
                "feedback": analysis.feedback,
                "advertencias": advertencias,
            },
        })
    except SystemExit:
        raise
    except Exception as e:
        log(f"Error: {e!r}")
        emit({"estado": "error", "error": f"Error durante el análisis: {e}"}, 1)


if __name__ == "__main__":
    main()
