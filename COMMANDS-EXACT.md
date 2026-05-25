# 🔧 COMANDOS EXACTOS — Despliegue FRAY RENT CAR a Railway + Vercel

## ⏰ Tiempo estimado: 45 minutos

---

## SECCIÓN 1️⃣: GitHub (5 min)

### 1.1 Hacer commit y push a GitHub

```powershell
# Cambiar a directorio del proyecto
cd "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system"

# Verificar estado
git status

# Agregar todos los cambios (excepto .env por gitignore)
git add .

# Hacer commit
git commit -m "feat: deployment ready - env files, db schema, production config"

# Ver últimos commits
git log --oneline | head -3
```

### 1.2 Crear repositorio en GitHub (MANUAL)

```
1. Abrir: https://github.com/new
2. Nombre: fray-rent-car
3. Descripción: "Premium car rental system - Node/React/MySQL"
4. Privado: Sí (o Público, tu elección)
5. Clickear: Create repository
6. Copiar URL del repositorio (será tipo: https://github.com/TU-USER/fray-rent-car.git)
```

### 1.3 Conectar y pushear

```powershell
# Reemplaza TU-USER con tu usuario de GitHub
git remote add origin https://github.com/TU-USER/fray-rent-car.git
git branch -M main
git push -u origin main

# Verificar
git remote -v
# Output debe mostrar: origin https://github.com/TU-USER/fray-rent-car.git
```

---

## SECCIÓN 2️⃣: Instalar CLIs Localmente (5 min)

```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Instalar Vercel CLI
npm install -g vercel

# Verificar instalaciones
railway --version
vercel --version
```

---

## SECCIÓN 3️⃣: Login en plataformas (5 min)

### 3.1 Railway

```powershell
railway login
# Se abrirá navegador
# 1. Crear o ingresar cuenta: https://railway.app
# 2. Autorizar CLI
# 3. Volver a PowerShell (debe estar conectado)
```

### 3.2 Vercel

```powershell
vercel login
# Escoger método:
#   - GitHub (RECOMENDADO - usa cuenta GitHub que ya tienes)
#   - Email / GitLab / Bitbucket
# 1. Escoger opción
# 2. Autorizar en navegador
# 3. Volver a PowerShell
```

---

## SECCIÓN 4️⃣: Despliegue Backend a Railway (10 min)

### 4.1 Inicializar proyecto Railway desde CLI

```powershell
cd "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system\backend"

railway init

# Respuestas de Railway:
#   Create new project? → YES
#   Project name → fray-rent-car-api
#   Environment → production

# Esperar a que se cree
```

### 4.2 Agregar servicio MySQL

```powershell
# Dentro de carpeta backend
railway add

# En el menú: seleccionar "MySQL"
# Esperar a que se agregue (crea automáticamente variables de BD)

# Verificar
railway variables list

# Output mostrará: DB_HOST, DB_PASSWORD (que Railway renombra a DB_PASS), DB_USER, DB_NAME
```

### 4.3 Configurar variables de producción

```powershell
# Desde carpeta backend, agregar variables:

railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set JWT_EXPIRES_IN="8h"
railway variables set CORS_ORIGIN="https://fray-rent-car.com,https://admin.fray-rent-car.com"

# Verificar todas las variables
railway variables list

# Output debe mostrar todas estas variables + las autogeneradas de BD
```

### 4.4 Exportar BD actual a SQL

```powershell
# En PowerShell (Windows), usar comando mysqldump
mysqldump -u root -p fray_rent_car > "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system\database\prod-backup.sql"

# Cuando pida password: escribe la contraseña de MySQL local (probablemente vacía)
# Esperar a que termina
```

### 4.5 Importar BD en Railway

```powershell
# Ver conexión de BD de Railway
railway variables list
# Copiar: DB_HOST, DB_USER, DB_PASSWORD (es DB_PASS)

# Conectar a BD railway y cargar SQL
railway run mysql -h {DB_HOST} -u {DB_USER} -p{DB_PASSWORD} {DB_NAME} < database/prod-backup.sql

# Donde:
#   {DB_HOST} = valor de railway variables list
#   {DB_USER} = railway_user (o el que asignó railway)
#   {DB_PASSWORD} = el password que mostró railway
#   {DB_NAME} = fray_rent_car_prod (o el que asignó)

# Ejemplo real (ADAPTALO A TUS VALORES):
railway run mysql -h mysql.railway.internal -u railway -pXrTpQw123 fray_rent_car_prod < database/prod-backup.sql
```

### 4.6 Desplegar

```powershell
# Asegurar que branch main esté pusheado
git push origin main

# Railway se desplegará automáticamente
# Ver logs de despliegue:
railway logs -f

# Cuando veas "Server listening on port XXXX" → Backend está UP
# Presionar CTRL+C para salir de logs
```

### 4.7 Obtener URL del Backend

```powershell
# Ver detalles del proyecto
railway projects list
railway environments list

# Railway asignará URL tipo: https://fray-rent-car-api-prod.up.railway.app
# GUARDAR ESTA URL para usar en Vercel
```

### 4.8 Probar endpoint

```powershell
# Reemplazar con tu URL de railway
curl https://tu-railway-url.up.railway.app/api/health

# Output debe ser JSON sin errores
```

---

## SECCIÓN 5️⃣: Despliegue web-public a Vercel (8 min)

### 5.1 Deploy inicial

