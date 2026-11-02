"""Informe legible a partir del JSON de resultados: texto estrecho para la terminal y una página
HTML con el video anotado, en la que cada segundo es un enlace que salta a ese momento.

No depende de OpenCV ni de MediaPipe: solo lee el JSON.
"""
import html
import os
import textwrap

MIN_CONF = 0.6


def _num(v):
    if v is None:
        return "-"
    return f"{v:.2f}" if abs(v) < 5 else f"{v:.0f}"


def _claves(a):
    por = a["metricas"].get("por_metrica", {})
    claves = [k for k in (a.get("metricas_clave") or []) if k in por]
    return claves or list(por)[:2]


def _poca_confianza(a):
    por = a["metricas"].get("por_metrica", {})
    return [f"{v['etiqueta']} ({v['confianza']:.2f})" for v in por.values() if v["confianza"] < MIN_CONF]


def resumen_texto(d):
    a, m = d["analisis"], d["analisis"]["metricas"]
    vi, por = a.get("video_info", {}), m.get("por_metrica", {})
    L = [f"{a.get('titulo', a['ejercicio']).upper()} | lado {m.get('lado_analizado')} | "
         f"{vi.get('duracion_s', '?')} s | nota global: {a['puntuacion']['global']}"]

    if a.get("tipo") == "isometrico":
        L.append(f"Posicion detectada: {m.get('plancha_detectada')} | {m.get('inicio_s')}-{m.get('fin_s')} s "
                 f"({m.get('duracion_mantenida_s')} s)")
        for v in por.values():
            L.append(f"  {v['etiqueta'][:18]:<18} min {_num(v['min'])} | media {_num(v['media'])} | "
                     f"max {_num(v['max'])} | conf {v['confianza']}")
        for e in a.get("episodios", []):
            L.append(f"  episodio {e['tipo']}: {e['inicio_s']}-{e['fin_s']} s (pico {e['pico']})")
    else:
        L.append(f"Repeticiones: {m['repeticiones_detectadas']} detectadas, {m['repeticiones_contadas']} contadas")
        baja = _poca_confianza(a)
        if baja:
            L.append(textwrap.fill("Poca confianza (no se evaluan): " + ", ".join(baja), 78, subsequent_indent="  "))
        claves = _claves(a)
        L += ["", f"{'REP':>3} {'TIEMPO (s)':<11}{'NOTA':>5}" + "".join(f"{por[k]['etiqueta'][:10]:>12}" for k in claves),
              "-" * (21 + 12 * len(claves))]
        for r in a["repeticiones"]:
            nota = "-" if r.get("puntuacion") is None else str(r["puntuacion"])
            marca = " (colocacion)" if r.get("colocacion") else " (dudosa)" if not r.get("fiable", True) else ""
            vals = "".join(f"{_num(r['valores'][k]['en_fondo']):>12}" for k in claves)
            L.append(f"{r['indice']:>3} {r['inicio_s']:>4.1f}-{r['fin_s']:<5.1f} {nota:>5}{vals}{marca}")
            if r["problemas"]:
                L.append("      -> " + ", ".join(r["problemas"]))
        L.append("(valores medidos en el punto mas bajo de cada repeticion)")

    L += ["", "FEEDBACK"]
    for f in a["feedback"]:
        mom = f" [a los {f['momento_s']:.1f} s]" if f.get("momento_s") is not None else ""
        L.append(textwrap.fill(f"[{f['nivel']}] {f['mensaje']}{mom}", 78, initial_indent="  - ", subsequent_indent="    "))
    return "\n".join(L)


CSS = """:root{color-scheme:light dark;--ok:#2e7d32;--mid:#b26a00;--bad:#c62828;--info:#1565c0}
body{font:15px/1.5 system-ui,sans-serif;max-width:980px;margin:1.5rem auto;padding:0 1rem}
video{width:100%;max-width:720px;border-radius:8px;background:#000}
.t{overflow-x:auto}table{border-collapse:collapse;width:100%}
th,td{padding:.35rem .6rem;border-bottom:1px solid #8884;text-align:left;white-space:nowrap}
.nota{font-weight:700}.ok{color:var(--ok)}.mid{color:var(--mid)}.bad{color:var(--bad)}
.fb{padding:.5rem .75rem;margin:.4rem 0;border-left:4px solid;border-radius:4px;background:#8881}
.aviso{border-color:var(--bad)}.info{border-color:var(--info)}.okfb{border-color:var(--ok)}
a{cursor:pointer;color:var(--info);text-decoration:underline}small{opacity:.75}
"""


def _nota_cls(n):
    return "" if n is None else "ok" if n >= 90 else "mid" if n >= 70 else "bad"


def _ir(seg, texto):
    return f'<a onclick="return ir({max(0.0, seg - 1.0):.2f})">{texto}</a>'


