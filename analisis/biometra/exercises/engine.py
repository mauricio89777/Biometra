"""Motor genérico para ejercicios con repeticiones, configurado por JSON.

Estructura de un archivo en configs/<ejercicio>.json:
  key, title, camera
  rep:      extension_window_s (opcional, 0.5), signal (métrica que define la repetición), direction ("valley": el ángulo baja y vuelve
            a subir / "peak": sube y vuelve a bajar), rest (valor en reposo), target (valor a
            alcanzar para considerar el recorrido completo), hysteresis, min_duration_s, min_swing
  metrics:  nombre -> {label, type, points, mode?, unidad?, decimales?}   (ver metrics.py)
  rules:    lista de reglas evaluadas por repetición:
              codigo, nivel ("aviso"|"info"), metric, stat ("min"|"max"|"en_fondo"|"subida_desde_fondo"|"bajada_desde_fondo"|"rango"), op (">"|"<"),
              value (número o "target"), peso (puntos que resta), mensaje, correccion
            metric también puede ser "duracion_s", "fase_ida_s" o "fase_vuelta_s".
            En mensaje: {valor} {umbral} {n} {n_rep} {total} {reps} {reps_txt}
  consistencia (opcional): metric, stat, max_std, mensaje
  coherencia (opcional): metric, extremo ("min"|"max"), max_diff, mensaje. En el punto más bajo de la
            repetición esa métrica debe estar cerca de su propio extremo (p. ej. cadera mínima cuando la
            rodilla es mínima); si no, la repetición se marca como no fiable (fallo de seguimiento) y no
            se evalúa ni penaliza.
  colocacion (opcional): metric, stat, min_diff, mensaje. Las repeticiones del INICIO o FINAL de la
            serie cuyo valor se aleja más de min_diff de la mediana (hacia el lado "menos recorrido")
            se consideran movimientos de colocación/recogida de la barra: no se cuentan ni evalúan.
            Las repeticiones interiores poco profundas SÍ se evalúan (ahí está el feedback útil).
  overlay (opcional): métricas a mostrar sobre el video
  mensaje_ok, mensaje_ok_con_notas, consejo_sin_datos (opcionales)
  lado (opcional): "movimiento" -> analiza el lado donde más se mueve la señal (unilaterales); por defecto, el más visible
  rol (opcional): metric, umbral -> cada repetición recibe rol_pierna_cercana (delantera/trasera/indeterminado)
  regla.cuando (opcional): {"rol": [..]} la regla solo se evalúa en repeticiones con ese papel (también en consistencia)
  regla.solo_completas (opcional): la regla solo se evalúa en repeticiones con recorrido completo (p. ej. ritmo)
"""
from dataclasses import dataclass, field

import numpy as np

from .metrics import build_all, build_series, es_fijo, indice
from .utils import SIDES, r

TIME_FIELDS = ("duracion_s", "fase_ida_s", "fase_vuelta_s")
MIN_CONFIANZA = 0.6
ORDEN_NIVEL = {"aviso": 0, "info": 1, "ok": 2}


def _reps_txt(ids):
    return ("la repetición " if len(ids) == 1 else "las repeticiones ") + ", ".join(map(str, ids))


@dataclass
class Analysis:
    side: str
    metrics: dict
    reps: list
    feedback: list
    score: dict
    overlay: list      # por frame: (líneas de texto, color BGR)
    highlight: list    # landmarks a resaltar en el video
    extra: dict = field(default_factory=dict)   # campos adicionales para el JSON final


