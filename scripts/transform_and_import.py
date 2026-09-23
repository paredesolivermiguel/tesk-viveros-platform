#!/usr/bin/env python3
"""
Transforma el JSON exportado de WordPress/WooCommerce al esquema
multi-tenant de PostgreSQL. Lee de export/ (generado por
export_wordpress.py) y escribe migration/data.sql, listo para aplicar
con psql. No toca WordPress ni PostgreSQL directamente.
"""
import json
import os
import re

IN_DIR = os.environ.get("EXPORT_DIR", "export")
OUT_FILE = os.environ.get("OUT_SQL", "migration/data.sql")

TENANT_ID = 1
PROFILE_IDS = {"bazar": 1, "garden": 2, "mayorista": 3}
ROLE_TO_PROFILE = {
    "shz_bazar": "bazar",
    "shz_garden": "garden",
    "shz_mayorista": "mayorista",
}
GESTOR_ROLES = {"shz_admin_pedidos", "administrator"}


def dq(text):
    """Dollar-quote un texto para SQL (evita tener que escapar comillas)."""
    if text is None:
        return "NULL"
    text = str(text)
    return f"$tesk${text}$tesk$"


def num(value, default=0):
    try:
        if value in (None, ""):
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def strip_html(text):
    if not text:
        return ""
    return re.sub(r"<[^>]+>", " ", text).strip()


def meta_get(meta_data, key, default=None):
    for m in meta_data or []:
        if m.get("key") == key:
            return m.get("value")
    return default


