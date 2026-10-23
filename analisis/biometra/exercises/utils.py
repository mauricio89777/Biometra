import numpy as np


def r(x, n=1):
    """Redondea y convierte NaN/None a None (JSON válido)."""
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
