"""Base reutilizable para ejercicios con repeticiones medidas por el ángulo de una articulación.

Para añadir un ejercicio nuevo: subclase con `joint`, `low`, `high`, `trunk`
y un `build_feedback`.
"""
from dataclasses import dataclass

import numpy as np

from ..geometry import angle_2d, lean_from_vertical

# Índices de MediaPipe Pose por lado del cuerpo
SIDES = {
    "izquierdo": dict(shoulder=11, elbow=13, wrist=15, hip=23, knee=25, ankle=27),
    "derecho": dict(shoulder=12, elbow=14, wrist=16, hip=24, knee=26, ankle=28),
}


def r(x, n=1):
    """Redondea y convierte NaN a None (JSON válido)."""
    if x is None or np.isnan(x):
        return None
    return round(float(x), n)


def smooth(x, window=5, max_gap=15):
    """Interpola huecos cortos y aplica media móvil centrada. Huecos largos quedan NaN."""
    x = np.asarray(x, dtype=float)
    valid = ~np.isnan(x)
    if valid.sum() < 2:
        return x
    idx = np.arange(len(x))
    filled = np.interp(idx, idx[valid], x[valid])

    mask = np.zeros(len(x), dtype=bool)
    start = None
    for i, v in enumerate(valid):
        if not v and start is None:
            start = i
        if start is not None and (v or i == len(x) - 1):
            end = i if v else i + 1
            if end - start > max_gap:
                mask[start:end] = True
            start = None

    pad = window // 2
    padded = np.pad(filled, (pad, pad), mode="edge")
    out = np.convolve(padded, np.ones(window) / window, mode="valid")
    out[mask] = np.nan
    return out


@dataclass
class Analysis:
    side: str
    metrics: dict
    reps: list
    feedback: list
    overlay: list      # líneas de texto por frame
    highlight: list    # landmarks a resaltar en el video


