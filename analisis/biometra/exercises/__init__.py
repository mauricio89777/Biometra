"""Carga los ejercicios definidos en configs/*.json."""
import json
import os

from .engine import RepExercise
from .hold_engine import HoldExercise

_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "configs")


def _load_configs():
    configs = {}
    for name in sorted(os.listdir(_DIR)):
        if name.endswith(".json"):
            with open(os.path.join(_DIR, name), encoding="utf-8") as f:
                cfg = json.load(f)
            configs[cfg["key"]] = cfg
    return configs


CONFIGS = _load_configs()


def load_exercise(key):
    cfg = CONFIGS[key]
    return HoldExercise(cfg) if cfg.get("tipo") == "isometrico" else RepExercise(cfg)
