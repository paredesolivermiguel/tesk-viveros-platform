#!/usr/bin/env python3
"""
Actualizacion incremental de solo sol/agua para productos ya existentes.
NO toca usuarios, pedidos ni contrasenas - solo hace UPDATE por nombre de
producto, nunca TRUNCATE. Lee de export/ (ya generado por
export_wordpress.py) y escribe migration/care_update.sql.
"""
import json
import os

IN_DIR = os.environ.get("EXPORT_DIR", "export")
OUT_FILE = os.environ.get("OUT_SQL", "migration/care_update.sql")


def dq(text):
    if text is None:
        return "NULL"
    return f"$tesk${text}$tesk$"


def meta_get(meta_data, key, default=None):
    for m in meta_data or []:
        if m.get("key") == key:
            return m.get("value")
    return default


def main():
    with open(f"{IN_DIR}/products.json") as f:
        products = json.load(f)

    lines = ["BEGIN;", ""]
    updated = 0
    for p in products:
        meta = p.get("meta_data", [])
        sun_info = meta_get(meta, "_shz_sol")
        water_info = meta_get(meta, "_shz_agua")
        if sun_info in (None, "") and water_info in (None, ""):
            continue
        name = p.get("name", "")
        lines.append(
            f"UPDATE products SET sun_info = {dq(sun_info)}, water_info = {dq(water_info)} "
            f"WHERE name = {dq(name)};"
        )
        updated += 1
    lines.append("COMMIT;")

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w") as f:
        f.write("\n".join(lines))

    print(f"Productos con sol/agua a actualizar: {updated}")
    print(f"SQL escrito en {OUT_FILE}")


if __name__ == "__main__":
    main()
