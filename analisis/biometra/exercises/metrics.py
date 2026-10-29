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

  vertical_gap    4 puntos [a, b, c, d]
                  -> cuánto queda b por DEBAJO de a (positivo = más bajo en la imagen), en longitudes de c-d.
                     Ej.: [hombro, muñeca, hombro, cadera] = altura de la mano respecto al hombro, en longitudes
                     de tronco (trayectoria de la barra en el jalón).
  heel_rise       5 puntos [talón, punta, cadera, rodilla, tobillo]
                  -> cuánto sube el talón respecto a la punta del pie (que queda apoyada), en longitudes de pierna
  point_segment_distance
                  4 puntos [punto, a, b, c] -> distancia del punto a la poligonal a-b-c (la más corta de sus dos
                  tramos), dividida por la longitud a-b-c. Ej.: [muñeca, cadera, rodilla, tobillo] = cuánto se
                  aleja la barra (muñeca) de la pierna en el peso muerto.
  ankle_ahead     5 puntos [cadera, rodilla, tobillo, talón, punta] (del lado analizado)
                  -> cuánto queda el tobillo por delante (+) o por detrás (-) de la cadera, en longitudes de
                     pierna, mirando hacia donde mira la persona. En una zancada, el signo en el punto más bajo
                     dice si la pierna visible es la delantera (+) o la trasera (-).
  shin_forward    6 puntos [rodilla_a, tobillo_a, rodilla_b, tobillo_b, talón, punta] (los dos lados + pie de
                  referencia para saber hacia dónde mira la persona)
                  -> inclinación (grados) de la espinilla de la PIERNA DELANTERA respecto a la vertical;
                     positivo = rodilla por delante del tobillo
  distance_ratio 5 puntos [a, b, ref1, ref2, ref3]
                  -> distancia a-b dividida por la longitud ref1-ref2-ref3 (p. ej. separación entre tobillos
                     / longitud de la pierna cadera-rodilla-tobillo; sirve para la longitud del paso)
  derived         sin puntos: {"type": "derived", "op": ..., "from": [métricas]}, frame a frame:
                    min | max | mean   ignoran las que no se pudieron medir (ej.: rodilla más flexionada de las dos)
                    diff | absdiff     a - b y |a - b|; necesitan las dos (ej.: simetría entre brazos)

Prefijos de punto: izq_hip, der_ankle... fijan el lado; sin prefijo se usa el lado mejor visible.

Campo opcional "vis_min": visibilidad mínima de esta métrica (por defecto, la del ejercicio).
Campo opcional "mode": un modo o una lista de modos, aplicados en orden:
  absolute   valor absoluto (útil para lean cuando solo importa cuánto se inclina)
  deviation  desviación absoluta respecto a la postura inicial (mediana de los primeros 20 frames válidos)
  sobre_base resta el percentil 10 (percentil_base) de la propia señal: nivel de reposo del video
  desde_horizontal  90 - |lean|: elevación de un segmento sobre la horizontal (tronco de una persona tumbada)
