#!/usr/bin/env python3
"""Resumen legible del JSON de main.py.

    python tools/resumen.py output/t.json           # texto estrecho en la terminal
    python tools/resumen.py output/t.json --html    # además crea output/t_informe.html (video + enlaces)

Lo más cómodo es pedirlo directamente al analizar:  python main.py ... --informe
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from biometra import informe  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("archivo", nargs="?", default="-")
    ap.add_argument("--html", action="store_true")
    ap.add_argument("--claves", default=None,
                    help="métricas a mostrar en la tabla, separadas por comas (útil con JSON antiguos)")
    args = ap.parse_args()
    texto = sys.stdin.read() if args.archivo == "-" else open(args.archivo, encoding="utf-8").read()
    try:
        d = json.loads(texto)
    except json.JSONDecodeError:                      # archivo con logs mezclados: última línea que sea JSON
        lineas = [ln for ln in texto.splitlines() if ln.strip().startswith("{")]
        if not lineas:
            sys.exit("No encuentro un JSON en la entrada.")
        d = json.loads(lineas[-1])
    if args.claves and d.get("analisis"):
        d["analisis"]["metricas_clave"] = args.claves.split(",")
    if d.get("estado") != "completado":
        sys.exit(f"Estado: {d.get('estado')} - {d.get('error')}")
    print(informe.resumen_texto(d))
    if args.html:
        ruta = os.path.splitext(args.archivo)[0] + "_informe.html" if args.archivo != "-" else "informe.html"
        informe.escribir_informe(d, ruta)
        print(f"\nInforme con video: {ruta}")


if __name__ == "__main__":
    main()
