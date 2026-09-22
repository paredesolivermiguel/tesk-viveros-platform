#!/usr/bin/env python3
"""
Exportacion de solo lectura desde WooCommerce (viverossimonharo.es) via la
API REST oficial. No modifica nada en WordPress.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.parse

BASE_URL = "https://viverossimonharo.es/wp-json/wc/v3"
CK = os.environ["WC_CONSUMER_KEY"]
CS = os.environ["WC_CONSUMER_SECRET"]
OUT_DIR = os.environ.get("OUT_DIR", "export")


def fetch_all(endpoint, params=None):
    """Pagina un endpoint de WooCommerce hasta agotar resultados."""
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


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print("Exportando productos...")
    products = fetch_all("products", {"status": "any"})
    with open(f"{OUT_DIR}/products.json", "w") as f:
        json.dump(products, f, ensure_ascii=False)
    print(f"-> {len(products)} productos")

    print("Exportando clientes...")
    customers = fetch_all("customers")
    with open(f"{OUT_DIR}/customers.json", "w") as f:
        json.dump(customers, f, ensure_ascii=False)
    print(f"-> {len(customers)} clientes")

    print("Exportando pedidos...")
    orders = fetch_all("orders", {"status": "any"})
    with open(f"{OUT_DIR}/orders.json", "w") as f:
        json.dump(orders, f, ensure_ascii=False)
    print(f"-> {len(orders)} pedidos")

    total_orders_amount = sum(float(o.get("total", 0) or 0) for o in orders)

    summary = {
        "products_count": len(products),
        "customers_count": len(customers),
        "orders_count": len(orders),
        "orders_total_amount": round(total_orders_amount, 2),
    }
    with open(f"{OUT_DIR}/summary.json", "w") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("== RESUMEN EXPORTACION ==")
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    if products:
        print("== EJEMPLO META_DATA DE UN PRODUCTO ==")
        sample = next((p for p in products if p.get("meta_data")), products[0])
        for m in sample.get("meta_data", []):
            key = m.get("key", "")
            if key.startswith("_shz") or key in ("_price", "_regular_price"):
                print(f"  {key} = {m.get('value')}")

    if customers:
        print("== EJEMPLO META_DATA DE UN CLIENTE ==")
        sample_c = next((c for c in customers if c.get("meta_data")), customers[0])
        print(f"  role/username: {sample_c.get('username')}")
        for m in sample_c.get("meta_data", []):
            key = m.get("key", "")
            if "zona" in key.lower() or "perfil" in key.lower() or key.startswith("_shz"):
                print(f"  {key} = {m.get('value')}")


if __name__ == "__main__":
    main()
