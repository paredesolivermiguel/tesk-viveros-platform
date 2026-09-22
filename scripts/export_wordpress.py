#!/usr/bin/env python3
"""
Exportacion de solo lectura desde WordPress/WooCommerce (viverossimonharo.es)
via las APIs REST oficiales. No modifica nada.
"""
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.parse

BASE_URL = "https://viverossimonharo.es/wp-json/wc/v3"
WP_BASE_URL = "https://viverossimonharo.es/wp-json/wp/v2"
CK = os.environ["WC_CONSUMER_KEY"]
CS = os.environ["WC_CONSUMER_SECRET"]
WP_USER = os.environ.get("WP_APP_USER", "")
WP_PASS = os.environ.get("WP_APP_PASSWORD", "")
OUT_DIR = os.environ.get("OUT_DIR", "export")


def fetch_all(endpoint, params=None):
    """Pagina un endpoint de WooCommerce (auth por consumer key/secret)."""
    params = dict(params or {})
    params["consumer_key"] = CK
    params["consumer_secret"] = CS
    params["per_page"] = 100
    page = 1
    items = []
    while True:
        params["page"] = page
        url = f"{BASE_URL}/{endpoint}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"User-Agent": "tesk-migration/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                batch = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"ERROR {endpoint} pagina {page}: {e.code} {body[:300]}", file=sys.stderr)
            raise
        if not batch:
            break
        items.extend(batch)
        print(f"  {endpoint}: pagina {page} -> {len(batch)} elementos (total {len(items)})")
        if len(batch) < params["per_page"]:
            break
        page += 1
        time.sleep(0.3)
    return items


def fetch_all_wp_users():
    """Pagina /wp/v2/users con Basic Auth (Application Password). Incluye
    TODOS los roles, no solo el rol generico 'customer' que usa WooCommerce."""
    if not WP_USER or not WP_PASS:
        print("AVISO: WP_APP_USER/WP_APP_PASSWORD no configurados, se omite", file=sys.stderr)
        return []
    token = base64.b64encode(f"{WP_USER}:{WP_PASS}".encode()).decode()
    page = 1
    items = []
    while True:
        params = {"per_page": 100, "page": page, "context": "edit"}
        url = f"{WP_BASE_URL}/users?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={
            "User-Agent": "tesk-migration/1.0",
            "Authorization": f"Basic {token}",
        })
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                batch = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"ERROR wp/v2/users pagina {page}: {e.code} {body[:300]}", file=sys.stderr)
            raise
        if not batch:
            break
        items.extend(batch)
        print(f"  wp/v2/users: pagina {page} -> {len(batch)} elementos (total {len(items)})")
        if len(batch) < 100:
            break
        page += 1
        time.sleep(0.3)
    return items


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print("Exportando productos...")
    products = fetch_all("products", {"status": "any"})
    with open(f"{OUT_DIR}/products.json", "w") as f:
        json.dump(products, f, ensure_ascii=False)
    print(f"-> {len(products)} productos")

    print("Exportando usuarios (todos los roles)...")
    users = fetch_all_wp_users()
    with open(f"{OUT_DIR}/customers.json", "w") as f:
        json.dump(users, f, ensure_ascii=False)
    print(f"-> {len(users)} usuarios")

    print("Exportando pedidos...")
    orders = fetch_all("orders", {"status": "any"})
    with open(f"{OUT_DIR}/orders.json", "w") as f:
        json.dump(orders, f, ensure_ascii=False)
    print(f"-> {len(orders)} pedidos")

    total_orders_amount = sum(float(o.get("total", 0) or 0) for o in orders)

    summary = {
        "products_count": len(products),
        "customers_count": len(users),
        "orders_count": len(orders),
        "orders_total_amount": round(total_orders_amount, 2),
    }
    with open(f"{OUT_DIR}/summary.json", "w") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("== RESUMEN EXPORTACION ==")
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    if users:
        print("== ROLES ENCONTRADOS ==")
        roles_count = {}
        for u in users:
            for r in u.get("roles", []):
                roles_count[r] = roles_count.get(r, 0) + 1
        print(json.dumps(roles_count, ensure_ascii=False, indent=2))
        print("== EJEMPLO DE UN USUARIO ==")
        sample_u = users[0]
        print(f"  username: {sample_u.get('username')}")
        print(f"  email: {sample_u.get('email')}")
        print(f"  roles: {sample_u.get('roles')}")
        for k, v in (sample_u.get("meta") or {}).items():
            print(f"  meta.{k} = {v}")

    if products:
        print("== EJEMPLO META_DATA DE UN PRODUCTO ==")
        sample = next((p for p in products if p.get("meta_data")), products[0])
        for m in sample.get("meta_data", []):
            key = m.get("key", "")
            if key.startswith("_shz") or key in ("_price", "_regular_price"):
                print(f"  {key} = {m.get('value')}")


if __name__ == "__main__":
    main()

