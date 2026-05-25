# 🗄️ PLAN DE BASE DE DATOS — FRAY RENT CAR

## Estado de Archivos SQL

```
database/
├── fray-rent-car.sql           → CRÍTICO: Schema principal
├── seed-data.sql               → RECOMENDADO: Datos iniciales
├── vehicles-upgrade.sql        → OPCIONAL: Migraciones
└── website-content.sql         → RECOMENDADO: Contenido web editable
```

---

## 📋 Análisis de Cada Archivo

### 1️⃣ **fray-rent-car.sql** ✅ CRÍTICO - EJECUTAR PRIMERO

**Propósito**: Crear estructura base de BD

**Contenido**:
```sql
✓ CREATE DATABASE fray_rent_car
✓ CREATE TABLE users
✓ CREATE TABLE vehicles
✓ CREATE TABLE clients
✓ CREATE TABLE reservations
✓ Foreign keys configuradas
✓ Indexing único en campos críticos
```

**Tamaño**: 51 líneas | **Tiempo**: <1s

**Seguridad**: SAFE
- Usa `DROP TABLE IF EXISTS` (cuidado en prod si datos existen)
- No contiene credenciales
- Estructura limpia y optimizada

**En Producción**:
```bash
# PRIMERA ejecución (sin datos previos)
mysql -u frayrent -p fray_rent_car < database/fray-rent-car.sql

# POSTERIORES (para resetear):
# Hacer backup ANTES
mysqldump -u root -p fray_rent_car > backup-before-reset.sql

# Luego ejecutar script
```

---

### 2️⃣ **seed-data.sql** ✅ RECOMENDADO - EJECUTAR SEGUNDO

**Propósito**: Llenar BD con datos de prueba y usuarios iniciales

**Contenido**:
```sql
✓ Users:
  - owner@frayrentcar.com (owner) - Password hasheado con bcrypt
  - worker@frayrentcar.com (worker) - Password hasheado con bcrypt

✓ Vehículos de ejemplo:
  - Mercedes S-Class (available)
  - Range Rover Sport (available)
  - Porsche 911 (maintenance)

✓ Clientes de prueba: 3 registros

✓ Reservaciones de ejemplo: 3 reservaciones
```

**Tamaño**: <30 líneas | **Tiempo**: <1s

**Seguridad**: ⚠️ PRECAUCIÓN
- Passwords están hasheados (SAFE)
- Datos de prueba, no contienen credenciales reales
- **PERO**: Los datos son muy básicos, se recomienda cambiar emails/phones

**En Producción**:
```bash
# Ejecutar SOLO si quieres data inicial
# (normalmente para testing)
mysql -u frayrent -p fray_rent_car < database/seed-data.sql

# No necesitas si vas a importar data real después
```

**Credenciales de Prueba Incluidas**:
```
Email: owner@frayrentcar.com
Password: (hasheado - necesitas resetear en UI o BD)

Email: worker@frayrentcar.com
Password: (hasheado - necesitas resetear en UI o BD)
```

---

### 3️⃣ **vehicles-upgrade.sql** ⚠️ OPCIONAL - REVISAR PRIMERO

**Propósito**: Agregar campos adicionales a tabla vehicles

**Contenido**:
```sql
⚠️ ALTER TABLE statements para:
  - category (economico, suv, premium, luxury)
  - is_active (boolean)
  - is_featured (boolean)
  - sort_order (integer)

⚠️ PROBLEMA: Está commented out (con # y --)
```

**Tamaño**: 55 líneas | **Tiempo**: <1s

**Seguridad**: SAFE (no tiene datos)

**En Producción**:
```bash
# NO EJECUTAR directamente - revisar antes
# Algunos campos pueden estar comentados

# Si quieres usarlo, descomentar primero:
mysql -u frayrent -p fray_rent_car < database/vehicles-upgrade.sql
```

**Recomendación**: 
- Si ya existe tabla vehicles con esos campos: SKIP
- Si no exists: revisar y descomentar líneas necesarias

---

### 4️⃣ **website-content.sql** ✅ RECOMENDADO - EJECUTAR TERCERO

**Propósito**: Crear tabla para contenido web editable desde admin

**Contenido**:
```sql
✓ CREATE TABLE website_content
  - id: Primary Key
  - section: (hero, footer, contact, settings, etc)
  - key_name: nombre del campo
  - value: contenido
  - value_type: tipo (text, number, boolean, json)
  - is_active: toggle para activar/desactivar

✓ INSERT con valores iniciales:
  - Home titles
  - Hero texts
  - Footer info
  - Contact details
  - Settings
```

**Tamaño**: 63 líneas | **Tiempo**: <1s

**Seguridad**: SAFE
- No contiene datos sensibles
- Necesaria para funcionalidad de admin "WebsiteContent"

**En Producción**:
```bash
# Ejecutar SIEMPRE (necesaria para admin-panel)
mysql -u frayrent -p fray_rent_car < database/website-content.sql
```

---

## 🎯 PLAN DE EJECUCIÓN POR ESCENARIO

### ESCENARIO A: Primera vez en Producción (RECOMENDADO)

**Orden exacto:**
```bash
# 1. Conectar a BD railway
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS>

# 2. Crear BD
mysql> CREATE DATABASE fray_rent_car_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql> EXIT;

# 3. Ejecutar scripts en orden
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < database/fray-rent-car.sql
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < database/website-content.sql
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < database/seed-data.sql

# 4. Opcionalmente agregar más datos
# mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < database/vehicles-upgrade.sql

# 5. Verificar
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod -e "SHOW TABLES;"
# Debe mostrar: users, vehicles, clients, reservations, website_content
```

