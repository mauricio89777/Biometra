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



# ---------------------------------------------------------------- zancada (de perfil, mirando a la derecha)
def _pose_zancada(y_h, S, lean_deg, near_front=True, W=1280, H=720):
    """Dos piernas con cinemática inversa. S = separación entre tobillos (px); la pierna mide 360 px."""
    T = L = 180.0
    cx = 640.0
    hip = np.array([cx, y_h])
    ank_f, ank_r = np.array([cx + S / 2, 640.0]), np.array([cx - S / 2, 640.0])

    def rodilla(ank):
        v = ank - hip
        d = np.linalg.norm(v)
        u = v / d
        a = d / 2
        h = np.sqrt(max(T ** 2 - a ** 2, 0.0))
        perp = np.array([-u[1], u[0]])
        if perp[0] < 0:
            perp = -perp                      # la rodilla siempre se dobla hacia delante
        return hip + a * u + h * perp

    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    cerca, lejos = (ank_f, ank_r) if near_front else (ank_r, ank_f)
    g = np.radians(lean_deg)
    hombro = hip + 250.0 * np.array([np.sin(g), -np.cos(g)])
    pts = {12: (hombro, 0.95), 24: (hip, 0.95), 26: (rodilla(cerca), 0.95), 28: (cerca, 0.95),
           30: (cerca + [-25, 20], 0.95), 32: (cerca + [95, 25], 0.95),
           23: (hip, 0.9), 25: (rodilla(lejos), 0.9), 27: (lejos, 0.9)}
    for idx, (pt, vis) in pts.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = vis
    f[0, :2] = 0.5
    return f


def _rep_zancada(S, y_bot, lean, t_down=1.5, t_up=1.2, near_front=True):
    y_top = 640.0 - np.sqrt(max(360.0 ** 2 - (S / 2) ** 2, 1.0))
    n1, n2 = int(t_down * FPS), int(t_up * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_zancada(y_top + p * (y_bot - y_top), S, 5 + p * (lean - 5), near_front))
    return out


def _serie_zancadas(reps):
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    return np.stack(frames)


def test_zancada():
    import json
    ex = load_exercise("zancada")
    reps = [
        _rep_zancada(360, 460, 10),    # 1 buena (rodillas ~90°, paso = 1,0 x pierna)
        _rep_zancada(360, 460, 10),    # 2 buena
        _rep_zancada(360, 380, 10),    # 3 poca profundidad (rodilla ~123°)
        _rep_zancada(360, 460, 45),    # 4 tronco muy inclinado
        _rep_zancada(200, 430, 10),    # 5 paso corto
        _rep_zancada(500, 530, 10),    # 6 paso largo
        _rep_zancada(60, 400, 10),     # 7 paso mínimo: espinilla muy inclinada hacia delante
    ]
    res = ex.analyze(_serie_zancadas(reps), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 7, res.metrics
    assert abs(res.reps[0]["valores"]["rodilla"]["min"] - 90) < 4, res.reps[0]["valores"]["rodilla"]
    assert abs(res.reps[0]["valores"]["paso"]["en_fondo"] - 1.0) < 0.05, res.reps[0]["valores"]["paso"]
    assert cod["profundidad"]["repeticiones"] == [3], cod.get("profundidad")
    assert cod["inclinacion_tronco"]["repeticiones"] == [4]
    assert cod["paso_corto"]["repeticiones"] == [5, 7]
    assert cod["rodilla_adelantada"]["repeticiones"] == [7], cod.get("rodilla_adelantada")
    assert cod["paso_largo"]["repeticiones"] == [6]
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.metrics, res.reps, res.feedback, res.score])
    print("zancada OK     | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")

    # la pierna cercana a la cámara es la TRASERA: debe dar el mismo resultado limpio
    buenas = [_rep_zancada(360, 460, 10, near_front=False) for _ in range(3)]
    res = ex.analyze(_serie_zancadas(buenas), FPS, (1280, 720))
    assert res.metrics["repeticiones_detectadas"] == 3
    assert {f["codigo"] for f in res.feedback} == {"buena_ejecucion"}, res.feedback
    assert res.score["global"] == 100
    print("zancada: pierna cercana = trasera OK")


