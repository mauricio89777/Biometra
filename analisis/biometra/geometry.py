"""Funciones geométricas 2D sobre landmarks normalizados de MediaPipe."""
import numpy as np


def angle_2d(a, b, c, w, h):
    """Ángulo (grados) en el vértice b, formado por los segmentos b->a y b->c.

    a, b, c: (x, y) normalizados [0-1]. Se escalan a píxeles (w, h) para
    no distorsionar el ángulo en videos que no son cuadrados.
    """
    ba = np.array([(a[0] - b[0]) * w, (a[1] - b[1]) * h])
    bc = np.array([(c[0] - b[0]) * w, (c[1] - b[1]) * h])
    norma = np.linalg.norm(ba) * np.linalg.norm(bc)
    if norma == 0:
        return float("nan")
    cos = np.clip(np.dot(ba, bc) / norma, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))


def lean_from_vertical(top, bottom, w, h):
    """Inclinación (grados, con signo) del segmento bottom->top respecto a la vertical."""
    dx = (top[0] - bottom[0]) * w
    dy = (bottom[1] - top[1]) * h  # y de imagen crece hacia abajo
    return float(np.degrees(np.arctan2(dx, dy)))
