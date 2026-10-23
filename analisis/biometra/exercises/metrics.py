"""Cálculo de métricas por frame a partir de los landmarks.

Tipos disponibles (campo "type" en la configuración):
  angle           3 puntos [a, vértice, c]            -> ángulo en grados
  lean            2 puntos [abajo, arriba]            -> inclinación respecto a la vertical (grados, con signo)
  forward_offset  4 puntos [rodilla, tobillo, talón, punta]
                  -> cuánto sobrepasa la rodilla a la punta del pie, en longitudes de tibia
                     (positivo = rodilla por delante de la punta; independiente de hacia dónde mire la persona)

  line_offset     3 puntos [extremo_a, punto, extremo_c]
                  -> desviación del punto respecto a la recta a-c, en longitudes de a-c.
                     Positivo = el punto queda POR ENCIMA de la recta (en la imagen), negativo = por debajo.
                     Ej.: [shoulder, hip, ankle] en flexiones: + cadera elevada, - cadera caída.

Campo opcional "mode":
  absolute   valor absoluto (útil para lean cuando solo importa cuánto se inclina)
  deviation  desviación absoluta respecto a la postura inicial (mediana de los primeros 20 frames válidos)
"""
import numpy as np

from ..geometry import angle_2d, lean_from_vertical
from .utils import smooth


def raw_series(lm, spec, ids, w, h, vis_min):
    idx = [ids[n] for n in spec["points"]]
    kind = spec["type"]
    out = np.full(len(lm), np.nan)
    for i, f in enumerate(lm):
        p = f[idx]
        with np.errstate(invalid="ignore"):
            if not np.all(p[:, 3] >= vis_min):
                continue
        if kind == "angle":
            out[i] = angle_2d(p[0, :2], p[1, :2], p[2, :2], w, h)
        elif kind == "lean":
            out[i] = lean_from_vertical(p[1, :2], p[0, :2], w, h)
        elif kind == "forward_offset":
            knee, ankle, heel, toe = p[:, :2]
            sentido = np.sign(toe[0] - heel[0]) or 1.0
            tibia = np.hypot((knee[0] - ankle[0]) * w, (knee[1] - ankle[1]) * h)
            if tibia > 0:
                out[i] = sentido * (knee[0] - toe[0]) * w / tibia
        elif kind == "line_offset":
            a_, b_, c_ = p[:, :2]
            ac = np.array([(c_[0] - a_[0]) * w, (c_[1] - a_[1]) * h])
            largo = np.linalg.norm(ac)
            if largo > 0:
                ab = np.array([(b_[0] - a_[0]) * w, (b_[1] - a_[1]) * h])
                n = np.array([ac[1], -ac[0]]) / largo   # normal a la recta
                if n[1] > 0:                             # que apunte hacia arriba en la imagen
                    n = -n
                out[i] = float(np.dot(ab, n) / largo)
        else:
            raise ValueError(f"Tipo de métrica desconocido: {kind}")
    return out


def build_series(lm, spec, ids, w, h, vis_min):
    """Devuelve (serie_cruda, serie_suavizada). Los NaN de la cruda indican puntos poco visibles."""
    raw = raw_series(lm, spec, ids, w, h, vis_min)
    sm = smooth(raw)
    mode = spec.get("mode")
    if mode == "absolute":
        sm = np.abs(sm)
    elif mode == "deviation":
        base = sm[~np.isnan(sm)][:20]
        sm = np.abs(sm - np.median(base)) if len(base) else np.full_like(sm, np.nan)
    return raw, sm
