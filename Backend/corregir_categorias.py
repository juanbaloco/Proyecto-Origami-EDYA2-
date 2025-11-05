import sys
sys.path.insert(0, '.')

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.categoria import Categoria
from app.models.producto import Producto

def corregir_categorias():
    db: Session = SessionLocal()
    
    try:
        print("=" * 60)
        print("🗑️  PASO 1: Eliminando categorías incorrectas...")
        print("=" * 60)
        
        # Eliminar todas las categorías existentes
        categorias_viejas = db.query(Categoria).all()
        for cat in categorias_viejas:
            print(f"  ❌ Eliminando: {cat.nombre}")
            db.delete(cat)
        
        db.commit()
        print("\n✅ Categorías viejas eliminadas\n")
        
        print("=" * 60)
        print("✨ PASO 2: Creando categorías correctas...")
        print("=" * 60)
        
        # Crear las categorías correctas
        categorias_correctas = [
            {
                "nombre": "Origami 3D",
                "slug": "origami-3d",
                "descripcion": "Figuras modulares tridimensionales con técnicas de origami 3D"
            },
            {
                "nombre": "Filigrana",
                "slug": "filigrana",
                "descripcion": "Arte de papel enrollado en tiras delgadas (quilling)"
            },
            {
                "nombre": "Tradicional/Pliegues",
                "slug": "tradicional-pliegues",
                "descripcion": "Origami clásico con técnicas de pliegues tradicionales"
            }
        ]
        
        for cat_data in categorias_correctas:
            nueva = Categoria(**cat_data)
            db.add(nueva)
            print(f"  ✅ Creada: {cat_data['nombre']}")
        
        db.commit()
        print("\n" + "=" * 60)
        print("🎉 ¡CATEGORÍAS CORREGIDAS EXITOSAMENTE!")
        print("=" * 60)
        
        # Mostrar las nuevas categorías
        categorias_nuevas = db.query(Categoria).all()
        print("\n📋 CATEGORÍAS ACTUALES:")
        for cat in categorias_nuevas:
            print(f"  ID: {cat.id} | {cat.nombre} ({cat.slug})")
        
        # Advertencia sobre productos
        productos_sin_categoria = db.query(Producto).filter(
            (Producto.categoria_id == None) | 
            (~Producto.categoria_id.in_([c.id for c in categorias_nuevas]))
        ).count()
        
        if productos_sin_categoria > 0:
            print(f"\n⚠️  ATENCIÓN: Hay {productos_sin_categoria} producto(s) sin categoría asignada")
            print("   Debes asignarles una categoría desde el panel de administrador")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    corregir_categorias()