def main():
    with open(f"{IN_DIR}/products.json") as f:
        products = json.load(f)
    with open(f"{IN_DIR}/customers.json") as f:
        users = json.load(f)
    with open(f"{IN_DIR}/orders.json") as f:
        orders = json.load(f)

    lines = []
    lines.append("BEGIN;")
    lines.append("")

    # --- tenant ---
    lines.append("-- Tenant: Viveros Simon Haro")
    lines.append(
        f"INSERT INTO tenants (id, name, slug, domain, active, plan) VALUES "
        f"({TENANT_ID}, {dq('Viveros Simon Haro')}, {dq('viveros-simon-haro')}, "
        f"{dq('viverossimonharo.es')}, TRUE, {dq('basico')}) "
        f"ON CONFLICT (id) DO NOTHING;"
    )
    lines.append(f"SELECT setval('tenants_id_seq', {TENANT_ID});")
    lines.append("")

    # --- perfiles de precio ---
    lines.append("-- Perfiles de precio")
    for name, pid in PROFILE_IDS.items():
        lines.append(
            f"INSERT INTO price_profiles (id, tenant_id, name) VALUES "
            f"({pid}, {TENANT_ID}, {dq(name)}) ON CONFLICT (id) DO NOTHING;"
        )
    lines.append(f"SELECT setval('price_profiles_id_seq', {max(PROFILE_IDS.values())});")
    lines.append("")

    # --- productos ---
    lines.append("-- Productos")
    product_id_map = {}
    skipped_products = 0
    for i, p in enumerate(products, start=1):
        wc_id = p.get("id")
        product_id_map[wc_id] = i
        meta = p.get("meta_data", [])
        name = p.get("name", "")
        desc = strip_html(p.get("description", "") or p.get("short_description", ""))
        images = p.get("images") or []
        image_url = images[0].get("src") if images else None
        active = p.get("status") == "publish"
        tray_enabled = (meta_get(meta, "_shz_bandeja_activa") == "yes")
        units_per_tray = int(num(meta_get(meta, "_shz_unidades_por_bandeja"), 1) or 1)
        is_offer = (meta_get(meta, "_shz_oferta") == "yes")
        is_new = (meta_get(meta, "_shz_novedad") == "yes")
        sun_info = meta_get(meta, "_shz_sol")
        water_info = meta_get(meta, "_shz_agua")

        lines.append(
            f"INSERT INTO products (id, tenant_id, name, description, image_url, "
            f"active, tray_enabled, units_per_tray, is_offer, is_new, sun_info, water_info) VALUES "
            f"({i}, {TENANT_ID}, {dq(name)}, {dq(desc)}, {dq(image_url)}, "
            f"{active}, {tray_enabled}, {units_per_tray}, {is_offer}, {is_new}, {dq(sun_info)}, {dq(water_info)}) "
            f"ON CONFLICT (id) DO NOTHING;"
        )

        for role_key, profile_name in (
            ("_shz_precio_bazar", "bazar"),
            ("_shz_precio_garden", "garden"),
            ("_shz_precio_mayorista", "mayorista"),
        ):
            price = meta_get(meta, role_key)
            if price not in (None, ""):
                lines.append(
                    f"INSERT INTO product_prices (product_id, price_profile_id, price) VALUES "
                    f"({i}, {PROFILE_IDS[profile_name]}, {num(price)}) "
                    f"ON CONFLICT (product_id, price_profile_id) DO NOTHING;"
                )
    lines.append(f"SELECT setval('products_id_seq', {len(products)});")
    lines.append("")

    # --- usuarios ---
    lines.append("-- Usuarios (solo roles de negocio, se omiten cuentas sin rol shz_*/administrator)")
    user_id_map = {}
    next_uid = 1
    omitted_users = 0
    for u in users:
        roles = u.get("roles", [])
        matched_role = next((r for r in roles if r in ROLE_TO_PROFILE), None)
        is_gestor = any(r in GESTOR_ROLES for r in roles)
        if not matched_role and not is_gestor:
            omitted_users += 1
            continue
        uid = next_uid
        next_uid += 1
        user_id_map[u.get("id")] = uid
        email = u.get("email") or u.get("username") or f"usuario{uid}@sin-email.local"
        app_role = "gestor" if is_gestor else "cliente"
        profile_id = PROFILE_IDS.get(ROLE_TO_PROFILE.get(matched_role)) if matched_role else "NULL"
        # Contrasena: los hashes de WordPress no son compatibles con el
        # sistema nuevo. Se marca como pendiente de restablecer; en el
        # dia del corte (Fase 9) cada cliente recibira un enlace para
        # crear su contrasena nueva antes de poder entrar.
        lines.append(
            f"INSERT INTO users (id, tenant_id, email, password_hash, role, price_profile_id, active) VALUES "
            f"({uid}, {TENANT_ID}, {dq(email)}, {dq('MIGRATED_RESET_REQUIRED')}, "
            f"{dq(app_role)}, {profile_id}, TRUE) ON CONFLICT (id) DO NOTHING;"
        )
    lines.append(f"SELECT setval('users_id_seq', {next_uid - 1});")
    lines.append("")

    # --- pedidos ---
    lines.append("-- Pedidos")
    order_count = 0
    skipped_orders = 0
    item_count = 0
    for i, o in enumerate(orders, start=1):
        wc_customer_id = o.get("customer_id")
        new_uid = user_id_map.get(wc_customer_id)
        if not new_uid:
            skipped_orders += 1
            continue
        payment_method = o.get("payment_method_title") or o.get("payment_method") or ""
        vat_amount = num(o.get("total_tax"))
        total_amount = num(o.get("total"))
        status = o.get("status", "")
        order_count += 1

        lines.append(
            f"INSERT INTO orders (id, tenant_id, user_id, payment_method, vat_amount, total_amount, status) VALUES "
            f"({i}, {TENANT_ID}, {new_uid}, {dq(payment_method)}, {vat_amount}, {total_amount}, {dq(status)}) "
            f"ON CONFLICT (id) DO NOTHING;"
        )

        for li in o.get("line_items", []):
            wc_product_id = li.get("product_id")
            new_pid = product_id_map.get(wc_product_id)
            if not new_pid:
                continue
            qty = int(num(li.get("quantity"), 0))
            item_meta = li.get("meta_data", [])
            trays = 0
            loose = qty
            for m in item_meta:
                label = (m.get("display_key") or m.get("key") or "").lower()
                if "bandeja" in label:
                    trays = int(num(m.get("value"), 0))
                elif "suelta" in label or "unidades" in label:
                    loose = int(num(m.get("value"), qty))
            unit_price = num(li.get("price"))
            line_total = num(li.get("total"))
            item_count += 1
            lines.append(
                f"INSERT INTO order_items (order_id, product_id, trays, loose_units, total_units, unit_price, line_total) VALUES "
                f"({i}, {new_pid}, {trays}, {loose}, {qty}, {unit_price}, {line_total});"
            )
    lines.append(f"SELECT setval('orders_id_seq', {len(orders)});")
    lines.append("")
    lines.append("COMMIT;")
    lines.append("")
    lines.append("-- ================= VALIDACION =================")
    lines.append("SELECT 'tenants' AS tabla, count(*) AS filas FROM tenants")
    lines.append("UNION ALL SELECT 'price_profiles', count(*) FROM price_profiles")
    lines.append("UNION ALL SELECT 'products', count(*) FROM products")
    lines.append("UNION ALL SELECT 'product_prices', count(*) FROM product_prices")
    lines.append("UNION ALL SELECT 'users', count(*) FROM users")
    lines.append("UNION ALL SELECT 'orders', count(*) FROM orders")
    lines.append("UNION ALL SELECT 'order_items', count(*) FROM order_items;")
    lines.append("SELECT round(sum(total_amount)::numeric, 2) AS suma_total_pedidos FROM orders;")

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w") as f:
        f.write("\n".join(lines))

    print("== RESUMEN TRANSFORMACION ==")
    print(f"Productos procesados: {len(products)}")
    print(f"Usuarios migrados: {next_uid - 1} (omitidos sin rol de negocio: {omitted_users})")
    print(f"Pedidos migrados: {order_count} (omitidos por cliente sin rol: {skipped_orders})")
    print(f"Lineas de pedido migradas: {item_count}")
    print(f"SQL escrito en {OUT_FILE}")


if __name__ == "__main__":
    main()
