"""Lectura de video, extracción de landmarks y render del video anotado."""
import os
import shutil
import subprocess
import sys

import cv2
import numpy as np

# Conexiones del esqueleto (índices de MediaPipe Pose)
CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
    (11, 23), (12, 24), (23, 24), (23, 25), (25, 27),
    (24, 26), (26, 28), (27, 29), (29, 31), (28, 30), (30, 32),
]


def log(msg):
    print(f"[biometra] {msg}", file=sys.stderr, flush=True)


def extract_landmarks(video_path, extractor):
    """Primera pasada: landmarks de todos los frames.

    Devuelve (landmarks[N,33,4] con NaN donde no hubo persona, tiempos[N] en segundos,
    fps_efectivo, (w, h), info).

    Los tiempos salen de los timestamps reales de cada frame (CAP_PROP_POS_MSEC) y no de
    frame/fps: en videos con frame rate variable (p. ej. .webm grabados desde el navegador)
    el fps declarado y el nº de frames del contenedor pueden ser incorrectos.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"No se pudo abrir el video: {video_path}")

    fps_decl = cap.get(cv2.CAP_PROP_FPS)
    if not fps_decl or fps_decl <= 0 or fps_decl > 240:
        fps_decl = 30.0
    total_decl = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    frames, pos_ms, size, last_ts = [], [], None, -1
    vacio = np.full((33, 4), np.nan, dtype=np.float32)
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            i = len(frames)
            pos = cap.get(cv2.CAP_PROP_POS_MSEC)
            pos_ms.append(pos)
            if size is None:
                size = (frame.shape[1], frame.shape[0])  # respeta la rotación aplicada
                log(f"Video {size[0]}x{size[1]}, fps declarado {fps_decl:.1f}")
            ts = int(pos) if pos and pos > 0 else int(i * 1000 / fps_decl)
            ts = max(ts, last_ts + 1)  # MediaPipe exige timestamps estrictamente crecientes
            last_ts = ts
            lm = extractor.detect(frame, ts)
            frames.append(lm if lm is not None else vacio)
            if (i + 1) % 100 == 0:
                log(f"Landmarks: {i + 1} frames")
    finally:
        cap.release()

    n = len(frames)
    if n == 0:
        raise ValueError("El video no contiene frames legibles")

    t = np.array(pos_ms, dtype=float) / 1000.0
    if n >= 2 and np.all(np.diff(t) >= 0) and t[-1] > t[0]:
        tiempos, origen = t - t[0], "timestamps reales"
    else:
        tiempos, origen = np.arange(n) / fps_decl, "fps declarado"
    duracion = float(tiempos[-1]) if n > 1 else 0.0
    fps_ef = (n - 1) / duracion if duracion > 0 else fps_decl

    info = {"frames_leidos": n, "frames_declarados": total_decl, "fps_declarado": round(fps_decl, 2),
            "fps_efectivo": round(fps_ef, 2), "duracion_s": round(duracion, 2), "tiempos_desde": origen}
    log(f"{n} frames, {duracion:.1f} s, fps efectivo {fps_ef:.1f} (tiempos: {origen})")
    if abs(fps_ef - fps_decl) / fps_decl > 0.1 or (total_decl and abs(n - total_decl) / total_decl > 0.1):
        log("AVISO: metadatos del video inconsistentes (frame rate variable); se usan los tiempos reales")
    return np.stack(frames), tiempos, fps_ef, size, info


def render_video(video_path, out_path, landmarks, fps, size, overlay, highlight):
    """Segunda pasada: dibuja esqueleto y texto sobre cada frame."""
    w, h = size
    cap = cv2.VideoCapture(video_path)
    writer = cv2.VideoWriter(out_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
    resaltar = set(highlight)
    try:
        for i in range(len(landmarks)):
            ok, frame = cap.read()
            if not ok:
                break
            lm = landmarks[i]
            if not np.isnan(lm[0, 0]):
                pts = {k: (int(lm[k, 0] * w), int(lm[k, 1] * h)) for k in range(33)}
                for a, b in CONNECTIONS:
                    color = (0, 255, 0) if a in resaltar and b in resaltar else (255, 120, 0)
                    cv2.line(frame, pts[a], pts[b], color, 3)
                for k in resaltar:
                    cv2.circle(frame, pts[k], 6, (0, 255, 0), -1)
            lineas, color = overlay[i]
            for n, texto in enumerate(lineas):
                cv2.putText(frame, texto, (20, 35 + 30 * n), cv2.FONT_HERSHEY_SIMPLEX,
                            0.8, color, 2, cv2.LINE_AA)
            writer.write(frame)
    finally:
        cap.release()
        writer.release()
    return to_h264(out_path)


def to_h264(path):
    """Recodifica a H.264 para que el <video> del navegador lo reproduzca."""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        log("ffmpeg no encontrado: el video quedará en mp4v (puede no verse en navegadores)")
        return False
    tmp = path + ".tmp.mp4"
    r = subprocess.run(
        [ffmpeg, "-y", "-i", path, "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", "-an", tmp],
        capture_output=True,
    )
    if r.returncode != 0:
        log("Falló la recodificación a H.264")
        return False
    os.replace(tmp, path)
    return True
