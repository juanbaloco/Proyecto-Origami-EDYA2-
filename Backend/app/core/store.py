import uuid, threading, re
from datetime import datetime
from typing import Dict, Any, List, Optional

LOCK = threading.Lock()

# Categorías válidas (sin DB)
CATEGORY_SLUGS = {"3d", "filigrama", "pliegues", "ensambles"}

# Productos en memoria: id -> dict
PRODUCTS: Dict[str, Dict[str, Any]] = {}

SKU_PATTERN = r"^[A-Z]{3}-\d{3}$"  # AAA-999

def slugify(text: str) -> str:
    s = text.strip().lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-{2,}", "-", s)
    return s

def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"

def add_product(data: Dict[str, Any]) -> Dict[str, Any]:
    # Validaciones de negocio
    if not re.match(SKU_PATTERN, data["sku"]):
        raise ValueError("SKU inválido (formato AAA-999)")
    data["slug"] = slugify(data["slug"])
    if data.get("categoria_slug"):
        s = data["categoria_slug"].lower()
        if s not in CATEGORY_SLUGS:
            raise ValueError("categoria_slug no válida")
        data["categoria_slug"] = s

    with LOCK:
        # unicidad sku y slug
        for p in PRODUCTS.values():
            if p["sku"] == data["sku"] or p["slug"] == data["slug"]:
                raise KeyError("SKU o slug ya existen")

        pid = str(uuid.uuid4())
        product = {
            "id": pid,
            "nombre": data["nombre"],
            "descripcion": data.get("descripcion"),
            "precio": data["precio"],
            "color": data.get("color"),
            "tamano": data.get("tamano"),
            "material": data.get("material"),
            "imagen_url": data.get("imagen_url"),
            "categoria_slug": data.get("categoria_slug"),  # usamos slug, no id
            "activo": data.get("activo", True),
            "sku": data["sku"],
            "slug": data["slug"],
            "created_at": _now_iso(),
        }
        PRODUCTS[pid] = product
        return product

def get_product(pid: str) -> Optional[Dict[str, Any]]:
    return PRODUCTS.get(pid)

def list_products(q: Optional[str], categoria: Optional[str]) -> List[Dict[str, Any]]:
    items = list(PRODUCTS.values())
    if q:
        ql = q.lower()
        items = [p for p in items if ql in (p["nombre"] or "").lower() or ql in (p.get("descripcion") or "").lower()]
    if categoria:
        items = [p for p in items if (p.get("categoria_slug") or "") == categoria.lower()]
    # ordenar por created_at desc
    items.sort(key=lambda x: x.get("created_at",""), reverse=True)
    return items

def update_product(pid: str, patch: Dict[str, Any]) -> Dict[str, Any]:
    with LOCK:
        if pid not in PRODUCTS:
            raise LookupError("not_found")
        p = PRODUCTS[pid]

        if "sku" in patch and patch["sku"] is not None:
            if not re.match(SKU_PATTERN, patch["sku"]):
                raise ValueError("SKU inválido (formato AAA-999)")
            # unicidad de sku
            for k, other in PRODUCTS.items():
                if k != pid and other["sku"] == patch["sku"]:
                    raise KeyError("sku ya existe")
            p["sku"] = patch["sku"]

        if "slug" in patch and patch["slug"] is not None:
            new_slug = slugify(patch["slug"])
            for k, other in PRODUCTS.items():
                if k != pid and other["slug"] == new_slug:
                    raise KeyError("slug ya existe")
            p["slug"] = new_slug

        if "categoria_slug" in patch and patch["categoria_slug"] is not None:
            s = patch["categoria_slug"].lower()
            if s not in CATEGORY_SLUGS:
                raise ValueError("categoria_slug no válida")
            p["categoria_slug"] = s

        # resto de campos
        for field in ["nombre","descripcion","precio","color","tamano","material","imagen_url","activo"]:
            if field in patch and patch[field] is not None:
                p[field] = patch[field]

        return p

def delete_product(pid: str) -> bool:
    with LOCK:
        return PRODUCTS.pop(pid, None) is not None
