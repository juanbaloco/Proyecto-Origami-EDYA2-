"""
Script para probar la conexión a la base de datos
"""
import sys
import os

# Agregar el directorio Backend al path para que encuentre 'app'
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

try:
    print("=" * 50)
    print("🔍 PROBANDO CONEXIÓN A LA BASE DE DATOS")
    print("=" * 50)
    
    # 1. Importar la conexión
    print("\n1️⃣ Importando configuración de BD...")
    from app.db.database import engine, SessionLocal, Base, DATABASE_PATH
    print(f"✅ Configuración importada correctamente")
    print(f"📂 Ruta de BD: {DATABASE_PATH}")
    
    # 2. Verificar que el archivo de BD existe
    print("\n2️⃣ Verificando archivo de base de datos...")
    if os.path.exists(DATABASE_PATH):
        print(f"✅ Archivo de BD encontrado")
        file_size = os.path.getsize(DATABASE_PATH)
        print(f"📊 Tamaño: {file_size} bytes")
    else:
        print(f"❌ Archivo de BD NO encontrado en: {DATABASE_PATH}")
    
    # 3. Probar conexión
    print("\n3️⃣ Probando conexión a la base de datos...")
    db = SessionLocal()
    print("✅ Sesión de BD creada exitosamente")
    
    # 4. Ejecutar una consulta simple
    print("\n4️⃣ Ejecutando consulta de prueba...")
    from sqlalchemy import text
    result = db.execute(text("SELECT 1")).fetchone()
    print(f"✅ Consulta ejecutada: {result}")
    
    # 5. Cerrar conexión
    db.close()
    print("\n5️⃣ Cerrando conexión...")
    print("✅ Conexión cerrada correctamente")
    
    # 6. Intentar importar modelos
    print("\n6️⃣ Importando modelos...")
    from app.models import Usuario, Producto, Categoria, Carrito, Pedido, Fidelizacion
    print("✅ Todos los modelos importados correctamente")
    
    # 7. Mostrar tablas existentes
    print("\n7️⃣ Verificando tablas en la base de datos...")
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tablas = inspector.get_table_names()
    print(f"📋 Tablas encontradas ({len(tablas)}):")
    for tabla in tablas:
        print(f"   - {tabla}")
    
    print("\n" + "=" * 50)
    print("🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!")
    print("=" * 50)
    
except Exception as e:
    print("\n" + "=" * 50)
    print("❌ ERROR EN LA PRUEBA")
    print("=" * 50)
    print(f"\n🔴 Tipo de error: {type(e).__name__}")
    print(f"🔴 Mensaje: {str(e)}")
    print("\n💡 Posibles soluciones:")
    print("   1. Verifica que SQLAlchemy esté instalado: pip install sqlalchemy")
    print("   2. Verifica la ruta de la base de datos")
    print("   3. Verifica que todos los archivos de modelos existan")
    import traceback
    print("\n📋 Traceback completo:")
    traceback.print_exc()