class RepExercise:
    def __init__(self, cfg):
        self.cfg = cfg
        self.key, self.title, self.camera = cfg["key"], cfg["title"], cfg["camera"]
        rep = cfg["rep"]
        self.signal = rep["signal"]
        self.sign = 1 if rep.get("direction", "valley") == "valley" else -1
        self.rest, self.target = rep["rest"], rep["target"]
        self.hyst = rep.get("hysteresis", 8)
        self.min_rep_s = rep.get("min_duration_s", 0.5)
        self.min_swing = rep.get("min_swing", 25)
        self.ventana_ext = rep.get("extension_window_s", 0.5)  # s medidos tras llegar a reposo
        self.vis_min = cfg.get("visibility_min", 0.5)
        self.specs = cfg["metrics"]
        self.rules = cfg.get("rules", [])
        if self.signal not in self.specs:
            raise ValueError(f"{self.key}: la señal '{self.signal}' no está en metrics")

    # ------------------------------------------------------------ API
    def analyze(self, lm, tiempos, size):
        """tiempos: array con el instante (s) de cada frame, o un fps numérico."""
        w, h = size
        t = np.arange(len(lm)) / tiempos if np.isscalar(tiempos) else np.asarray(tiempos, dtype=float)
        side = self._pick_side(lm, w, h)
        ids = SIDES.get(side, SIDES["izquierdo"])      # "ambos": todas las métricas fijan su lado
        raws, series = build_all(lm, self.specs, ids, w, h, self.vis_min)

        reps = self._count_reps(series[self.signal], t)
        self._add_stats(reps, series, t)
        self._marcar_colocacion(reps)
        conf = self._confidence(reps, raws)
        feedback, score = self._evaluate(reps, conf)
        metrics = self._summary(lm, series, reps, conf, side)
        overlay = self._overlay(series, reps)
        for x in reps:
            x.pop("_cierre", None)

        puntos = {indice(p, ids) for s in self.specs.values() for p in s.get("points", [])}
        return Analysis(side, metrics, reps, feedback, score, overlay, sorted(puntos))

    # ------------------------------------------------------------ lado y repeticiones
    def _pick_side(self, lm, w, h):
        if self.cfg.get("lado") == "movimiento":
            # Ejercicios unilaterales: se elige el lado donde la señal de repetición más se mueve (el brazo que
            # trabaja), no el más visible (que puede ser el que apoya y está quieto).
            spec = self.specs[self.signal]
            if spec["type"] != "derived" and not any(es_fijo(p) for p in spec["points"]):
                amp = {}
                for side, ids in SIDES.items():
                    _, s = build_series(lm, spec, ids, w, h, self.vis_min)
                    v = s[~np.isnan(s)]
                    amp[side] = float(np.percentile(v, 95) - np.percentile(v, 5)) if len(v) >= 10 else -1.0
                mejor = max(amp, key=amp.get)
                if amp[mejor] > 0:
                    return mejor
        nombres = {p for s in self.specs.values() for p in s.get("points", []) if not es_fijo(p)}
        if not nombres:
            return "ambos"                   # ninguna métrica depende del lado analizado
        scores = {}
        for side, ids in SIDES.items():
            cols = [ids[n] for n in nombres]
            scores[side] = float(np.nan_to_num(lm[:, cols, 3]).mean())
        return max(scores, key=scores.get)

    def _count_reps(self, sig, t):
        """Una repetición va desde que la señal sale de reposo hasta que vuelve a él.
        Se cierra al abandonar de nuevo la zona de reposo (o al acabar el video) para
        medir el pico real. Internamente todo se trata como "valle" multiplicando por el signo."""
        x = self.sign * sig
        rest = self.sign * self.rest
        enter = rest - self.hyst
        reps, start, top = [], None, None

        def salida_de_reposo(i):
            """Primer frame del movimiento: retrocede desde el cruce del umbral de entrada hasta que la señal
            salió del reposo. Sin esto, las fases (ida/vuelta) y la duración se medirían solo desde el umbral."""
            j = i
            while j > 0 and not np.isnan(x[j - 1]) and x[j - 1] < rest:
                j -= 1
            return j

        def cerrar(end):
            # Tras llegar a reposo solo se sigue midiendo `ventana_ext` segundos (pico de extensión).
            # Sin este límite, la última repetición absorbería todo lo que pase hasta el final del
            # video (levantarse, recoger material...).
            fin = top
            while fin < end and t[fin + 1] - t[top] <= self.ventana_ext:
                fin += 1
            end = fin
            seg = x[start:end + 1]
            if np.all(np.isnan(seg)):
                return
            ida = x[start:top + 1]
            fondo = start + int(np.nanargmin(ida))
            dur = t[top] - t[start]
            swing = np.nanmax(seg) - np.nanmin(seg)
            if dur < self.min_rep_s or swing < self.min_swing:
                return
            reps.append({
                "indice": len(reps) + 1,
                "frame_inicio": start, "frame_fondo": fondo, "frame_fin": top, "_cierre": end,
                "inicio_s": r(t[start], 2), "fondo_s": r(t[fondo], 2), "fin_s": r(t[top], 2),
                "duracion_s": r(dur, 2),
                "fase_ida_s": r(t[fondo] - t[start], 2),
                "fase_vuelta_s": r(t[top] - t[fondo], 2),
                "recorrido_completo": bool(round(float(np.nanmin(ida)), 1) <= self.sign * self.target),   # mismo redondeo que las reglas
            })

        for i, a in enumerate(x):
            if np.isnan(a):
                continue
            if start is None:
                if a < enter:
                    start, top = salida_de_reposo(i), None
                continue
            if top is None:
                if a >= rest:
                    top = i
            elif a < enter:
                cerrar(i)
                start, top = salida_de_reposo(i), None
        if start is not None and top is not None:
            cerrar(len(x) - 1)
        return reps

    def _add_stats(self, reps, series, t):
        for x in reps:
            sl = slice(x["frame_inicio"], x["_cierre"] + 1)
            vals = {}
            for name, s in series.items():
                dec = self.specs[name].get("decimales", 1)
                seg = s[sl]
                if np.all(np.isnan(seg)):
                    vals[name] = {"min": None, "max": None, "en_fondo": None, "min_s": None, "max_s": None}
                else:
                    i0 = sl.start
                    vals[name] = {"min": r(np.nanmin(seg), dec), "max": r(np.nanmax(seg), dec),
                                  "en_fondo": r(s[x["frame_fondo"]], dec),
                                  "min_s": r(t[i0 + int(np.nanargmin(seg))], 2),
                                  "max_s": r(t[i0 + int(np.nanargmax(seg))], 2)}
            x["valores"] = vals
            x["fiable"] = self._es_fiable(vals)
            x["colocacion"] = False
            if self.cfg.get("rol"):
                x["rol_pierna_cercana"] = self._rol(vals)

    def _marcar_colocacion(self, reps):
        cfg = self.cfg.get("colocacion")
        if not cfg:
            return

        def valor(x):
            return self._rep_value(x, cfg["metric"], cfg.get("stat", "min"))

        ref = [valor(x) for x in reps if x["fiable"] and valor(x) is not None]
        if len(ref) < 4:
            return
        mediana = float(np.median(ref))

        def somera(x):
            v = valor(x)
            return v is not None and (v - mediana) * self.sign > cfg["min_diff"]

        i, j = 0, len(reps) - 1
        while i <= j and somera(reps[i]):
            reps[i]["colocacion"] = True
            i += 1
        while j >= i and somera(reps[j]):
            reps[j]["colocacion"] = True
            j -= 1

    def _rol(self, vals):
        """'delantera' / 'trasera' / 'indeterminado' según el signo de la métrica de rol en el fondo."""
        cfg = self.cfg["rol"]
        v = vals[cfg["metric"]]["en_fondo"]
        if v is None:
            return "indeterminado"
        u = cfg.get("umbral", 0.15)
        return "delantera" if v > u else "trasera" if v < -u else "indeterminado"

    @staticmethod
    def _cumple_cuando(x, cuando):
        return not cuando or x.get("rol_pierna_cercana") in cuando["rol"]

    def _es_fiable(self, vals):
        coh = self.cfg.get("coherencia")
        if not coh:
            return True
        v = vals[coh["metric"]]
        ref = v["min"] if coh.get("extremo", "min") == "min" else v["max"]
        if ref is None or v["en_fondo"] is None:
            return True
        return abs(v["en_fondo"] - ref) <= coh["max_diff"]

    def _confidence(self, reps, raws):
        """Fracción de frames de las repeticiones donde la métrica se pudo medir."""
        out = {}
        for name, raw in raws.items():
            seg = np.concatenate([raw[x["frame_inicio"]:x["_cierre"] + 1] for x in reps]) if reps else raw
            out[name] = float((~np.isnan(seg)).mean()) if len(seg) else 0.0
        return out

    # ------------------------------------------------------------ feedback y puntuación
    @staticmethod
    def _rep_value(rep, metric, stat):
        if metric in TIME_FIELDS:
            return rep[metric]
        v = rep["valores"][metric]
        if stat == "subida_desde_fondo":      # cuánto sube la métrica respecto a su valor en el fondo
            a, b = v["max"], v["en_fondo"]
            return None if a is None or b is None else a - b
        if stat == "rango":                   # recorrido total de la métrica dentro de la repetición (máx - mín)
            a, b = v["max"], v["min"]
            return None if a is None or b is None else a - b
        if stat == "bajada_desde_fondo":      # cuánto baja la métrica respecto a su valor en el fondo
            a, b = v["en_fondo"], v["min"]
            return None if a is None or b is None else a - b
        return v[stat]

    @staticmethod
    def _momento(rep, metric, stat):
        """Segundo del video en que ocurre el valor evaluado (para que el frontend salte ahí)."""
        clave = {"min": "min_s", "max": "max_s",
                 "subida_desde_fondo": "max_s", "bajada_desde_fondo": "min_s", "rango": "max_s"}.get(stat)
        if metric not in TIME_FIELDS and clave:
            m = rep["valores"][metric].get(clave)
            if m is not None:
                return m
        return rep["fondo_s"]

    def _evaluate(self, reps, conf):
        fb, criterios, sin_datos = [], [], []
        fiables = [x for x in reps if x["fiable"] and not x["colocacion"]]
        penal = {x["indice"]: 0 for x in reps}
        for x in reps:
            x["problemas"] = []

        dudosas = [x["indice"] for x in reps if not x["fiable"] and not x["colocacion"]]
        if dudosas:
            coh = self.cfg["coherencia"]
            fb.append({"codigo": "medicion_poco_fiable", "nivel": "info", "metrica": coh["metric"],
                       "mensaje": coh.get("mensaje", "No se evaluó técnicamente {reps_txt}: las mediciones "
                                                     "del cuerpo no son coherentes entre sí.")
                       .format(reps_txt=_reps_txt(dudosas)),
                       "correccion": "Si se repite, graba con el cuerpo completo visible, buena luz y la "
                                     "cámara fija.",
                       "repeticiones": dudosas})

        colocadas = [x["indice"] for x in reps if x["colocacion"]]
        if colocadas:
            cfg = self.cfg["colocacion"]
            fb.append({"codigo": "movimiento_colocacion", "nivel": "info", "metrica": cfg["metric"],
                       "mensaje": cfg.get("mensaje", "Se ignoró {reps_txt}: parece un movimiento de colocación "
                                                     "o recogida de la barra, no una repetición de trabajo.")
                       .format(reps_txt=_reps_txt(colocadas)),
                       "correccion": "Empieza a grabar con la barra ya colocada y de pie, y termina antes de "
                                     "dejarla en el rack.",
                       "repeticiones": colocadas})

        for rule in self.rules:
            metric = rule["metric"]
            if metric in self.specs and conf.get(metric, 1) < MIN_CONFIANZA:
                if metric not in sin_datos:
                    sin_datos.append(metric)
                continue

            thr = self.target if rule["value"] == "target" else rule["value"]
            mayor = rule["op"] == ">"
            evaluadas, malas = 0, []
            for x in fiables:
                if rule.get("solo_completas") and not x["recorrido_completo"]:
                    continue        # el ritmo de una repetición muy superficial no es comparable
                if not self._cumple_cuando(x, rule.get("cuando")):
                    continue        # regla para un papel concreto de la pierna (delantera/trasera)
                v = self._rep_value(x, metric, rule.get("stat", "min"))
                if v is None:
                    continue
                evaluadas += 1
                if (v > thr) if mayor else (v < thr):
                    malas.append((x, v))
            criterios.append({"codigo": rule["codigo"], "cumplidas": evaluadas - len(malas),
                              "evaluadas": evaluadas})
            if not malas:
                continue

            nivel = rule.get("nivel", "aviso")
            peor = max(malas, key=lambda t: t[1]) if mayor else min(malas, key=lambda t: t[1])
            ids = [x["indice"] for x, _ in malas]
            for x, _ in malas:
                x["problemas"].append(rule["codigo"])
                penal[x["indice"]] += rule.get("peso", 20 if nivel == "aviso" else 5)
            fb.append({
                "codigo": rule["codigo"], "nivel": nivel, "metrica": metric,
                "mensaje": rule["mensaje"].format(valor=peor[1], umbral=thr, n=len(malas),
                                                  n_rep=(f"{len(malas)} repeticiones" if len(malas) != 1 else "1 repetición"),
                                                  reps_txt=_reps_txt(ids),
                                                  total=evaluadas, reps=", ".join(map(str, ids))),
                "correccion": rule.get("correccion"),
                "repeticiones": ids, "valor_peor": r(peor[1], 2), "umbral": thr,
                "momento_s": self._momento(peor[0], metric, rule.get("stat", "min")),
                "confianza": r(conf.get(metric, 1.0), 2),
            })

        if sin_datos:
            fb.append({"codigo": "sin_datos", "nivel": "info", "metrica": None, "metricas": list(sin_datos),
                       "mensaje": "No se pudo evaluar con fiabilidad: "
                                  + ", ".join(self.specs[m].get("label", m) for m in sin_datos)
                                  + " (los puntos del cuerpo necesarios se ven poco en el video).",
                       "correccion": self.cfg.get("consejo_sin_datos", "Graba de nuevo con el cuerpo completo "
                                                                        "visible, buena luz y la cámara fija."),
                       "repeticiones": [], "confianza": r(min(conf[m] for m in sin_datos), 2)})

        fb += self._generic_checks(fiables)

        if all(x["colocacion"] for x in reps):  # incluye el caso sin repeticiones
            fb.insert(0, {"codigo": "sin_repeticiones", "nivel": "aviso", "metrica": None,
                          "mensaje": "No se detectaron repeticiones.",
                          "correccion": "Comprueba que se vea el cuerpo entero con el ángulo de cámara "
                                        f"recomendado ({self.camera}) y que hagas el movimiento completo.",
                          "repeticiones": []})
        elif not fiables:
            fb.append({"codigo": "sin_mediciones_fiables", "nivel": "aviso", "metrica": None,
                       "mensaje": "Ninguna repetición tuvo mediciones fiables.",
                       "correccion": "Graba con el cuerpo completo visible, buena luz y la cámara fija.",
                       "repeticiones": []})
        elif not any(f["nivel"] == "aviso" for f in fb):
            con_notas = any(f["nivel"] == "info" for f in fb)
            if con_notas:
                msg = self.cfg.get("mensaje_ok_con_notas",
                                   "No se detectaron errores importantes; revisa las observaciones informativas.")
            else:
                msg = self.cfg.get("mensaje_ok", "Según lo que se puede medir en 2D, la ejecución fue consistente.")
            fb.append({"codigo": "buena_ejecucion", "nivel": "ok", "metrica": None,
                       "mensaje": msg,
                       "correccion": None, "repeticiones": []})
        fb.sort(key=lambda f: ORDEN_NIVEL[f["nivel"]])

        por_rep = [max(0, 100 - penal[x["indice"]]) if x["fiable"] and not x["colocacion"] else None for x in reps]
        for x, sc in zip(reps, por_rep):
            x["puntuacion"] = None if sc is None else int(sc)
        validos = [sc for sc in por_rep if sc is not None]
        score = {"global": int(round(float(np.mean(validos)))) if validos else None,
                 "por_repeticion": [None if sc is None else int(sc) for sc in por_rep],
                 "por_criterio": criterios}
        return fb, score

    def _generic_checks(self, reps):
        fb = []
        if len(reps) >= 4:
            inicial = sum(x["duracion_s"] for x in reps[:2]) / 2
            if reps[-1]["duracion_s"] > inicial * 1.4:
                fb.append({"codigo": "fatiga", "nivel": "info", "metrica": "duracion_s",
                           "mensaje": "Las últimas repeticiones fueron notablemente más lentas: posible fatiga.",
                           "correccion": "Si la técnica se deteriora al final, baja el peso o las repeticiones "
                                         "de la serie.",
                           "repeticiones": [reps[-1]["indice"]]})
        c = self.cfg.get("consistencia")
        sel = [x for x in reps if self._cumple_cuando(x, c.get("cuando"))] if c else []
        if c and len(sel) >= 3:
            vals = [self._rep_value(x, c["metric"], c.get("stat", "min")) for x in sel]
            vals = [v for v in vals if v is not None]
            if len(vals) >= 3:
                desv = float(np.std(vals))
                if desv > c["max_std"]:
                    fb.append({"codigo": "consistencia", "nivel": "info", "metrica": c["metric"],
                               "mensaje": c["mensaje"].format(valor=desv, umbral=c["max_std"]),
                               "correccion": c.get("correccion"), "repeticiones": [],
                               "valor_peor": r(desv, 2), "umbral": c["max_std"]})
        return fb

    # ------------------------------------------------------------ resumen y overlay
    def _summary(self, lm, series, reps, conf, side):
        sig = series[self.signal]
        por_metrica = {}
        for name, spec in self.specs.items():
            s, dec = series[name], spec.get("decimales", 1)
            ok = ~np.isnan(s)
            por_metrica[name] = {"etiqueta": spec.get("label", name),
                                 "min": r(np.nanmin(s), dec) if ok.any() else None,
                                 "max": r(np.nanmax(s), dec) if ok.any() else None,
                                 "confianza": r(conf[name], 2)}
        return {
            "lado_analizado": side,
            "frames_procesados": int(len(lm)),
            "porcentaje_frames_con_persona": r((~np.isnan(lm[:, 0, 0])).mean() * 100),
            "porcentaje_frames_utiles": r((~np.isnan(sig)).mean() * 100),
            "repeticiones_detectadas": len(reps),
            "repeticiones_contadas": sum(1 for x in reps if not x["colocacion"]),
            "movimientos_colocacion": sum(1 for x in reps if x["colocacion"]),
            "repeticiones_completas": sum(1 for x in reps if x["recorrido_completo"] and not x["colocacion"]),
            "repeticiones_fiables": sum(1 for x in reps if x["fiable"] and not x["colocacion"]),
            "duracion_media_rep_s": r(np.mean([x["duracion_s"] for x in reps if not x["colocacion"]]), 2) if any(not x["colocacion"] for x in reps) else None,
            "por_metrica": por_metrica,
        }

    def _overlay(self, series, reps):
        n = len(series[self.signal])
        hechas = np.zeros(n, dtype=int)
        revisar = [None] * n
        dudosa = [None] * n
        colocada = [None] * n
        for x in reps:
            if x["colocacion"]:
                for i in range(x["frame_inicio"], x["frame_fin"] + 1):
                    colocada[i] = x["indice"]
                continue
            hechas[x["frame_fin"]:] += 1
            if not x["fiable"]:
                for i in range(x["frame_inicio"], x["frame_fin"] + 1):
                    dudosa[i] = x["indice"]
            elif x["problemas"]:
                for i in range(x["frame_inicio"], x["frame_fin"] + 1):
                    revisar[i] = x["indice"]
        mostrar = self.cfg.get("overlay", [self.signal])
        out = []
        for i in range(n):
            lines = [f"{self.title}: {hechas[i]} reps"]
            for name in mostrar:
                v = series[name][i]
                if np.isnan(v):
                    continue
                spec = self.specs[name]
                txt = f"{v:.0f} deg" if spec.get("unidad") == "deg" else f"{v:.2f}"
                lines.append(f"{spec.get('label', name)}: {txt}")
            if colocada[i]:
                lines.append(f"Rep {colocada[i]}: colocacion (ignorada)")
                out.append((lines, (170, 170, 170)))
            elif dudosa[i]:
                lines.append(f"Rep {dudosa[i]}: medicion dudosa")
                out.append((lines, (0, 165, 255)))
            elif revisar[i]:
                lines.append(f"Rep {revisar[i]}: revisar")
                out.append((lines, (60, 60, 255)))
            else:
                out.append((lines, (255, 255, 255)))
        return out