"""
import numpy as np

from ..geometry import angle_2d, lean_from_vertical
from .utils import SIDES, smooth


def indice(nombre, ids):
    """Índice de landmark. Con prefijo izq_/der_ se fija el lado; sin prefijo, el lado analizado."""
    if nombre.startswith("izq_"):
        return SIDES["izquierdo"][nombre[4:]]
    if nombre.startswith("der_"):
        return SIDES["derecho"][nombre[4:]]
    return ids[nombre]


def es_fijo(nombre):
    return nombre.startswith(("izq_", "der_"))


def _dist_segmento(q, u, v, w, h):
    """Distancia (px) del punto q al segmento u-v. Todos en coordenadas normalizadas."""
    qq, uu, vv = (np.array([z[0] * w, z[1] * h]) for z in (q, u, v))
    d = vv - uu
    l2 = float(np.dot(d, d))
    t = 0.0 if l2 == 0 else float(np.clip(np.dot(qq - uu, d) / l2, 0.0, 1.0))
    return float(np.linalg.norm(qq - (uu + t * d)))


def raw_series(lm, spec, ids, w, h, vis_min):
    idx = [indice(n, ids) for n in spec["points"]]
    kind = spec["type"]
    vmin = spec.get("vis_min", vis_min)        # cada métrica puede fijar su propia visibilidad mínima
    out = np.full(len(lm), np.nan)
    sentido_global = None
    if kind == "ankle_ahead":
        # Hacia dónde mira la persona, una sola vez para todo el video: mediana de (punta - talón) del pie
        # cercano con una visibilidad más permisiva (solo se usa el signo).
        talon_i, punta_i = idx[3], idx[4]
        with np.errstate(invalid="ignore"):
            ok = np.all(lm[:, [talon_i, punta_i], 3] >= 0.3, axis=1)
        if ok.any():
            sentido_global = float(np.sign(np.median(lm[ok, punta_i, 0] - lm[ok, talon_i, 0]))) or None
    for i, f in enumerate(lm):
        p = f[idx]
        visibles = p[:3] if kind == "ankle_ahead" else p       # en ankle_ahead solo exigen cadera, rodilla y tobillo
        with np.errstate(invalid="ignore"):
            if not np.all(visibles[:, 3] >= vmin):
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
        elif kind == "vertical_gap":
            ref_a, pt_b, c1, c2 = p[:, :2]
            escala = np.hypot((c1[0] - c2[0]) * w, (c1[1] - c2[1]) * h)
            if escala > 0:
                out[i] = (pt_b[1] - ref_a[1]) * h / escala
        elif kind == "heel_rise":
            talon, punta, cad, rod, tob = p[:, :2]
            pierna = (np.hypot((cad[0] - rod[0]) * w, (cad[1] - rod[1]) * h)
                      + np.hypot((rod[0] - tob[0]) * w, (rod[1] - tob[1]) * h))
            if pierna > 0:
                out[i] = (punta[1] - talon[1]) * h / pierna
        elif kind == "point_segment_distance":
            pt, a_, b_, c_ = p[:, :2]
            pierna = (np.hypot((a_[0] - b_[0]) * w, (a_[1] - b_[1]) * h)
                      + np.hypot((b_[0] - c_[0]) * w, (b_[1] - c_[1]) * h))
            if pierna > 0:
                out[i] = min(_dist_segmento(pt, a_, b_, w, h), _dist_segmento(pt, b_, c_, w, h)) / pierna
        elif kind == "ankle_ahead":
            if sentido_global is None:
                continue
            cad, rod, tob = p[:3, :2]
            pierna = (np.hypot((cad[0] - rod[0]) * w, (cad[1] - rod[1]) * h)
                      + np.hypot((rod[0] - tob[0]) * w, (rod[1] - tob[1]) * h))
            if pierna > 0:
                out[i] = sentido_global * (tob[0] - cad[0]) * w / pierna
        elif kind == "shin_forward":
            k1, a1, k2, a2, talon, punta = p[:, :2]
            sentido = np.sign(punta[0] - talon[0]) or 1.0       # hacia dónde mira la persona
            # pierna delantera = la de tobillo más adelantado en el sentido de la marcha
            rodi, tob = (k1, a1) if (a1[0] - a2[0]) * sentido >= 0 else (k2, a2)
            dx = sentido * (rodi[0] - tob[0]) * w
            dy = (tob[1] - rodi[1]) * h
            out[i] = float(np.degrees(np.arctan2(dx, dy)))
        elif kind == "distance_ratio":
            u, v, c1, c2, c3 = p[:, :2]

            def dist(q, z):
                return np.hypot((q[0] - z[0]) * w, (q[1] - z[1]) * h)
            pierna = dist(c1, c2) + dist(c2, c3)
            if pierna > 0:
                out[i] = dist(u, v) / pierna
        else:
            raise ValueError(f"Tipo de métrica desconocido: {kind}")
    return out


def build_series(lm, spec, ids, w, h, vis_min):
    """Devuelve (serie_cruda, serie_suavizada). Los NaN de la cruda indican puntos poco visibles."""
    raw = raw_series(lm, spec, ids, w, h, vis_min)
    sm = smooth(raw)
    modos = spec.get("mode") or []
    if isinstance(modos, str):
        modos = [modos]
    for mode in modos:                      # se aplican en el orden indicado
        if mode == "absolute":
            sm = np.abs(sm)
        elif mode == "desde_horizontal":
            sm = 90.0 - np.abs(sm)          # lean (desde la vertical) -> elevación sobre la horizontal
        elif mode == "sobre_base":
            # resta el nivel de reposo del propio video (percentil bajo): independiente del calzado, del suelo
            # y de dónde coloque el modelo los puntos en reposo
            if (~np.isnan(sm)).any():
                sm = sm - np.nanpercentile(sm, spec.get("percentil_base", 10))
        elif mode == "deviation":
            base = sm[~np.isnan(sm)][:20]
            sm = np.abs(sm - np.median(base)) if len(base) else np.full_like(sm, np.nan)
        else:
            raise ValueError(f"Modo desconocido: {mode}")
    return raw, sm


def _combinar(op, arrs):
    arrs = [np.asarray(a, dtype=float) for a in arrs]
    if op in ("min", "max"):
        fn = np.fmin if op == "min" else np.fmax
        out = arrs[0]
        for a in arrs[1:]:
            out = fn(out, a)
        return out
    if op == "mean":                                  # media de las que se pudieron medir
        st = np.vstack(arrs)
        n = np.sum(~np.isnan(st), axis=0)
        return np.where(n > 0, np.nansum(st, axis=0) / np.maximum(n, 1), np.nan)
    if op in ("diff", "absdiff"):                     # requiere las dos medidas
        d = arrs[0] - arrs[1]
        return np.abs(d) if op == "absdiff" else d
    raise ValueError(f"Operación derivada desconocida: {op}")


def build_all(lm, specs, ids, w, h, vis_min):
    """Series (crudas, suavizadas) de todas las métricas, incluidas las derivadas."""
    raws, series = {}, {}
    for name, spec in specs.items():
        if spec["type"] != "derived":
            raws[name], series[name] = build_series(lm, spec, ids, w, h, vis_min)
    for name, spec in specs.items():
        if spec["type"] == "derived":
            raws[name] = _combinar(spec["op"], [raws[k] for k in spec["from"]])
            series[name] = _combinar(spec["op"], [series[k] for k in spec["from"]])
    return {k: raws[k] for k in specs}, {k: series[k] for k in specs}