def escribir_informe(d, ruta_html):
    a, m = d["analisis"], d["analisis"]["metricas"]
    por = m.get("por_metrica", {})
    e = html.escape
    video = os.path.relpath(d["video_procesado"], os.path.dirname(os.path.abspath(ruta_html)))
    h = [f"<!doctype html><meta charset=utf-8><title>{e(a.get('titulo', ''))} - informe</title><style>{CSS}</style>",
         f"<h1>{e(a.get('titulo', a['ejercicio']))}</h1>",
         f"<p>Lado {e(str(m.get('lado_analizado')))} &middot; {a.get('video_info', {}).get('duracion_s', '?')} s &middot; "
         f"nota global <span class='nota {_nota_cls(a['puntuacion']['global'])}'>{a['puntuacion']['global']}</span></p>",
         f"<video id=v src='{e(video)}' controls></video>",
         "<p><small>Pulsa cualquier enlace para saltar a ese momento del video.</small></p>"]
    baja = _poca_confianza(a)
    if baja:
        h.append(f"<p><small>Poca confianza (no se evaluan): {e(', '.join(baja))}</small></p>")

    if a.get("tipo") == "isometrico":
        h.append(f"<p>Posicion mantenida: {_ir(m.get('inicio_s', 0), str(m.get('inicio_s')) + ' s')} &rarr; "
                 f"{m.get('fin_s')} s ({m.get('duracion_mantenida_s')} s)</p>")
        if a.get("episodios"):
            h.append("<h3>Episodios</h3><ul>" + "".join(
                f"<li>{e(ep['tipo'])}: {_ir(ep['momento_s'], str(ep['inicio_s']) + '-' + str(ep['fin_s']) + ' s')} "
                f"(pico {ep['pico']})</li>" for ep in a["episodios"]) + "</ul>")
        if a.get("linea_tiempo"):
            h.append("<h3>Linea de tiempo</h3><div class=t><table><tr><th>Tramo<th>Media<th>Min<th>Max<th>Episodios<th>Estado</tr>" +
                     "".join(f"<tr><td>{_ir(w['inicio_s'], str(w['inicio_s']) + '-' + str(w['fin_s']) + ' s')}"
                             f"<td>{w['valor_medio']}<td>{w['valor_min']}<td>{w['valor_max']}<td>{w['n_episodios']}"
                             f"<td class={'ok' if w['estado'] == 'ok' else 'bad'}>{w['estado']}"
                             for w in a["linea_tiempo"]) + "</table></div>")
    else:
        claves = [k for k in (a.get("metricas_clave") or []) if k in por] or list(por)[:2]
        h.append(f"<h3>Repeticiones: {m['repeticiones_detectadas']} detectadas, {m['repeticiones_contadas']} contadas</h3>")
        cab = "".join(f"<th>{e(por[k]['etiqueta'])}" for k in claves)
        filas = []
        for r in a["repeticiones"]:
            marca = " (colocacion)" if r.get("colocacion") else " (dudosa)" if not r.get("fiable", True) else ""
            nota = r.get("puntuacion")
            vals = "".join(f"<td>{_num(r['valores'][k]['en_fondo'])}" for k in claves)
            filas.append(f"<tr><td>{r['indice']}<td>{_ir(r['inicio_s'], str(r['inicio_s']) + '-' + str(r['fin_s']) + ' s')}"
                         f"<td class='nota {_nota_cls(nota)}'>{'-' if nota is None else nota}{vals}"
                         f"<td>{e(', '.join(r['problemas']) or '-')}{e(marca)}"
                         f"<td>{_ir(r['fondo_s'], 'ver fondo')}")
        h.append(f"<div class=t><table><tr><th>#<th>Tiempo<th>Nota{cab}<th>Avisos<th></tr>{''.join(filas)}</table></div>"
                 "<p><small>Valores medidos en el punto mas bajo de cada repeticion.</small></p>")

    h.append("<h3>Feedback</h3>")
    for f in a["feedback"]:
        clase = {"aviso": "aviso", "info": "info", "ok": "okfb"}[f["nivel"]]
        extra = f" {_ir(f['momento_s'], 'ver a los ' + format(f['momento_s'], '.1f') + ' s')}" if f.get("momento_s") is not None else ""
        corr = f"<br><small>{e(f['correccion'])}</small>" if f.get("correccion") else ""
        h.append(f"<div class='fb {clase}'>{e(f['mensaje'])}{extra}{corr}</div>")
    h.append("<script>const v=document.getElementById('v');function ir(t){v.currentTime=t;v.play();return false}</script>")
    with open(ruta_html, "w", encoding="utf-8") as fh:
        fh.write("\n".join(h))
    return ruta_html
