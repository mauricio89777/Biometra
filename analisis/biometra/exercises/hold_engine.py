"""Motor para ejercicios isométricos (mantener una posición): plancha, etc.

Configuración JSON (configs/<ejercicio>.json) con "tipo": "isometrico":
  metrics        igual que en el motor de repeticiones (ver metrics.py)
  posicion       metric, min, max: la posición se considera "tomada" mientras esa métrica esté
                 en [min, max] (p. ej. inclinación del cuerpo respecto a la vertical >= 55°)
  hold           min_duracion_s, hueco_max_s (huecos que se toleran), recorte_inicio_s / recorte_fin_s
                 (se descarta el inicio y el final del tramo, donde la persona se está colocando)
  linea_tiempo   metric, bajo, alto, ventana_s: resumen por tramos para mostrar cuándo se pierde la forma
  rules          codigo, nivel, metric, stat, op, value, peso, mensaje, correccion, [limite]
                 stat: media | min | max | rango | deriva | pct_bajo | pct_sobre | duracion_s |
                       episodios_bajo | episodios_sobre
                   deriva     = media del último 20 % del tramo - media del primer 20 %
                   pct_bajo   = fracción del tiempo con la métrica < limite
                   pct_sobre  = fracción del tiempo con la métrica > limite
                   episodios_*: tramos de al menos duracion_min_s (0.4) en que la métrica se aleja más de
                              `limite` de SU PROPIA mediana durante el tramo (robusto a diferencias de cámara)
                              y, además, pasa de `limite_abs` en valor absoluto (evita falsos signos opuestos);
                              valor = nº de episodios
                 si_no: lista de códigos; la regla se omite si alguno ya saltó (evita penalizar dos veces)
                 mensaje admite {valor} {umbral} {limite} {momento} {momentos} {veces}
  mensaje_ok, mensaje_ok_con_notas (opcionales)
"""
import numpy as np

from .engine import MIN_CONFIANZA, ORDEN_NIVEL, SIDES, Analysis
from .metrics import build_all, es_fijo, indice
from .utils import r

GRIS = (170, 170, 170)
BLANCO = (255, 255, 255)
ROJO = (60, 60, 255)