def test_zancada_tempo_e_informe():
    import json
    from biometra import informe
    ex = load_exercise("zancada")

    # una zancada muy superficial y rápida NO debe dar aviso de ritmo (no es comparable), pero sí de profundidad
    reps = [_rep_zancada(360, 460, 10), _rep_zancada(360, 380, 10, t_down=0.3), _rep_zancada(360, 460, 10)]
    res = ex.analyze(_serie_zancadas(reps), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert cod["profundidad"]["repeticiones"] == [2] and "bajada_rapida" not in cod, list(cod)

    # pierna lejana invisible: un solo aviso consolidado, con el consejo de la cámara en diagonal
    lm = _serie_zancadas(reps)
    lm[:, [23, 25, 27], 3] = 0.1
    res = ex.analyze(lm, FPS, (1280, 720))
    sd = [f for f in res.feedback if f["codigo"].startswith("sin_datos")]
    assert len(sd) == 1 and sd[0]["codigo"] == "sin_datos" and sd[0]["metricas"] == ["paso", "inclinacion_tibia"], sd
    assert "diagonal" in sd[0]["correccion"]
    assert res.metrics["repeticiones_detectadas"] == 3          # la rodilla cercana basta para contar

    # informe: texto estrecho y HTML con enlaces
    payload = {"estado": "completado", "video_procesado": "/tmp/out_informe/v_pose.mp4",
               "analisis": {"ejercicio": "zancada", "titulo": ex.title, "tipo": "repeticiones", "metricas_clave": ["rodilla", "tronco"],
                            "video_info": {"duracion_s": 10.0}, "puntuacion": res.score, "metricas": res.metrics,
                            "repeticiones": res.reps, "feedback": res.feedback}}
    texto = informe.resumen_texto(payload)
    assert max(len(ln) for ln in texto.splitlines()) <= 80, max(texto.splitlines(), key=len)
    import os
    os.makedirs("/tmp/out_informe", exist_ok=True)
    informe.escribir_informe(payload, "/tmp/out_informe/v_informe.html")
    h = open("/tmp/out_informe/v_informe.html", encoding="utf-8").read()
    assert "<video" in h and "v_pose.mp4" in h and "return ir(" in h
    print("zancada: ritmo solo en completas, sin_datos unificado e informe OK")


def test_zancada_alterna_roles():
    """Zancadas alternas con la pierna izquierda pegada a la cámara: impares = visible delante, pares = detrás."""
    import json
    ex = load_exercise("zancada")
    reps = [
        _rep_zancada(360, 460, 10, near_front=True),     # 1 izquierda delante, buena
        _rep_zancada(360, 460, 10, near_front=False),    # 2 derecha delante (la visible va detrás), buena
        _rep_zancada(360, 400, 10, near_front=True),     # 3 delantera poco profunda (rodilla ~113°)
        _rep_zancada(360, 380, 10, near_front=False),    # 4 trasera casi sin flexionar (rodilla ~123°)
        _rep_zancada(360, 460, 10, near_front=True),     # 5 buena
        _rep_zancada(360, 400, 10, near_front=False),    # 6 trasera ~113°: aceptable para la trasera
    ]
    res = ex.analyze(_serie_zancadas(reps), FPS, (1280, 720))
    roles = [x["rol_pierna_cercana"] for x in res.reps]
    assert roles == ["delantera", "trasera"] * 3, roles
    cod = {f["codigo"]: f for f in res.feedback}
    assert cod["profundidad"]["repeticiones"] == [3], cod.get("profundidad")
    assert cod["profundidad_trasera"]["repeticiones"] == [4], cod.get("profundidad_trasera")
    assert abs(res.reps[0]["valores"]["tobillo_adelante"]["en_fondo"] - 0.5) < 0.1
    assert abs(res.reps[1]["valores"]["tobillo_adelante"]["en_fondo"] + 0.5) < 0.1
    # la consistencia solo compara las repeticiones con la pierna visible delante (90, 113, 90 -> sin aviso)
    assert "consistencia" not in cod
    json.dumps([res.reps, res.feedback])
    print("zancada alterna: roles", roles, "| profundidad delantera", cod["profundidad"]["repeticiones"],
          "| trasera", cod["profundidad_trasera"]["repeticiones"])


# ---------------------------------------------------------------- curl de bíceps (de perfil, mirando a la derecha)
def _pose_curl(alpha, delta=5.0, tronco=3.0, W=1280, H=720):
    """alpha: flexión del codo (0 = brazo estirado); delta: inclinación del brazo respecto a la vertical;
    tronco: inclinación del tronco."""
    S = np.array([640.0, 200.0])
    d, a, g = np.radians(delta), np.radians(alpha), np.radians(tronco)
    codo = S + 150.0 * np.array([np.sin(d), np.cos(d)])
    muneca = codo + 130.0 * np.array([np.sin(d + a), np.cos(d + a)])
    cadera = S - 250.0 * np.array([np.sin(g), -np.cos(g)])
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: S, 14: codo, 16: muneca, 24: cadera}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_curl(alpha_max, t_up=1.0, t_down=1.5, delta_max=5.0, tronco_extra=0.0, alpha_min=0.0):
    n1, n2 = int(t_up * FPS), int(t_down * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        u = np.sin(np.pi * k / (n1 + n2))
        out.append(_pose_curl(alpha_min + p * (alpha_max - alpha_min), 5 + (delta_max - 5) * u, 3 + tronco_extra * u))
    return out


def test_curl_biceps():
    import json
    reps = [
        _rep_curl(140),                         # 1 buena (codo ~40° arriba)
        _rep_curl(140),                         # 2 buena
        _rep_curl(90),                          # 3 no sube del todo (codo ~90°)
        _rep_curl(140, tronco_extra=17),        # 4 balancea el tronco
        _rep_curl(140, delta_max=40),           # 5 el codo se adelanta
        _rep_curl(140, t_down=0.4),             # 6 deja caer la mancuerna
        _rep_curl(140, alpha_min=22),           # 7 no extiende del todo abajo (codo ~158°)
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("curl_biceps").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 7, res.metrics
    assert abs(res.reps[0]["valores"]["codo"]["min"] - 40) < 4, res.reps[0]["valores"]["codo"]
    assert cod["flexion_incompleta"]["repeticiones"] == [3], cod.get("flexion_incompleta")
    assert cod["balanceo_tronco"]["repeticiones"] == [4], cod.get("balanceo_tronco")
    assert cod["codo_adelantado"]["repeticiones"] == [5], cod.get("codo_adelantado")
    assert cod["bajada_rapida"]["repeticiones"] == [6], cod.get("bajada_rapida")
    assert cod["extension_incompleta"]["repeticiones"] == [7], cod.get("extension_incompleta")
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("curl OK        | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- peso muerto rumano (de perfil, mirando a la derecha)
def _pose_rdl(p, gmax=70.0, tmax=25.0, smax=0.0, off=15.0, W=1280, H=720):
    """p = 0 de pie, p = 1 abajo. g: inclinación del tronco, t: el muslo se inclina hacia atrás,
    s: la espinilla se inclina hacia delante (rodilla adelantada). off: separación de la barra (px)."""
    g, t, s = np.radians(p * gmax), np.radians(p * tmax), np.radians(p * smax)
    A = np.array([640.0, 650.0])
    rodilla = A + 180.0 * np.array([np.sin(s), -np.cos(s)])
    cadera = rodilla + 180.0 * np.array([-np.sin(t), -np.cos(t)])
    hombro = cadera + 260.0 * np.array([np.sin(g), -np.cos(g)])
    u = (0.3 + 0.55 * p) * 360.0                                  # la barra baja deslizando por la pierna
    base = cadera + (rodilla - cadera) * (u / 180.0) if u <= 180 else rodilla + (A - rodilla) * ((u - 180.0) / 180.0)
    muneca = base + np.array([off, 0.0])
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 24: cadera, 26: rodilla, 28: A, 30: A + [-25, 20], 32: A + [95, 25], 16: muneca}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_rdl(t_down=2.0, t_up=1.5, p_min=0.0, **kw):
    n1, n2 = int(t_down * FPS), int(t_up * FPS)
    out = []
    for k in range(n1 + n2):
        q = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_rdl(p_min + q * (1 - p_min), **kw))
    return out


def test_peso_muerto_rumano():
    import json
    reps = [
        _rep_rdl(),                                   # 1 buena (cadera ~85°, rodilla ~155°)
        _rep_rdl(),                                   # 2 buena
        _rep_rdl(gmax=35, tmax=15),                   # 3 bisagra corta (cadera ~130°)
        _rep_rdl(gmax=50, tmax=35, smax=35),          # 4 se agacha: rodillas ~110° y la cadera no va atrás
        _rep_rdl(off=100),                            # 5 la barra se aleja de la pierna
        _rep_rdl(t_down=0.4),                         # 6 baja demasiado rápido
        _rep_rdl(p_min=0.18),                         # 7 no termina de extender la cadera arriba (~163°)
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("peso_muerto_rumano").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 7, res.metrics
    assert abs(res.reps[0]["valores"]["cadera"]["min"] - 85) < 4, res.reps[0]["valores"]["cadera"]
    assert abs(res.reps[0]["valores"]["cadera_atras"]["en_fondo"] - 0.21) < 0.04, res.reps[0]["valores"]["cadera_atras"]
    assert cod["bisagra_corta"]["repeticiones"] == [3], cod.get("bisagra_corta")
    assert cod["rodillas_flexionadas"]["repeticiones"] == [4], cod.get("rodillas_flexionadas")
    assert cod["cadera_sin_retroceso"]["repeticiones"] == [4], cod.get("cadera_sin_retroceso")
    assert cod["barra_alejada"]["repeticiones"] == [5], cod.get("barra_alejada")
    assert cod["bajada_rapida"]["repeticiones"] == [6], cod.get("bajada_rapida")
    assert cod["extension_incompleta"]["repeticiones"] == [7], cod.get("extension_incompleta")
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("rumano OK      | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- elevación de talones (de perfil, mirando a la derecha)
def _pose_talones(phi_deg, kflex=0.0, sway=1.0, base_px=8.0, W=1280, H=720):
    """phi: ángulo con que sube el talón (la punta queda en el suelo). kflex: flexión de rodillas; sway: tronco.
    base_px: el punto del talón queda por encima del suelo aunque el pie esté plano (sesgo del modelo)."""
    phi = np.radians(phi_deg)
    punta = np.array([700.0, 650.0])
    talon = punta + 160.0 * np.array([-np.cos(phi), -np.sin(phi)])
    d = np.array([np.cos(phi), np.sin(phi)])
    n = np.array([np.sin(phi), -np.cos(phi)])
    tobillo = talon + 40.0 * d + 70.0 * n
    a = np.radians(kflex / 2)
    rodilla = tobillo + 180.0 * np.array([np.sin(a), -np.cos(a)])
    cadera = rodilla + 180.0 * np.array([-np.sin(a), -np.cos(a)])
    g = np.radians(sway)
    hombro = cadera + 260.0 * np.array([np.sin(g), -np.cos(g)])
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 24: cadera, 26: rodilla, 28: tobillo, 30: talon + [0, -base_px], 32: punta}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_talones(phi_max=14.0, t_up=1.2, t_down=1.5, kflex=0.0, sway=0.0):
    n1, n2 = int(t_up * FPS), int(t_down * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        u = np.sin(np.pi * k / (n1 + n2))
        out.append(_pose_talones(p * phi_max, kflex * u, 1.0 + sway * u))
    return out


def test_elevacion_talones():
    import json
    reps = [
        _rep_talones(),                  # 1 buena (el talón sube ~10 % de la pierna)
        _rep_talones(),                  # 2 buena
        _rep_talones(phi_max=7),         # 3 no sube del todo (~5 %)
        _rep_talones(kflex=30),          # 4 flexiona las rodillas
        _rep_talones(sway=12),           # 5 balancea el tronco
        _rep_talones(t_down=0.3),        # 6 deja caer los talones
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("elevacion_talones").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 6, res.metrics
    assert abs(res.reps[0]["valores"]["talon"]["max"] - 0.107) < 0.015, res.reps[0]["valores"]["talon"]   # línea base restada
    assert abs(res.reps[2]["valores"]["talon"]["max"] - 0.054) < 0.015, res.reps[2]["valores"]["talon"]
    assert res.reps[0]["valores"]["flexion_plantar"]["max"] > 10                                          # flexión plantar estimada
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["rodillas_flexionadas"]["repeticiones"] == [4], cod.get("rodillas_flexionadas")
    assert cod["balanceo_tronco"]["repeticiones"] == [5], cod.get("balanceo_tronco")
    assert cod["bajada_rapida"]["repeticiones"] == [6], cod.get("bajada_rapida")
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("talones OK     | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")

    # el mismo ejercicio con otro sesgo del punto del talón (aquí por debajo del suelo) no debe cambiar el resultado
    reps2 = [_rep_talones(), _rep_talones(), _rep_talones(phi_max=7)]
    frames2 = [_pose_talones(0, base_px=-6)] * 30
    for rp in reps2:
        frames2 += rp + [rp[-1]] * 15
    res2 = load_exercise("elevacion_talones").analyze(np.stack(frames2), FPS, (1280, 720))
    assert res2.metrics["repeticiones_detectadas"] == 3
    assert {f["codigo"] for f in res2.feedback if f["nivel"] == "aviso"} == {"recorrido_incompleto"}
    print("talones: independiente de la línea base OK")


# ---------------------------------------------------------------- elevaciones laterales (de frente)
def _pose_laterales(th_l, th_r, beta=15.0, dx=0.0, W=1280, H=720):
    """th: elevación del brazo respecto a la vertical (0 = colgando). beta: flexión del codo. dx: el tronco se desplaza."""
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    sR, sL = np.array([560.0 + dx, 200.0]), np.array([720.0 + dx, 200.0])
    hR, hL = np.array([590.0, 450.0]), np.array([690.0, 450.0])

    def brazo(s, th, lado):                      # lado = -1 brazo derecho (hacia la izquierda de la imagen), +1 izquierdo
        a, b = np.radians(th), np.radians(th + beta)
        codo = s + 150.0 * np.array([lado * np.sin(a), np.cos(a)])
        return codo, codo + 130.0 * np.array([lado * np.sin(b), np.cos(b)])

    eR, mR = brazo(sR, th_r, -1)
    eL, mL = brazo(sL, th_l, +1)
    for idx, pt in {12: sR, 24: hR, 14: eR, 16: mR}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    for idx, pt in {11: sL, 23: hL, 13: eL, 15: mL}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.97                         # el lado izquierdo es el "mejor visible" de forma determinista
    f[0, :2] = 0.5
    return f


def _rep_laterales(th_l=90.0, th_r=90.0, t_up=1.2, t_down=1.5, beta=15.0, sway_px=0.0):
    n1, n2 = int(t_up * FPS), int(t_down * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_laterales(p * th_l, p * th_r, beta, sway_px * np.sin(np.pi * k / (n1 + n2))))
    return out


def test_elevaciones_laterales():
    import json
    reps = [
        _rep_laterales(),                         # 1 buena (brazos a 90°)
        _rep_laterales(),                         # 2 buena
        _rep_laterales(55, 55),                   # 3 no llega a la altura del hombro
        _rep_laterales(115, 115),                 # 4 sube por encima del hombro
        _rep_laterales(100, 75),                  # 5 asimétrica (el derecho sube menos)
        _rep_laterales(sway_px=55),               # 6 inclina el tronco
        _rep_laterales(t_down=0.3),               # 7 deja caer los brazos
        _rep_laterales(beta=70),                  # 8 flexiona mucho los codos
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("elevaciones_laterales").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 8, res.metrics
    assert abs(res.reps[0]["valores"]["elevacion"]["max"] - 90) < 4, res.reps[0]["valores"]["elevacion"]
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["exceso_altura"]["repeticiones"] == [4], cod.get("exceso_altura")
    assert cod["asimetria"]["repeticiones"] == [5], cod.get("asimetria")
    assert cod["balanceo_tronco"]["repeticiones"] == [6], cod.get("balanceo_tronco")
    assert cod["bajada_rapida"]["repeticiones"] == [7], cod.get("bajada_rapida")
    assert cod["brazos_muy_flexionados"]["repeticiones"] == [8], cod.get("brazos_muy_flexionados")
    assert res.reps[4]["valores"]["dif_brazos"]["en_fondo"] > 15          # signo: el izquierdo sube más
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("laterales OK   | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- crunch abdominal (de perfil, tumbado, cabeza a la izquierda)
def _pose_crunch(theta, nu=5.0, W=1280, H=720):
    """theta: elevación del tronco sobre el suelo (0 = tumbado). nu: flexión del cuello (0 = cabeza alineada con el tronco)."""
    th, n = np.radians(theta), np.radians(theta + nu)
    cadera = np.array([500.0, 620.0])
    hombro = cadera + 450.0 * np.array([-np.cos(th), -np.sin(th)])
    oreja = hombro + 120.0 * np.array([-np.cos(n), -np.sin(n)])
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 24: cadera, 8: oreja}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_crunch(theta_max=28.0, t_up=1.0, t_down=1.5, nu_extra=0.0):
    n1, n2 = int(t_up * FPS), int(t_down * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_crunch(p * theta_max, 5.0 + nu_extra * p))
    return out


def test_crunch_abdominal():
    import json
    reps = [
        _rep_crunch(),                    # 1 bueno (tronco ~28° sobre el suelo)
        _rep_crunch(),                    # 2 bueno
        _rep_crunch(17),                  # 3 recorrido corto
        _rep_crunch(nu_extra=60),         # 4 tira del cuello
        _rep_crunch(t_up=0.3),            # 5 sube con impulso
        _rep_crunch(t_down=0.3),          # 6 deja caer el tronco
        _rep_crunch(70, t_up=1.5),        # 7 abdominal completa
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("crunch_abdominal").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 7, res.metrics
    assert abs(res.reps[0]["valores"]["elevacion"]["max"] - 28) < 3, res.reps[0]["valores"]["elevacion"]
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["cuello_flexionado"]["repeticiones"] == [4], cod.get("cuello_flexionado")
    assert cod["subida_rapida"]["repeticiones"] == [5], cod.get("subida_rapida")
    assert cod["bajada_rapida"]["repeticiones"] == [6], cod.get("bajada_rapida")
    assert cod["abdominal_completa"]["repeticiones"] == [7], cod.get("abdominal_completa")
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("crunch OK      | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- remo con mancuerna (de perfil, mirando a la derecha)
def _pose_remo(a, tau=20.0, g=0.0, W=1280, H=720):
    """a: ángulo del brazo respecto a la vertical (0 colgando; el codo sube hacia atrás). tau: tronco sobre la horizontal.
    g: el antebrazo se inclina hacia delante (0 = mancuerna colgando). El brazo de apoyo (izquierdo) está quieto."""
    t, A, G = np.radians(tau), np.radians(a), np.radians(g)
    cadera = np.array([400.0, 400.0])
    hombro = cadera + 300.0 * np.array([np.cos(t), -np.sin(t)])
    codo = hombro + 150.0 * np.array([-np.sin(A), np.cos(A)])
    muneca = codo + 140.0 * np.array([np.sin(G), np.cos(G)])
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 14: codo, 16: muneca, 24: cadera}.items():           # brazo que trabaja
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    apoyo = {11: hombro, 13: hombro + [0.0, 150.0], 15: hombro + [0.0, 290.0], 23: cadera}   # brazo de apoyo, quieto
    for idx, pt in apoyo.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.97                         # más visible que el que trabaja: a propósito
    f[0, :2] = 0.5
    return f


def _rep_remo(a_max=70.0, t_up=1.0, t_down=1.5, tau=20.0, tau_extra=0.0, g=0.0):
    n1, n2 = int(t_up * FPS), int(t_down * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_remo(p * a_max, tau + tau_extra * np.sin(np.pi * k / (n1 + n2)), g))
    return out


def test_remo_mancuerna():
    import json
    reps = [
        _rep_remo(),                          # 1 bueno (el codo sube ~70° respecto a la vertical)
        _rep_remo(),                          # 2 bueno
        _rep_remo(40),                        # 3 el codo no llega atrás
        _rep_remo(tau_extra=15),              # 4 el tronco se mueve
        _rep_remo(tau=65),                    # 5 tronco muy erguido
        _rep_remo(t_up=0.2),                  # 6 tira con impulso
        _rep_remo(t_down=0.3),                # 7 deja caer la mancuerna
        _rep_remo(g=25),                      # 8 no extiende del todo abajo
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    lm = np.stack(frames)
    res = load_exercise("remo_mancuerna").analyze(lm, FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "derecho", res.side                    # el brazo que trabaja, aunque el de apoyo se vea mejor
    assert res.metrics["repeticiones_detectadas"] == 8, res.metrics
    assert abs(res.reps[0]["valores"]["brazo"]["max"] - 70) < 4, res.reps[0]["valores"]["brazo"]
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["tronco_inestable"]["repeticiones"] == [4], cod.get("tronco_inestable")
    assert cod["tronco_erguido"]["repeticiones"] == [5], cod.get("tronco_erguido")
    assert cod["subida_rapida"]["repeticiones"] == [6], cod.get("subida_rapida")
    assert cod["bajada_rapida"]["repeticiones"] == [7], cod.get("bajada_rapida")
    assert cod["extension_incompleta"]["repeticiones"] == [8], cod.get("extension_incompleta")
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])

    # sin "lado: movimiento" se habría elegido el brazo de apoyo (más visible) y no habría repeticiones
    from biometra.exercises.engine import RepExercise
    from biometra.exercises import CONFIGS
    cfg = dict(CONFIGS["remo_mancuerna"]); cfg.pop("lado")
    sin = RepExercise(cfg).analyze(lm, FPS, (1280, 720))
    assert sin.side == "izquierdo" and sin.metrics["repeticiones_detectadas"] == 0
    print("remo OK        | puntuación:", res.score["global"], res.score["por_repeticion"],
          "| lado:", res.side, "(sin la opción: ", sin.side, "→ 0 repeticiones)")
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- aperturas con mancuernas (cámara a los pies del banco)
def _pose_aperturas(a_l, a_r, beta=20.0, W=1280, H=720):
    """a: ángulo del brazo respecto a la vertical hacia arriba (0 = brazos arriba, 90 = abiertos en horizontal).
    beta: flexión del codo (el antebrazo se inclina hacia dentro)."""
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    sR, sL = np.array([560.0, 400.0]), np.array([720.0, 400.0])

    def brazo(s, a, lado):                       # lado = -1 brazo derecho (izquierda de la imagen), +1 izquierdo
        A, B = np.radians(a), np.radians(a - beta)
        codo = s + 150.0 * np.array([lado * np.sin(A), -np.cos(A)])
        return codo, codo + 130.0 * np.array([lado * np.sin(B), -np.cos(B)])

    eR, mR = brazo(sR, a_r, -1)
    eL, mL = brazo(sL, a_l, +1)
    for idx, pt in {12: sR, 14: eR, 16: mR, 11: sL, 13: eL, 15: mL}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_aperturas(a_l=80.0, a_r=80.0, t_open=1.5, t_close=1.2, beta=20.0):
    n1, n2 = int(t_open * FPS), int(t_close * FPS)
    out = []
    for k in range(n1 + n2):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_aperturas(p * a_l, p * a_r, beta))
    return out


def test_aperturas_mancuernas():
    import json
    reps = [
        _rep_aperturas(),                          # 1 buena (brazos a 80°)
        _rep_aperturas(),                          # 2 buena
        _rep_aperturas(45, 45),                    # 3 abre poco
        _rep_aperturas(110, 110),                  # 4 baja demasiado
        _rep_aperturas(90, 55),                    # 5 asimétrica (el derecho abre menos)
        _rep_aperturas(t_open=0.3),                # 6 abre muy rápido
        _rep_aperturas(beta=70),                   # 7 flexiona mucho los codos
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("aperturas_mancuernas").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "ambos"
    assert res.metrics["repeticiones_detectadas"] == 7, res.metrics
    assert abs(res.reps[0]["valores"]["apertura"]["max"] - 80) < 4, res.reps[0]["valores"]["apertura"]
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["exceso_apertura"]["repeticiones"] == [4], cod.get("exceso_apertura")
    assert cod["asimetria"]["repeticiones"] == [5], cod.get("asimetria")
    assert cod["apertura_rapida"]["repeticiones"] == [6], cod.get("apertura_rapida")
    assert cod["codo_flexionado"]["repeticiones"] == [7], cod.get("codo_flexionado")
    assert res.reps[4]["valores"]["dif_brazos"]["en_fondo"] > 15
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("aperturas OK   | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- jalón al pecho (de frente, sentado)
def _ik_codo(S, Wr, U=150.0, F=140.0):
    v = Wr - S
    d = min(float(np.linalg.norm(v)), U + F - 1e-6)
    u = v / np.linalg.norm(v)
    a = (U ** 2 - F ** 2 + d ** 2) / (2 * d)
    h = np.sqrt(max(U ** 2 - a ** 2, 0.0))
    perp = np.array([-u[1], u[0]])
    return max([S + a * u + h * perp, S + a * u - h * perp], key=lambda c: c[1])      # el codo queda abajo


def _pose_jalon(wl, wr, dx=0.0, W=1280, H=720):
    """wl, wr: posición de la muñeca respecto al hombro (ox hacia fuera, y hacia abajo)."""
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    sR, sL = np.array([560.0 + dx, 300.0]), np.array([720.0 + dx, 300.0])
    hR, hL = np.array([590.0, 550.0]), np.array([690.0, 550.0])
    mR, mL = sR + np.array([-wr[0], wr[1]]), sL + np.array([wl[0], wl[1]])
    for idx, pt, vis in ((12, sR, 0.95), (14, _ik_codo(sR, mR), 0.95), (16, mR, 0.95), (24, hR, 0.95),
                         (11, sL, 0.97), (13, _ik_codo(sL, mL), 0.97), (15, mL, 0.97), (23, hL, 0.97)):
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = vis
    f[0, :2] = 0.5
    return f


def _rep_jalon(y_bot=25.0, y_top=-245.0, yl=None, yr=None, t_pull=1.2, t_back=1.8, dx_max=0.0, rectos=False):
    n1, n2 = int(t_pull * FPS), int(t_back * FPS)
    out = []
    for k in range(n1 + n2 + 1):                      # +1: el último fotograma queda con el brazo del todo extendido
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        if rectos:                                          # brazos casi rectos: la mano describe un arco de radio 287
            phi = np.radians(p * 100.0)
            w = (287.0 * np.sin(phi), -287.0 * np.cos(phi))
            wl = wr = w
        else:
            wl = (140.0, y_top + p * ((y_bot if yl is None else yl) - y_top))
            wr = (140.0, y_top + p * ((y_bot if yr is None else yr) - y_top))
        out.append(_pose_jalon(wl, wr, dx_max * np.sin(np.pi * k / (n1 + n2))))
    return out


def test_jalon_pecho():
    import json
    reps = [
        _rep_jalon(),                              # 1 bueno (la barra baja a la altura del pecho)
        _rep_jalon(),                              # 2 bueno
        _rep_jalon(y_bot=-90),                     # 3 la barra no baja
        _rep_jalon(rectos=True),                   # 4 brazos casi rectos
        _rep_jalon(dx_max=55),                     # 5 el tronco se balancea
        _rep_jalon(dx_max=170),                    # 6 el tronco se inclina mucho
        _rep_jalon(yl=80, yr=-50),                 # 7 una mano baja más que la otra
        _rep_jalon(t_pull=0.3),                    # 8 tira con impulso
        _rep_jalon(t_back=0.3),                    # 9 deja subir la barra de golpe
        _rep_jalon(y_top=-210),                    # 10 no extiende del todo arriba
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("jalon_pecho").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.metrics["repeticiones_detectadas"] == 10, res.metrics
    assert abs(res.reps[0]["valores"]["manos"]["max"] - 0.10) < 0.04, res.reps[0]["valores"]["manos"]
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["codo_poco_flexionado"]["repeticiones"] == [4], cod.get("codo_poco_flexionado")
    assert cod["balanceo_tronco"]["repeticiones"] == [5, 6], cod.get("balanceo_tronco")
    assert cod["tronco_hacia_atras"]["repeticiones"] == [6], cod.get("tronco_hacia_atras")
    assert cod["asimetria"]["repeticiones"] == [7], cod.get("asimetria")
    assert cod["tiron_rapido"]["repeticiones"] == [8], cod.get("tiron_rapido")
    assert cod["subida_rapida"]["repeticiones"] == [9], cod.get("subida_rapida")
    assert cod["extension_incompleta"]["repeticiones"] == [10], cod.get("extension_incompleta")
    assert res.reps[6]["valores"]["dif_manos"]["en_fondo"] > 0.15       # signo: la izquierda baja más
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("jalón OK       | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- extensión de tríceps en polea (de perfil, mirando a la derecha)
def _pose_triceps(phi, delta=5.0, g=10.0, W=1280, H=720):
    """phi: ángulo que el antebrazo se separa de la prolongación del brazo (el codo mide 180 - phi).
    delta: inclinación del brazo respecto a la vertical (codos fijos = constante). g: inclinación del tronco."""
    d, f_, gg = np.radians(delta), np.radians(delta + phi), np.radians(g)
    hombro = np.array([640.0, 200.0])
    codo = hombro + 150.0 * np.array([np.sin(d), np.cos(d)])
    muneca = codo + 140.0 * np.array([np.sin(f_), np.cos(f_)])
    cadera = hombro - 250.0 * np.array([np.sin(gg), -np.cos(gg)])
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    for idx, pt in {12: hombro, 14: codo, 16: muneca, 24: cadera}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_triceps(phi_bot=5.0, t_push=1.0, t_return=1.5, delta_bump=0.0, g_extra=0.0):
    n1, n2 = int(t_push * FPS), int(t_return * FPS)
    out = []
    for k in range(n1 + n2 + 1):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        out.append(_pose_triceps(85.0 + p * (phi_bot - 85.0), 5.0 + delta_bump * np.sin(np.pi * k / (n1 + n2)), 10.0 + g_extra * p))
    return out


def test_triceps_polea():
    import json
    reps = [
        _rep_triceps(),                       # 1 buena (codo de ~95° a ~175°)
        _rep_triceps(),                       # 2 buena
        _rep_triceps(phi_bot=30),             # 3 no extiende del todo (codo ~150°)
        _rep_triceps(delta_bump=35),          # 4 los codos se mueven
        _rep_triceps(g_extra=18),             # 5 se inclina sobre la barra
        _rep_triceps(t_return=0.3),           # 6 deja subir la barra de golpe
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    res = load_exercise("triceps_polea").analyze(np.stack(frames), FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 6, res.metrics
    assert abs(res.reps[0]["valores"]["codo"]["max"] - 175) < 4, res.reps[0]["valores"]["codo"]
    assert cod["extension_incompleta"]["repeticiones"] == [3], cod.get("extension_incompleta")
    assert cod["codo_se_mueve"]["repeticiones"] == [4], cod.get("codo_se_mueve")
    assert cod["tronco_inestable"]["repeticiones"] == [5], cod.get("tronco_inestable")
    assert cod["subida_rapida"]["repeticiones"] == [6], cod.get("subida_rapida")
    assert res.score["por_repeticion"][:2] == [100, 100]
    json.dumps([res.reps, res.feedback])
    print("tríceps OK     | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")


# ---------------------------------------------------------------- press de banca (de perfil, tumbado con la cabeza a la izquierda)
def _pose_banca(th, th_l=None, hip_lift=0.0, W=1280, H=720):
    """th: ángulo del codo derecho (175 arriba, ~75 abajo). th_l: codo izquierdo (None = oculto, como de perfil)."""
    f = np.zeros((33, 4), np.float32)
    f[:, 3] = 0.1
    S = np.array([500.0, 500.0])
    cadera = np.array([850.0, 505.0 - hip_lift])

    def brazo(s, ang):
        a = np.radians(ang)
        codo = s + 150.0 * np.array([np.sin(a), np.cos(a)])     # la mancuerna/barra queda siempre sobre el codo
        return codo, codo + np.array([0.0, -140.0])

    eD, mD = brazo(S, th)
    for idx, pt in {12: S, 14: eD, 16: mD, 24: cadera}.items():
        f[idx, :2] = pt / [W, H]
        f[idx, 3] = 0.95
    if th_l is not None:                                           # solo en las pruebas de simetría (vista desde la cabeza)
        S2 = S + np.array([0.0, 60.0])
        eI, mI = brazo(S2, th_l)
        for idx, pt in {11: S2, 13: eI, 15: mI, 23: cadera}.items():
            f[idx, :2] = pt / [W, H]
            f[idx, 3] = 0.95
    f[0, :2] = 0.5
    return f


def _rep_banca(bot=75.0, top=175.0, t_down=1.5, t_up=1.5, bot_l=None, hip_lift=0.0, con_izq=False):
    n1, n2 = int(t_down * FPS), int(t_up * FPS)
    out = []
    for k in range(n1 + n2 + 1):
        p = 0.5 * (1 - np.cos(np.pi * k / n1)) if k < n1 else 0.5 * (1 + np.cos(np.pi * (k - n1) / n2))
        th = top + p * (bot - top)
        th_l = (top + p * ((bot if bot_l is None else bot_l) - top)) if con_izq else None
        out.append(_pose_banca(th, th_l, hip_lift * np.sin(np.pi * k / (n1 + n2))))
    return out


def test_press_banca():
    import json
    reps = [
        _rep_banca(con_izq=True),                       # 1 bueno (codo de 175° a ~75°)
        _rep_banca(con_izq=True),                       # 2 bueno
        _rep_banca(bot=120, con_izq=True),              # 3 no baja lo suficiente
        _rep_banca(top=157, con_izq=True),              # 4 no termina de extender arriba
        _rep_banca(bot_l=110, con_izq=True),            # 5 un brazo baja menos que el otro
        _rep_banca(t_down=0.3, con_izq=True),           # 6 baja la barra de golpe
        _rep_banca(hip_lift=70, con_izq=True),          # 7 despega la cadera
        _rep_banca(t_up=4.0, con_izq=True),             # 8 subida muy lenta
    ]
    frames = [reps[0][0]] * 30
    for rp in reps:
        frames += rp + [rp[-1]] * 15
    lm = np.stack(frames)
    res = load_exercise("press_banca").analyze(lm, FPS, (1280, 720))
    cod = {f["codigo"]: f for f in res.feedback}
    assert res.side == "derecho"
    assert res.metrics["repeticiones_detectadas"] == 8, res.metrics
    assert abs(res.reps[0]["valores"]["codo"]["min"] - 75) < 4, res.reps[0]["valores"]["codo"]
    assert cod["recorrido_incompleto"]["repeticiones"] == [3], cod.get("recorrido_incompleto")
    assert cod["extension_incompleta"]["repeticiones"] == [4], cod.get("extension_incompleta")
    assert cod["asimetria"]["repeticiones"] == [5], cod.get("asimetria")
    assert cod["descenso_rapido"]["repeticiones"] == [6], cod.get("descenso_rapido")
    assert cod["tronco_inestable"]["repeticiones"] == [7], cod.get("tronco_inestable")
    assert cod["subida_lenta"]["repeticiones"] == [8], cod.get("subida_lenta")
    assert res.reps[4]["valores"]["dif_codos"]["en_fondo"] > 20           # izq - der > 0: el izquierdo baja menos
    assert res.score["por_repeticion"][:2] == [100, 100]

    # de perfil (brazo lejano oculto): se cuenta igual y no se inventa asimetría
    perfil = [_rep_banca(), _rep_banca(), _rep_banca(bot=120)]
    fr = [perfil[0][0]] * 30
    for rp in perfil:
        fr += rp + [rp[-1]] * 15
    res2 = load_exercise("press_banca").analyze(np.stack(fr), FPS, (1280, 720))
    cod2 = {f["codigo"] for f in res2.feedback}
    assert res2.metrics["repeticiones_detectadas"] == 3 and "asimetria" not in cod2
    assert "recorrido_incompleto" in cod2
    json.dumps([res.reps, res.feedback])
    print("banca OK       | puntuación:", res.score["global"], res.score["por_repeticion"])
    for f in res.feedback:
        print(f"  [{f['nivel']}] {f['mensaje']}")

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
    test_zancada()
    test_zancada_tempo_e_informe()
    test_zancada_alterna_roles()
    test_curl_biceps()
    test_peso_muerto_rumano()
    test_elevacion_talones()
    test_elevaciones_laterales()
    test_crunch_abdominal()
    test_remo_mancuerna()
    test_aperturas_mancuernas()
    test_jalon_pecho()
    test_triceps_polea()
    test_press_banca()
    test_plancha()
    test_plancha_hundimientos_breves()
    test_plancha_render()
    print("\nTodas las pruebas pasaron")
