"""Pruebas con landmarks sintéticos (no necesitan video, MediaPipe ni OpenCV).

Ejecutar desde analisis/:   python tests/test_synthetic.py
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from biometra.exercises import load_exercise  # noqa: E402

FPS = 30


# ---------------------------------------------------------------- sentadilla (de perfil, mirando a la derecha)
def _pose_sentadilla(theta, gamma, alpha, W=1280, H=720):
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1                                   # lado izquierdo poco visible
    ankle = np.array([640.0, 650.0])
    L = T = 180.0
    a = np.radians(alpha)
    knee = ankle + L * np.array([np.sin(a), -np.cos(a)])
    d1 = (ankle - knee) / L
    th = np.radians(theta)
    R = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
    hip = knee + T * (R @ d1)
    g = np.radians(gamma)
    shoulder = hip + 220.0 * np.array([np.sin(g), -np.cos(g)])
    puntos = {12: shoulder, 24: hip, 26: knee, 28: ankle,
              30: ankle + [-25, 20], 32: ankle + [95, 25]}
    for idx, pt in puntos.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    return f


def _rep_sentadilla(theta_min, lean, t_down, t_up, knee_extra=0.0, glitch=False):
    n1, n2 = int(t_down * FPS), int(t_up * FPS)
    frames = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        theta = 172 - p * (172 - theta_min)
        gamma = (60 * np.sin(np.pi * p) + 2) if glitch else (p * lean + 2)   # glitch: el tronco se inclina a mitad de bajada y vuelve en el fondo
        frames.append(_pose_sentadilla(theta, gamma, 0.25 * (172 - theta) + p * knee_extra))
    return frames


def test_sentadilla():
    de_pie = [_pose_sentadilla(172, 2, 0)] * 30
    reps = [
        _rep_sentadilla(85, 40, 2.0, 1.5),                    # 1 buena
        _rep_sentadilla(85, 40, 2.0, 1.5),                    # 2 buena
        _rep_sentadilla(125, 35, 2.0, 1.5),                   # 3 poca profundidad
        _rep_sentadilla(85, 70, 2.0, 1.5),                    # 4 tronco muy inclinado
        _rep_sentadilla(85, 40, 0.5, 1.5),                    # 5 bajada muy rápida
        _rep_sentadilla(85, 40, 2.0, 1.5, knee_extra=25),     # 6 rodillas muy adelante
    ]
    frames = list(de_pie)
    for rp in reps:
        frames += rp + de_pie[:15]
    lm = np.stack(frames)

    res = load_exercise("sentadilla").analyze(lm, FPS, (1280, 720))
    por_codigo = {f["codigo"]: f for f in res.feedback}

    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 6, res.metrics
    assert por_codigo["profundidad"]["repeticiones"] == [3]
    assert por_codigo["inclinacion_tronco"]["repeticiones"] == [4]
    assert por_codigo["bajada_rapida"]["repeticiones"] == [5]
    assert por_codigo["rodillas_adelante"]["repeticiones"] == [6]
    assert "consistencia" in por_codigo
    assert res.score["por_repeticion"][:2] == [100, 100]
    assert res.score["global"] < 100
    print("sentadilla OK  | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- press militar
def test_press_militar():
    N = 450
    lm = np.full((N, 33, 4), 0.5, dtype=np.float32)
    lm[:, :, 3] = 0.9
    lm[:, [11, 13, 15, 23], 3] = 0.1
    t = np.arange(N) / FPS
    theta = 130 + 45 * np.cos(2 * np.pi * t / 3)
    theta[300:] = 147.5 + 27.5 * np.cos(2 * np.pi * t[300:] / 3)   # últimas reps: recorrido incompleto
    for i in range(N):
        lm[i, 12, :2] = (0.5, 0.3)
        lm[i, 14, :2] = (0.5, 0.45)
        th = np.radians(theta[i])
        lm[i, 16, :2] = (0.5 + 0.15 * np.sin(th), 0.45 - 0.15 * np.cos(th))
        lm[i, 24, :2] = (0.5 + (0.1 if 200 < i < 260 else 0.0), 0.7)   # inclinación puntual en la rep 3

    res = load_exercise("press_militar").analyze(lm, FPS, (1000, 1000))
    por_codigo = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 5, res.metrics
    assert por_codigo["recorrido_incompleto"]["repeticiones"] == [4, 5]
    assert por_codigo["compensacion_tronco"]["repeticiones"] == [3]
    assert "bloqueo_incompleto" not in por_codigo
    print("press militar OK | puntuación:", res.score["global"], res.score["por_repeticion"])



def test_coherencia_y_tiempos():
    de_pie = [_pose_sentadilla(172, 2, 0)] * 30
    secuencia = [_rep_sentadilla(85, 40, 2.0, 1.5, glitch=True)] + [_rep_sentadilla(85, 40, 2.0, 1.5)] * 3
    frames = list(de_pie)
    for rp in secuencia:
        frames += rp + de_pie[:15]
    lm = np.stack(frames)

    res = load_exercise("sentadilla").analyze(lm, FPS, (1280, 720))
    por_codigo = {f["codigo"]: f for f in res.feedback}
    assert [x["fiable"] for x in res.reps] == [False, True, True, True], [x["valores"]["cadera"] for x in res.reps[:2]]
    assert por_codigo["medicion_poco_fiable"]["repeticiones"] == [1]
    assert res.score["por_repeticion"] == [None, 100, 100, 100] and res.score["global"] == 100
    assert res.metrics["repeticiones_fiables"] == 3
    assert "profundidad" not in por_codigo and "rodillas_adelante" not in por_codigo

    # Tiempos reales: si el video va 1,6 veces más lento que el fps declarado, las duraciones escalan igual
    real = np.arange(len(lm)) / FPS * 1.6
    res2 = load_exercise("sentadilla").analyze(lm, real, (1280, 720))
    ratio = res2.reps[1]["duracion_s"] / res.reps[1]["duracion_s"]
    assert abs(ratio - 1.6) < 0.05, ratio
    print("coherencia y tiempos OK | mediciones dudosas:", por_codigo["medicion_poco_fiable"]["repeticiones"],
          "| ratio de duración:", round(ratio, 2))


def test_colocacion():
    """Movimientos de colocar/recoger la barra (poco profundos, en los extremos) no cuentan como repeticiones."""
    de_pie = [_pose_sentadilla(172, 2, 0)] * 30
    secuencia = ([_rep_sentadilla(125, 10, 1.0, 1.0)]                                   # colocarse bajo la barra
                 + [_rep_sentadilla(85, 40, 2.0, 1.5)] * 4                              # serie de trabajo
                 + [_rep_sentadilla(125, 10, 1.0, 1.0)])                                # recoger la barra
    frames = list(de_pie)
    for rp in secuencia:
        frames += rp + de_pie[:15]
    res = load_exercise("sentadilla").analyze(np.stack(frames), FPS, (1280, 720))
    por_codigo = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 6, res.metrics
    assert res.metrics["repeticiones_contadas"] == 4 and res.metrics["movimientos_colocacion"] == 2
    assert por_codigo["movimiento_colocacion"]["repeticiones"] == [1, 6]
    assert res.score["por_repeticion"] == [None, 100, 100, 100, 100, None] and res.score["global"] == 100
    assert "profundidad" not in por_codigo and "consistencia" not in por_codigo
    print("colocacion OK | ignoradas:", por_codigo["movimiento_colocacion"]["repeticiones"],
          "| contadas:", res.metrics["repeticiones_contadas"])


# ---------------------------------------------------------------- flexiones (de perfil, mirando a la derecha)
_A = np.array([250.0, 600.0])    # tobillo
_LONG, _U = 650.0, 100.0         # longitud hombro-tobillo y de cada tramo del brazo
_PHI_TOP = np.radians(17.0)
_S_TOP = _A + _LONG * np.array([np.cos(_PHI_TOP), -np.sin(_PHI_TOP)])
_WRIST = np.array([_S_TOP[0], _S_TOP[1] + 199.0])      # mano fija en el suelo


def _pose_flexion(phi_deg, hip_off=0.0, W=1280, H=720):
    phi = np.radians(phi_deg)
    hombro = _A + _LONG * np.array([np.cos(phi), -np.sin(phi)])
    v = _WRIST - hombro
    d = np.linalg.norm(v)
    u = v / d
    a = d / 2
    h = np.sqrt(max(_U ** 2 - a ** 2, 0.0))
    perp = np.array([-u[1], u[0]])
    if perp[0] > 0:
        perp = -perp                                      # el codo apunta hacia atrás (hacia los pies)
    codo = hombro + a * u + h * perp
    eje = hombro - _A
    n = np.array([eje[1], -eje[0]]) / np.linalg.norm(eje)
    if n[1] > 0:
        n = -n                                            # normal hacia arriba
    cadera = _A + 0.62 * eje + hip_off * np.linalg.norm(eje) * n
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 14: codo, 16: _WRIST, 24: cadera, 28: _A}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    return f


def _rep_flexion(phi_bottom, t_down, t_up, hip_up=0.0, hip_down=0.0):
    """hip_up: la cadera sube durante la bajada (máx. a mitad); hip_down: la cadera se hunde durante la subida.
    En ambos casos la alineación en el fondo y arriba es correcta (como en tus videos)."""
    n1, n2 = int(t_down * FPS), int(t_up * FPS)
    out = []
    for k in range(n1 + n2):
        if k < n1:
            p = 0.5 * (1 - np.cos(np.pi * k / n1))
            off = hip_up * np.sin(np.pi * k / n1)
        else:
            p = 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
            off = -hip_down * np.sin(np.pi * (k - n1) / n2)
        out.append(_pose_flexion(17.0 + p * (phi_bottom - 17.0), off))
    return out


def test_flexiones():
    arriba = [_pose_flexion(17.0)] * 30
    reps = [
        _rep_flexion(9.0, 1.5, 1.2),                    # 1 buena
        _rep_flexion(9.0, 1.5, 1.2),                    # 2 buena
        _rep_flexion(14.6, 1.5, 1.2),                   # 3 poca profundidad
        _rep_flexion(9.0, 1.5, 1.2, hip_down=0.10),     # 4 cadera se hunde al subir
        _rep_flexion(9.0, 1.5, 1.2, hip_up=0.16),       # 5 cadera sube al bajar
        _rep_flexion(9.0, 0.3, 1.2),                    # 6 bajada muy rápida
    ]
    frames = list(arriba)
    for rp in reps:
        frames += rp + arriba[:20]
    res = load_exercise("flexiones").analyze(np.stack(frames), FPS, (1280, 720))
    por_codigo = {f["codigo"]: f for f in res.feedback}

    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 6, res.metrics
    assert abs(res.reps[0]["valores"]["codo"]["min"] - 68) < 4, res.reps[0]["valores"]["codo"]
    assert abs(res.reps[0]["valores"]["alineacion"]["min"]) < 0.02, res.reps[0]["valores"]["alineacion"]
    assert por_codigo["profundidad"]["repeticiones"] == [3], por_codigo.get("profundidad")
    assert por_codigo["cadera_caida"]["repeticiones"] == [4]
    assert por_codigo["cadera_alta"]["repeticiones"] == [5]
    assert por_codigo["bajada_rapida"]["repeticiones"] == [6]
    assert "extension_incompleta" not in por_codigo
    # el hundimiento ocurre a mitad de la subida (fondo + 0,6 s), no en el fondo
    assert abs(por_codigo["cadera_caida"]["momento_s"] - (res.reps[3]["fondo_s"] + 0.6)) < 0.25, por_codigo["cadera_caida"]
    assert abs(por_codigo["cadera_alta"]["momento_s"] - (res.reps[4]["fondo_s"] - 0.75)) < 0.25, por_codigo["cadera_alta"]
    assert res.score["por_repeticion"][:2] == [100, 100]
    print("flexiones OK   | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


def test_flexiones_ignora_movimiento_posterior():
    """Tras la última repetición (p. ej. al levantarse) no se debe seguir midiendo la alineación."""
    arriba = [_pose_flexion(17.0)] * 30
    frames = list(arriba)
    for rp in [_rep_flexion(9.0, 1.5, 1.2)] * 4:
        frames += rp + arriba[:20]
    frames += [_pose_flexion(17.0, hip_off=0.30)] * 60      # al terminar, la cadera se eleva mucho
    res = load_exercise("flexiones").analyze(np.stack(frames), FPS, (1280, 720))
    codigos = {f["codigo"] for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 4, res.metrics
    assert "cadera_alta" not in codigos and "cadera_caida" not in codigos, res.feedback
    assert all(x["problemas"] == [] for x in res.reps)
    print("flexiones: movimiento posterior ignorado OK")


# ---------------------------------------------------------------- plancha (de perfil)
def _pose_plancha(phi_deg, hip_off=0.0, W=1280, H=720):
    """phi: ángulo del cuerpo sobre la horizontal (90 = de pie, ~10 = plancha)."""
    phi = np.radians(phi_deg)
    A = np.array([250.0, 600.0])
    hombro = A + 650.0 * np.array([np.cos(phi), -np.sin(phi)])
    eje = hombro - A
    n = np.array([eje[1], -eje[0]]) / np.linalg.norm(eje)
    if n[1] > 0:
        n = -n
    cadera = A + 0.62 * eje + hip_off * np.linalg.norm(eje) * n
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 24: cadera, 28: A}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    return f


def _secuencia_plancha(offset_fn, dur=30.0):
    """2 s de pie, 1 s para colocarse, `dur` s de plancha, 1 s para levantarse, 1 s de pie."""
    fr = [_pose_plancha(90)] * int(2 * FPS)
    fr += [_pose_plancha(90 - 80 * k / FPS) for k in range(FPS)]
    fr += [_pose_plancha(10, offset_fn(k / FPS)) for k in range(int(dur * FPS))]
    fr += [_pose_plancha(10 + 80 * k / FPS) for k in range(FPS)]
    fr += [_pose_plancha(90)] * FPS
    return np.stack(fr)


def _ruido(s):
    return 0.01 * np.sin(2 * np.pi * s / 3)


def test_plancha():
    import json
    ex = load_exercise("plancha")

    # 1) buena: cadera ligeramente alta pero estable
    res = ex.analyze(_secuencia_plancha(lambda s: 0.02 + _ruido(s)), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["plancha_detectada"] and 29 <= res.metrics["duracion_mantenida_s"] <= 32, res.metrics
    assert abs(res.metrics["inicio_s"] - 2.7) < 0.5, res.metrics
    assert set(cod) == {"buena_ejecucion"}, list(cod)
    assert res.score["global"] == 100
    assert all(s["estado"] == "ok" for s in res.extra["linea_tiempo"]) and len(res.extra["linea_tiempo"]) >= 5
    json.dumps([res.metrics, res.feedback, res.score, res.extra])          # serializable

    # 2) se hunde con el tiempo: 0 hasta los 10 s, baja a -0.15 a los 20 s y se queda ahí
    def hunde(s):
        return (0.0 if s < 10 else -0.15 * min((s - 10) / 10, 1.0)) + _ruido(s)
    res = ex.analyze(_secuencia_plancha(hunde), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert {"cadera_caida", "deriva_hundimiento", "inestabilidad"} <= set(cod), list(cod)
    assert "cadera_alta" not in cod and "deriva_elevacion" not in cod
    assert 0.4 < cod["cadera_caida"]["valor_peor"] < 0.6, cod["cadera_caida"]
    assert cod["cadera_caida"]["momento_s"] > 22, cod["cadera_caida"]
    estados = [s["estado"] for s in res.extra["linea_tiempo"]]
    assert estados[0] == "ok" and estados[-1] == "hundida", estados
    assert res.score["global"] < 60, res.score
    print("plancha: se hunde con el tiempo OK | nota:", res.score["global"], "| línea de tiempo:", estados)
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")

    # 3) cadera alta constante
    res = ex.analyze(_secuencia_plancha(lambda s: 0.20 + _ruido(s)), FPS, (1280, 720))
    cod = {f["codigo"] for f in res.feedback}
    assert "cadera_alta" in cod and "cadera_caida" not in cod and "deriva_elevacion" not in cod, cod
    print("plancha: cadera alta fija OK")

    # 4) no hay plancha
    de_pie = np.stack([_pose_plancha(90)] * 300)
    res = ex.analyze(de_pie, FPS, (1280, 720))
    assert res.metrics["plancha_detectada"] is False and res.feedback[0]["codigo"] == "sin_plancha"
    assert res.score["global"] is None
    print("plancha: sin plancha OK")



def test_plancha_hundimientos_breves():
    """Hundimientos de ~1 s (como en tu video): no son el 20 % del tiempo, pero deben reportarse."""
    import json
    def dips(s):
        for s0 in (4.0, 15.0):
            if s0 <= s < s0 + 1.0:
                return -0.12 * np.sin(np.pi * (s - s0))
        return 0.0
    res = load_exercise("plancha").analyze(_secuencia_plancha(lambda s: dips(s) + _ruido(s)), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert "cadera_caida" not in cod and "inestabilidad" not in cod and "deriva_hundimiento" not in cod, list(cod)
    h = cod["hundimiento_momentaneo"]
    assert h["valor_peor"] == 2.0 and len(h["momentos_s"]) == 2, h
    assert abs(h["momentos_s"][0] - 7.5) < 0.5 and abs(h["momentos_s"][1] - 18.5) < 0.5, h["momentos_s"]
    assert res.score["global"] == 85, res.score
    assert len(res.extra["episodios"]) == 2
    assert sum(w["n_episodios"] for w in res.extra["linea_tiempo"]) == 2
    assert all(w["estado"] == "ok" for w in res.extra["linea_tiempo"])       # la media por ventana los diluye
    assert min(v for v in res.extra["serie"]["valor"] if v is not None) < -0.09
    json.dumps(res.extra)
    print("plancha: hundimientos breves OK |", h["mensaje"])

def test_plancha_render():
    """Humo: el overlay de la plancha se dibuja sobre un video real sin errores."""
    import cv2
    from biometra.video_io import render_video
    lm = _secuencia_plancha(lambda s: 0.02, dur=6.0)
    res = load_exercise("plancha").analyze(lm, FPS, (1280, 720))
    src, out = "/tmp/_plancha_src.mp4", "/tmp/_plancha_out.mp4"
    w = cv2.VideoWriter(src, cv2.VideoWriter_fourcc(*"mp4v"), FPS, (1280, 720))
    for _ in range(len(lm)):
        w.write(np.zeros((720, 1280, 3), np.uint8))
    w.release()
    render_video(src, out, lm, FPS, (1280, 720), res.overlay, res.highlight)
    cap = cv2.VideoCapture(out)
    assert cap.isOpened() and cap.read()[0]
    cap.release()
    print("plancha: render del overlay OK")

# ---------------------------------------------------------------- calidad
def test_sin_datos_fiables():
    """Con la rodilla casi invisible no debe inventar feedback sobre ella."""
    lm = np.stack([_pose_sentadilla(172, 2, 0)] * 90)
    lm[:, [24, 26, 28], 3] = 0.2
    res = load_exercise("sentadilla").analyze(lm, FPS, (1280, 720))
    assert res.metrics["repeticiones_detectadas"] == 0
    assert res.feedback[0]["codigo"] == "sin_repeticiones"
    print("sin datos OK")


if __name__ == "__main__":
    test_sentadilla()
    test_press_militar()
    test_sin_datos_fiables()
    test_coherencia_y_tiempos()
    test_colocacion()
    test_flexiones()
    test_flexiones_ignora_movimiento_posterior()
    test_plancha()
    test_plancha_hundimientos_breves()
    test_plancha_render()
    print("\nTodas las pruebas pasaron")