class HoldExercise:
    def __init__(self, cfg):
        self.cfg = cfg
        self.key, self.title, self.camera = cfg["key"], cfg["title"], cfg["camera"]
        self.specs = cfg["metrics"]
        self.pos = cfg["posicion"]
        h = cfg.get("hold", {})
        self.min_hold = h.get("min_duracion_s", 3.0)
        self.gap = h.get("hueco_max_s", 0.5)
        self.trim_ini = h.get("recorte_inicio_s", 1.0)
        self.trim_fin = h.get("recorte_fin_s", 0.5)
        self.vis_min = cfg.get("visibility_min", 0.5)
        self.rules = cfg.get("rules", [])
        self.tl = cfg.get("linea_tiempo")
        if self.pos["metric"] not in self.specs:
            raise ValueError(f"{self.key}: la métrica de posición '{self.pos['metric']}' no está en metrics")

    # ------------------------------------------------------------ API
    def analyze(self, lm, tiempos, size):
        w, h = size
        n = len(lm)
        t = np.arange(n) / tiempos if np.isscalar(tiempos) else np.asarray(tiempos, dtype=float)
        side = self._pick_side(lm)
        ids = SIDES[side]
        raws, series = build_all(lm, self.specs, ids, w, h, self.vis_min)
        puntos = sorted({indice(p, ids) for s in self.specs.values() for p in s.get("points", [])})
        con_persona = r((~np.isnan(lm[:, 0, 0])).mean() * 100)

        tramo = self._mejor_tramo(series[self.pos["metric"]], t)
        if tramo is None:
            return self._sin_plancha(n, side, puntos, con_persona)
        a, b = tramo
        a2, b2 = self._recorte(a, b, t)

        conf = {k: float((~np.isnan(v[a2:b2 + 1])).mean()) for k, v in raws.items()}
        stats = {k: self._stats(v[a2:b2 + 1], t[a2:b2 + 1]) for k, v in series.items()}
        feedback, score, eventos = self._evaluate(stats, conf, t[b] - t[a], t[a])

        metrics = {
            "lado_analizado": side,
            "frames_procesados": int(n),
            "porcentaje_frames_con_persona": con_persona,
            "plancha_detectada": True,
            "inicio_s": r(t[a], 2), "fin_s": r(t[b], 2),
            "duracion_mantenida_s": r(t[b] - t[a], 2),
            "duracion_medida_s": r(t[b2] - t[a2], 2),
            "por_metrica": {k: self._resumen(k, stats[k], conf[k]) for k in self.specs},
        }
        extra = {"linea_tiempo": self._linea_tiempo(series, t, a2, b2, eventos),
                 "episodios": eventos, "serie": self._serie(series, t, a2, b2)}
        overlay = self._overlay(series, t, a, b, eventos)
        return Analysis(side, metrics, [], feedback, score, overlay, puntos, extra)

    # ------------------------------------------------------------ detección del tramo
    def _pick_side(self, lm):
        nombres = {p for s in self.specs.values() for p in s.get("points", []) if not es_fijo(p)}
        scores = {side: float(np.nan_to_num(lm[:, [ids[n] for n in nombres], 3]).mean())
                  for side, ids in SIDES.items()}
        return max(scores, key=scores.get)

    def _mejor_tramo(self, medida, t):
        lo, hi = self.pos["min"], self.pos.get("max", 1e9)
        ok = np.zeros(len(medida), dtype=bool)
        v = ~np.isnan(medida)
        ok[v] = (medida[v] >= lo) & (medida[v] <= hi)

        runs, i, n = [], 0, len(ok)
        while i < n:
            if ok[i]:
                j = i
                while j + 1 < n and ok[j + 1]:
                    j += 1
                runs.append([i, j])
                i = j + 1
            else:
                i += 1
        fusion = []
        for run in runs:
            if fusion and t[run[0]] - t[fusion[-1][1]] <= self.gap:
                fusion[-1][1] = run[1]
            else:
                fusion.append(run)
        if not fusion:
            return None
        a, b = max(fusion, key=lambda x: t[x[1]] - t[x[0]])
        return (a, b) if t[b] - t[a] >= self.min_hold else None

    def _recorte(self, a, b, t):
        a2 = int(np.searchsorted(t, t[a] + self.trim_ini))
        b2 = int(np.searchsorted(t, t[b] - self.trim_fin, side="right") - 1)
        if b2 - a2 < 2 or t[b2] - t[a2] < 2.0:
            return a, b
        return min(a2, b), max(b2, a)

    # ------------------------------------------------------------ estadísticos
    @staticmethod
    def _stats(seg, tt):
        valid = ~np.isnan(seg)
        if not valid.any():
            return None
        dt = np.gradient(tt) if len(tt) > 1 else np.ones(1)
        dur = tt[-1] - tt[0]
        cola = valid & (tt >= tt[-1] - 0.2 * dur)
        cabeza = valid & (tt <= tt[0] + 0.2 * dur)
        return {
            "seg": seg, "tt": tt, "dt": dt, "valid": valid, "dev": seg - np.nanmedian(seg),
            "min": float(np.nanmin(seg)), "max": float(np.nanmax(seg)), "media": float(np.nanmean(seg)),
            "rango": float(np.nanmax(seg) - np.nanmin(seg)),
            "t_min": float(tt[int(np.nanargmin(seg))]), "t_max": float(tt[int(np.nanargmax(seg))]),
            "deriva": float(np.mean(seg[cola]) - np.mean(seg[cabeza])) if cola.any() and cabeza.any() else None,
        }

    def _resumen(self, name, st, conf):
        spec = self.specs[name]
        dec = spec.get("decimales", 1)
        return {"etiqueta": spec.get("label", name), "confianza": r(conf, 2),
                "min": r(st["min"], dec) if st else None, "max": r(st["max"], dec) if st else None,
                "media": r(st["media"], dec) if st else None}

    @staticmethod
    def _episodios(st, bajo, limite, dur_min, limite_abs=None, hueco=0.2):
        """Tramos continuos en que la desviación respecto a la mediana pasa de `limite` Y, si se indica,
        el valor absoluto está además por debajo/encima de `limite_abs`. Esto evita que, cuando la mediana
        ya es la postura incorrecta (p. ej. hundida más de la mitad del tiempo), la parte buena se
        interprete como un episodio de signo contrario."""
        dev, tt = st["dev"], st["tt"]
        with np.errstate(invalid="ignore"):
            m = (dev < limite) if bajo else (dev > limite)
            if limite_abs is not None:
                m &= (st["seg"] < limite_abs) if bajo else (st["seg"] > limite_abs)
        m &= st["valid"]
        runs, i, n = [], 0, len(m)
        while i < n:
            if m[i]:
                j = i
                while j + 1 < n and m[j + 1]:
                    j += 1
                runs.append([i, j])
                i = j + 1
            else:
                i += 1
        fus = []
        for run in runs:
            if fus and tt[run[0]] - tt[fus[-1][1]] <= hueco:
                fus[-1][1] = run[1]
            else:
                fus.append(run)
        paso = float(np.median(st["dt"]))
        out = []
        for a, b in fus:
            dur = float(tt[b] - tt[a]) + paso
            if dur < dur_min:
                continue
            k = a + int(np.nanargmin(dev[a:b + 1]) if bajo else np.nanargmax(dev[a:b + 1]))
            out.append({"inicio_s": r(tt[a], 2), "fin_s": r(tt[b], 2), "duracion_s": r(dur, 2),
                        "pico": r(dev[k], 3), "momento_s": r(tt[k], 2)})
        return out

    def _valor(self, rule, st, duracion, inicio):
        """Devuelve (valor, instante, info). `info` solo en reglas de episodios."""
        stat = rule["stat"]
        if stat == "duracion_s":
            return duracion, inicio, None
        if stat in ("episodios_bajo", "episodios_sobre"):
            eps = self._episodios(st, stat == "episodios_bajo", rule["limite"], rule.get("duracion_min_s", 0.4),
                                  rule.get("limite_abs"))
            return float(len(eps)), (eps[0]["momento_s"] if eps else None), \
                {"episodios": eps, "momentos": [e["momento_s"] for e in eps]}
        if stat in ("pct_bajo", "pct_sobre"):
            with np.errstate(invalid="ignore"):
                m = (st["seg"] < rule["limite"]) if stat == "pct_bajo" else (st["seg"] > rule["limite"])
            m &= st["valid"]
            total = st["dt"][st["valid"]].sum()
            v = float(st["dt"][m].sum() / total) if total > 0 else None
            return v, (st["t_min"] if stat == "pct_bajo" else st["t_max"]), None
        if stat == "deriva":
            return st["deriva"], float(st["tt"][-1]), None
        if stat == "rango":
            return st["rango"], st["t_max"], None
        if stat in ("min", "max", "media"):
            return st[stat], st.get(f"t_{stat}", float(st["tt"][0])), None
        raise ValueError(f"stat desconocido: {stat}")

    # ------------------------------------------------------------ feedback y puntuación
    def _evaluate(self, stats, conf, duracion, inicio):
        fb, criterios, sin_datos, eventos, saltaron, penal = [], [], set(), [], set(), 0
        for rule in self.rules:
            metric = rule["metric"]
            es_tiempo = rule["stat"] == "duracion_s"
            if not es_tiempo and (stats.get(metric) is None or conf.get(metric, 1) < MIN_CONFIANZA):
                if metric not in sin_datos:
                    sin_datos.add(metric)
                    fb.append({"codigo": f"sin_datos_{metric}", "nivel": "info", "metrica": metric,
                               "mensaje": f"No se pudo evaluar «{self.specs[metric].get('label', metric)}» con "
                                          f"fiabilidad: los puntos del cuerpo necesarios se ven poco.",
                               "correccion": "Graba de nuevo con el cuerpo completo visible, buena luz y la "
                                             "cámara fija.", "repeticiones": [],
                               "confianza": r(conf.get(metric, 0.0), 2)})
                continue
            v, momento, info = self._valor(rule, None if es_tiempo else stats[metric], duracion, inicio)
            if info:
                eventos += [dict(e, tipo=rule["codigo"]) for e in info["episodios"]]
            if v is None or any(c in saltaron for c in rule.get("si_no", [])):
                continue
            thr = rule["value"]
            viola = v > thr if rule["op"] == ">" else v < thr
            criterios.append({"codigo": rule["codigo"], "cumplida": not viola})
            if not viola:
                continue
            saltaron.add(rule["codigo"])
            nivel = rule.get("nivel", "aviso")
            penal += rule.get("peso", 20 if nivel == "aviso" else 5)
            momentos = (info or {}).get("momentos", [])
            item = {
                "codigo": rule["codigo"], "nivel": nivel, "metrica": metric,
                "mensaje": rule["mensaje"].format(
                    valor=v, umbral=thr, limite=rule.get("limite"), momento=momento,
                    momentos=", ".join(f"{m:.1f} s" for m in momentos[:6]),
                    veces=f"{int(v)} vez" if int(v) == 1 else f"{int(v)} veces"),
                "correccion": rule.get("correccion"), "repeticiones": [],
                "valor_peor": r(v, 3), "umbral": thr, "momento_s": r(momento, 2),
                "confianza": r(conf.get(metric, 1.0), 2),
            }
            if info:
                item["momentos_s"] = momentos
            fb.append(item)

        if not any(f["nivel"] == "aviso" for f in fb):
            con_notas = any(f["nivel"] == "info" for f in fb)
            msg = (self.cfg.get("mensaje_ok_con_notas", "No se detectaron errores importantes; revisa las "
                                                          "observaciones informativas.") if con_notas else
                   self.cfg.get("mensaje_ok", "Según lo medible en 2D, la postura se mantuvo estable."))
            fb.append({"codigo": "buena_ejecucion", "nivel": "ok", "metrica": None, "mensaje": msg,
                       "correccion": None, "repeticiones": []})
        fb.sort(key=lambda f: ORDEN_NIVEL[f["nivel"]])
        score = {"global": int(max(0, 100 - penal)), "por_repeticion": [], "por_criterio": criterios}
        return fb, score, sorted(eventos, key=lambda e: e["momento_s"])

    # ------------------------------------------------------------ línea de tiempo y overlay
    def _linea_tiempo(self, series, t, a2, b2, eventos):
        if not self.tl:
            return []
        ventana, serie = self.tl["ventana_s"], series[self.tl["metric"]]
        out, ini = [], t[a2]
        while ini < t[b2] - 1e-9:
            sel = (t >= ini) & (t < ini + ventana)
            sel[:a2] = False
            sel[b2 + 1:] = False
            vals = serie[sel]
            vals = vals[~np.isnan(vals)]
            if len(vals) >= 3:
                m = float(np.mean(vals))
                estado = "hundida" if m < self.tl["bajo"] else "elevada" if m > self.tl["alto"] else "ok"
                out.append({"inicio_s": r(ini, 2), "fin_s": r(min(ini + ventana, t[b2]), 2),
                            "valor_medio": r(m, 2), "valor_min": r(np.min(vals), 2), "valor_max": r(np.max(vals), 2),
                            "n_episodios": sum(1 for e in eventos if ini <= e["momento_s"] < ini + ventana),
                            "estado": estado})
            ini += ventana
        return out

    def _serie(self, series, t, a2, b2, paso=0.25):
        """Alineación muestreada a ~4 Hz durante la plancha (para dibujar la gráfica en el frontend)."""
        nombre = self.tl["metric"] if self.tl else self.pos["metric"]
        instantes = np.arange(t[a2], t[b2], paso)
        idx = np.clip(np.searchsorted(t, instantes), 0, len(t) - 1)
        return {"metrica": nombre, "t": [r(x, 2) for x in instantes],
                "valor": [r(series[nombre][i], 3) for i in idx]}

    def _overlay(self, series, t, a, b, eventos=()):
        n = len(t)
        alin = series[self.tl["metric"]] if self.tl else None
        etiqueta = self.specs[self.tl["metric"]].get("label", "") if self.tl else ""
        out = []
        for i in range(n):
            if a <= i <= b:
                lines, color = [f"{self.title}: {t[i] - t[a]:.1f} s"], BLANCO
                if alin is not None and not np.isnan(alin[i]):
                    lines.append(f"{etiqueta}: {alin[i]:+.2f}")
                    if alin[i] < self.tl["bajo"] or alin[i] > self.tl["alto"]:
                        color = ROJO
                if any(e["inicio_s"] <= t[i] <= e["fin_s"] for e in eventos):
                    color = ROJO
                out.append((lines, color))
            else:
                out.append(([f"{self.title}: fuera de posicion"], GRIS))
        return out

    def _sin_plancha(self, n, side, puntos, con_persona):
        fb = [{"codigo": "sin_plancha", "nivel": "aviso", "metrica": None,
               "mensaje": f"No se detectó una posición mantenida durante al menos {self.min_hold:.0f} s.",
               "correccion": f"Graba de perfil ({self.camera}) con el cuerpo completo visible y mantén la "
                             f"posición varios segundos sin moverte.", "repeticiones": []}]
        metrics = {"lado_analizado": side, "frames_procesados": int(n),
                   "porcentaje_frames_con_persona": con_persona, "plancha_detectada": False}
        score = {"global": None, "por_repeticion": [], "por_criterio": []}
        overlay = [([f"{self.title}: no detectada"], GRIS)] * n
        return Analysis(side, metrics, [], fb, score, overlay, puntos, {"linea_tiempo": [], "episodios": [], "serie": None})