**Tiempo total**: ~3 segundos

### ESCENARIO B: Migrar desde local existente

```bash
# 1. En tu máquina local (Windows)
mysqldump -u root -p fray_rent_car > full-backup.sql

# 2. Conectar a railway y crear BD
railway run mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> -e "CREATE DATABASE fray_rent_car_prod CHARACTER SET utf8mb4;"

# 3. Importar backup completo
railway run mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < full-backup.sql

# 4. Verificar
railway run mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> -e "USE fray_rent_car_prod; SHOW TABLES;"
```

### ESCENARIO C: Reset completo en Producción

⚠️ **CUIDADO**: Borra todos los datos

```bash
# 1. Hacer backup ANTES
mysqldump -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod > backup-before-reset.sql

# 2. Volver a esquema base
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < database/fray-rent-car.sql

# 3. Recargar contenido web
mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASS> fray_rent_car_prod < database/website-content.sql

# 4. Llenar con datos nuevos según sea necesario
```

---

## 📊 Estructura de Tablas Finales

```
users
├── id (INT PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── password (VARCHAR - bcrypted)
├── role (ENUM: owner, worker)
└── created_at (TIMESTAMP)

vehicles
├── id (INT PRIMARY KEY)
├── brand (VARCHAR)
├── model (VARCHAR)
├── year (INT)
├── price_per_day (DECIMAL)
├── status (ENUM: available, reserved, maintenance)
├── image_url (VARCHAR nullable)
├── description (TEXT nullable)
├── is_active (BOOLEAN) [if vehicles-upgrade executed]
├── is_featured (BOOLEAN) [if vehicles-upgrade executed]
└── created_at (TIMESTAMP)

clients
├── id (INT PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR UNIQUE)
├── phone (VARCHAR)
├── license_number (VARCHAR UNIQUE)
└── created_at (TIMESTAMP)

reservations
├── id (INT PRIMARY KEY)
├── client_id (INT FK → clients.id)
├── vehicle_id (INT FK → vehicles.id)
├── start_date (DATE)
├── end_date (DATE)
├── total_price (DECIMAL)
├── status (ENUM: pending, confirmed, cancelled, finished)
└── created_at (TIMESTAMP)

website_content
├── id (INT PRIMARY KEY)
├── section (VARCHAR) [hero, footer, contact, settings, etc]
├── key_name (VARCHAR)
├── value (TEXT)
├── value_type (ENUM: text, number, boolean, json)
├── is_active (BOOLEAN)
└── updated_at (TIMESTAMP)
```

---

## ✅ Checklist Pre-Importación

- [ ] BD existe en Railway
- [ ] Variables de conexión están correctas (DB_HOST, DB_USER, DB_PASS)
- [ ] Backup local existe: `mysqldump -u root -p fray_rent_car > backup.sql`
- [ ] Primera ejecución: fray-rent-car.sql OK
- [ ] Segunda ejecución: website-content.sql OK
- [ ] Tercera ejecución: seed-data.sql OK (opcional)
- [ ] `SHOW TABLES;` muestra all 5 tablas
- [ ] Backend puede conectar: `/api/health` retorna "database": "connected"

---

## ⚠️ Riesgos y Mitigación

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|-----------|
| BD no existe | MEDIA | Crear antes: `CREATE DATABASE fray_rent_car_prod;` |
| Credenciales incorrectas | MEDIA | Verificar railway variables list |
| Tabla ya existe | BAJA | Usar `DROP TABLE IF EXISTS` (viene en script) |
| Timeout en importación | BAJA | Usar SSH para conexión directa a Railway |
| Foreign keys fallando | BAJA | Scripts están en orden correcto |
| Datos duplicados | BAJA | No ejecutar seed-data dos veces sin reset |

---

## 📈 Datos de Ejemplo Importados

**Con seed-data.sql**:
- 2 usuarios (owner, worker)
- 3 vehículos (Mercedes, Range Rover, Porsche)
- 3 clientes (ficticios)
- 3 reservaciones (ficticias)

**Solo fray-rent-car.sql**:
- 0 data (solo estructura)
- 0 usuarios (necesarias crear manualmente o vía admin)

**Recomendación**: Ejecutar seed-data.sql para tener BD funcional de inmediato, luego agregar datos reales desde admin-panel.

---

## 🔐 Credenciales en BD

Desde seed-data.sql:
```
Email: owner@frayrentcar.com
Rol: owner
Password: (hasheado en BD con bcrypt - no visible)

Email: worker@frayrentcar.com
Rol: worker
Password: (hasheado en BD con bcrypt - no visible)
```

**Para resetear password**: 
- Usar UI de login (recuperación de password)
- O ejecutar statement SQL manual con nuevo bcrypt hash

---

## ✨ Validación Post-Importación

```bash
# Conectar a BD
railway run mysql -h {DB_HOST} -u {DB_USER} -p{DB_PASS}

# Una vez dentro:
USE fray_rent_car_prod;

# Verificar tablas
SHOW TABLES;

# Verificar usuarios
SELECT COUNT(*) FROM users;

# Verificar vehículos
SELECT COUNT(*) FROM vehicles;

# Verificar website_content
SELECT COUNT(*) FROM website_content;
SELECT DISTINCT section FROM website_content;

# Salir
EXIT;
```

Debe mostrar:
- 5 tablas
- 2 usuarios
- 3 vehículos
- 15+ registros website_content
- Secciones: hero, footer, contact, settings, etc