class AngleRepExercise:
    key = ""
    title = ""
    camera = ""
    joint = ("shoulder", "elbow", "wrist")  # vértice en el medio
    trunk = ("hip", "shoulder")             # (abajo, arriba) o None
    low = 110    # ángulo a alcanzar para contar el recorrido como completo
    high = 155   # ángulo que marca "extendido" (cierre de repetición)
    vis_min = 0.5
    min_rep_s = 0.5
    min_swing = 25

    # ---------- API ----------
    def analyze(self, lm, fps, size):
        w, h = size
        side = self._pick_side(lm)
        ids = SIDES[side]
        joint_ids = [ids[k] for k in self.joint]

        angles = smooth(self._angle_series(lm, joint_ids, w, h))
        trunk_dev = self._trunk_deviation(lm, ids, w, h)
        reps = self._count_reps(angles, trunk_dev, fps)
        metrics = self._metrics(lm, angles, reps, trunk_dev, side)
        feedback = self.build_feedback(reps, metrics)
        overlay = self._overlay(angles, trunk_dev, reps)
        highlight = joint_ids + ([ids[k] for k in self.trunk] if self.trunk else [])
        return Analysis(side, metrics, reps, feedback, overlay, highlight)

    def build_feedback(self, reps, metrics):
        raise NotImplementedError

    # ---------- internos ----------
    def _pick_side(self, lm):
        names = list(self.joint) + (list(self.trunk) if self.trunk else [])
        scores = {}
        for side, ids in SIDES.items():
            cols = [ids[n] for n in names]
            scores[side] = float(np.nan_to_num(lm[:, cols, 3]).mean())
        return max(scores, key=scores.get)

    def _visible(self, pts):
        with np.errstate(invalid="ignore"):
            return bool(np.all(pts[:, 3] >= self.vis_min))

    def _angle_series(self, lm, joint_ids, w, h):
        out = np.full(len(lm), np.nan)
        for i, f in enumerate(lm):
            p = f[joint_ids]
            if self._visible(p):
                out[i] = angle_2d(p[0, :2], p[1, :2], p[2, :2], w, h)
        return out

    def _trunk_deviation(self, lm, ids, w, h):
        """Desviación del tronco respecto a su postura inicial (grados, valor absoluto)."""
        n = len(lm)
        if not self.trunk:
            return np.full(n, np.nan)
        bottom, top = ids[self.trunk[0]], ids[self.trunk[1]]
        lean = np.full(n, np.nan)
        for i, f in enumerate(lm):
            p = f[[bottom, top]]
            if self._visible(p):
                lean[i] = lean_from_vertical(p[1, :2], p[0, :2], w, h)
        lean = smooth(lean)
        base = lean[~np.isnan(lean)][:20]
        if len(base) == 0:
            return np.full(n, np.nan)
        return np.abs(lean - np.median(base))

    def _count_reps(self, angles, trunk_dev, fps):
        """Una repetición va desde que el ángulo baja de `enter` hasta que vuelve a
        `high` (extensión). Se cierra al salir de la zona de extensión (o al terminar
        el video) para medir el pico real de extensión."""
        reps, start, top = [], None, None
        enter = self.high - 8  # histéresis para no iniciar/cerrar por ruido

        def cerrar(end):
            seg = angles[start:end + 1]
            amin, amax = np.nanmin(seg), np.nanmax(seg)
            dur = (top - start) / fps
            if dur >= self.min_rep_s and (amax - amin) >= self.min_swing:
                dev = np.nanmax(trunk_dev[start:top + 1]) if self.trunk else np.nan
                reps.append({
                    "indice": len(reps) + 1,
                    "frame_inicio": int(start),
                    "frame_fin": int(top),
                    "inicio_s": r(start / fps, 2),
                    "fin_s": r(top / fps, 2),
                    "duracion_s": r(dur, 2),
                    "angulo_min": r(amin),
                    "angulo_max": r(amax),
                    "recorrido_completo": bool(amin <= self.low),
                    "desviacion_tronco_max": r(dev),
                })

        for i, a in enumerate(angles):
            if np.isnan(a):
                continue
            if start is None:
                if a < enter:
                    start, top = i, None
                continue
            if top is None:
                if a >= self.high:
                    top = i
            elif a < enter:           # sale de la zona de extensión: cierra y arranca la siguiente
                cerrar(i)
                start, top = i, None
        if start is not None and top is not None:
            cerrar(len(angles) - 1)
        return reps

    def _metrics(self, lm, angles, reps, trunk_dev, side):
        valid = ~np.isnan(angles)
        completas = [x for x in reps if x["recorrido_completo"]]
        return {
            "lado_analizado": side,
            "frames_procesados": int(len(lm)),
            "porcentaje_frames_con_persona": r((~np.isnan(lm[:, 0, 0])).mean() * 100),
            "porcentaje_frames_utiles": r(valid.mean() * 100),
            "repeticiones_detectadas": len(reps),
            "repeticiones_completas": len(completas),
            "angulo_minimo": r(np.nanmin(angles)) if valid.any() else None,
            "angulo_maximo": r(np.nanmax(angles)) if valid.any() else None,
            "duracion_media_rep_s": r(np.mean([x["duracion_s"] for x in reps]), 2) if reps else None,
            "desviacion_tronco_max": r(np.nanmax(trunk_dev)) if self.trunk and not np.all(np.isnan(trunk_dev)) else None,
            "unidad_angular": "grados",
        }

    def _overlay(self, angles, trunk_dev, reps):
        n = len(angles)
        hechas = np.zeros(n, dtype=int)
        for rep in reps:
            if rep["recorrido_completo"]:
                hechas[rep["frame_fin"]:] += 1
        lines = []
        for i in range(n):
            ln = [f"{self.title}: {hechas[i]} reps"]
            if not np.isnan(angles[i]):
                ln.append(f"Angulo: {angles[i]:.0f} deg")
            if self.trunk and not np.isnan(trunk_dev[i]):
                ln.append(f"Tronco: {trunk_dev[i]:.0f} deg")
            lines.append(ln)
        return lines