```powershell
cd "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system\web-public"

vercel --prod

# Respuestas:
#   Project name → fray-rent-car-web
#   Link to existing? → NO
#   Directory to deploy → . (punto, default)
#   Vercel CLI configurará todo automáticamente

# Al terminar, Vercel mostrará URL: https://fray-rent-car-web.vercel.app
# GUARDAR ESTA URL
```

### 5.2 Configurar variable de entorno en Vercel (MANUAL)

```
1. Abrir: https://vercel.com/dashboard
2. Seleccionar proyecto: fray-rent-car-web
3. Ir a Settings → Environment Variables
4. Agregar nuevo:
   Name: VITE_API_URL
   Value: https://tu-railway-url.up.railway.app/api
   Environments: Production, Preview, Development
5. Guardar (Save)
6. Ir a Deployments → esperar que redeploy automático termine
```

### 5.3 Redeploy con variables configuradas

```powershell
cd "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system\web-public"

# Descargar variables de Vercel
vercel env pull

# Build local para verificar (opcional pero recomendado)
npm run build

# Hacer redeploy a producción
vercel --prod

# Esperar a que termine
```

---

## SECCIÓN 6️⃣: Despliegue admin-panel a Vercel (8 min)

### 6.1 Deploy inicial

```powershell
cd "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system\admin-panel"

vercel --prod

# Respuestas:
#   Project name → fray-rent-car-admin
#   Link to existing? → NO
#   Directory → . (default)

# Al terminar → https://fray-rent-car-admin.vercel.app
# GUARDAR ESTA URL
```

### 6.2 Configurar variable de entorno en Vercel (MANUAL)

```
1. Abrir: https://vercel.com/dashboard
2. Seleccionar proyecto: fray-rent-car-admin
3. Settings → Environment Variables
4. Agregar:
   Name: VITE_API_URL
   Value: https://tu-railway-url.up.railway.app/api
   Environments: Production, Preview, Development
5. Guardar
6. Esperar redeploy automático
```

### 6.3 Redeploy con variables

```powershell
cd "C:\Users\carlo\Desktop\FRAY RENT CA\fray-rent-system\admin-panel"

vercel env pull
npm run build
vercel --prod

# Esperar a que termine
```

---

## SECCIÓN 7️⃣: Pruebas Post-Deploy (5 min)

### 7.1 Verificar Backend

```powershell
# Reemplazar URL con tu railway-url
curl https://tu-railway-url.up.railway.app/api/health

# Debe retornar:
# {
#   "message":"API OK",
#   "database":"connected"
# }
```

### 7.2 Verificar Web Pública

```
1. Abrir en navegador: https://fray-rent-car-web.vercel.app
2. Debe cargar página home
3. Abrir Developer Tools (F12)
4. Ir a Network tab
5. Debe ver requests a API de Railway sin errores CORS
```

### 7.3 Verificar Admin Panel

```
1. Abrir: https://fray-rent-car-admin.vercel.app
2. Debe cargar página de login
3. Abrir Developer Tools (F12)
4. Intentar login con credenciales de BD
5. Debe redirigir a dashboard
```

---

## 📋 Resumen de URLs Generadas

Cuando TODO esté desplegado, tendrás:

| Servicio | URL | Almacenado en |
|----------|-----|---------------|
| Backend API | `https://tu-railway-app.up.railway.app` | Railway Dashboard |
| Web Pública | `https://fray-rent-car-web.vercel.app` | Vercel Dashboard |
| Admin Panel | `https://fray-rent-car-admin.vercel.app` | Vercel Dashboard |
| Base de Datos | Interior de Railway (no publica) | Railway Variables |

---

## ⚠️ Si algo falla

### Error: "CORS blocked"
```powershell
# Verificar CORS_ORIGIN en Railway
railway variables list
# Debe incluir ambos dominios Vercel sin errores

# Actualizar si es necesario
railway variables set CORS_ORIGIN="https://fray-rent-car-web.vercel.app,https://fray-rent-car-admin.vercel.app"
```

### Error: "API 404 Not Found"
```powershell
# Verificar que VITE_API_URL esté correcta en Vercel
# 1. Rails → Settings → Environment Variables
# 2. Debe ser: https://tu-railway-url/api (SIN /api al final)
# 3. Redeploy: vercel --prod
```

### Error: "Database connection refused"
```powershell
# Verificar que BD existe en Railway
railway run mysql -h {DB_HOST} -u {DB_USER} -p{DB_PASS} -e "SHOW DATABASES;"
# Debe mostrar fray_rent_car_prod

# Si no existe, reimportar:
railway run mysql -h {DB_HOST} -u {DB_USER} -p{DB_PASS} fray_rent_car_prod < database/prod-backup.sql
```

---

## ✅ Checklist Final

- [ ] GitHub repo creado y pusheado
- [ ] Railway backend UP
- [ ] BD importada en Railway
- [ ] Vercel web-public deployado
- [ ] Vercel admin-panel deployado
- [ ] Variables VITE_API_URL en Vercel OK
- [ ] `/api/health` responde sin errores
- [ ] Web pública carga sin CORS errors
- [ ] Admin login funciona

**Tiempo total estimado: ~45 minutos**

---

## 🎉 Próximo paso

Una vez todo esté online:
- [ ] Configurar dominio en Arsys
- [ ] Apuntar DNS a Vercel y Railway
- [ ] Configurar SSL certificates
- [ ] Hacer test E2E completo

