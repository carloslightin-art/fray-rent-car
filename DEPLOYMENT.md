# FRAY RENT CAR - Guía de Despliegue a Producción

## 1. Checklist Pre-Deploy

### 1.1 Variables de Entorno Requeridas

| Variable | Backend | Admin | Web | Descripción |
|----------|---------|-------|-----|-------------|
| `PORT` | ✅ | ❌ | ❌ | Puerto backend (default: 5001) |
| `DB_HOST` | ✅ | ❌ | ❌ | Host MySQL |
| `DB_PORT` | ✅ | ❌ | ❌ | Puerto MySQL (default: 3306) |
| `DB_USER` | ✅ | ❌ | ❌ | Usuario MySQL |
| `DB_PASS` | ✅ | ❌ | ❌ | Password MySQL |
| `DB_NAME` | ✅ | ❌ | ❌ | Nombre base de datos |
| `JWT_SECRET` | ✅ | ❌ | ❌ | Clave secreta JWT |
| `JWT_EXPIRES_IN` | ✅ | ❌ | ❌ | Expiración JWT (default: 8h) |
| `VITE_API_URL` | ❌ | ✅ | ✅ | URL API backend |

### 1.2 Credenciales a Cambiar ANTES de Producción

| # | Item | Valor Actual | Acción Requerida |
|---|------|--------------|------------------|
| 1 | JWT_SECRET | No usar valores reales en documentación | Generar nuevo: `openssl rand -base64 32` |
| 2 | DB_PASS (MySQL) | No usar valores reales en documentación | Crear password robusto en el servidor |
| 3 | Passwords usuarios seed | Hasheados en seed-data.sql | Regenerar con bcrypt |
| 4 | Puertos desarrollo | 5001, 5173, 5174 | Configurar para producción (80, 443) |

### 1.3 Archivos de Configuración a Preparar

```bash
# Backend - crear .env.production
cp backend/.env backend/.env.production

# Editar con valores de producción:
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=frayrent
DB_PASS=<password_fuerte>
DB_NAME=fray_rent_car
JWT_SECRET=<nuevo_secret_generado>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://frayrentcar.com

# Admin - crear .env.production
cp admin-panel/.env admin-panel/.env.production
VITE_API_URL=https://api.frayrentcar.com

# Web Public - crear .env.production
cp web-public/.env web-public/.env.production
VITE_API_URL=https://api.frayrentcar.com
```

---

## 2. Pasos Exactos de Despliegue (DigitalOcean Ubuntu)

### 2.1 Preparación del Servidor

```bash
# 1. Conectar al droplet
ssh root@<tu_droplet_ip>

# 2. Actualizar sistema
apt update && apt upgrade -y

# 3. Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Instalar MySQL 8.0
apt install -y mysql-server

# 5. Configurar MySQL
mysql_secure_installation
# - Establecer password root de MySQL
# - Remover usuarios anónimos
# - Deshabilitar login remoto como root

# 6. Crear usuario y base de datos MySQL
mysql -u root -p
CREATE DATABASE fray_rent_car CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'frayrent'@'localhost' IDENTIFIED BY '<password_fuerte>';
GRANT ALL PRIVILEGES ON fray_rent_car.* TO 'frayrent'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 7. Instalar PM2 para gestión de procesos
npm install -g pm2

# 8. Instalar Nginx
apt install -y nginx

# 9. Instalar Certbot para SSL
apt install -y certbot python3-certbot-nginx
```

### 2.2 Despliegue del Código

```bash
# 1. Crear directorio de la aplicación
mkdir -p /var/www/fray-rent-car
cd /var/www/fray-rent-car

# 2. Subir código (desde tu máquina local)
# Opción A: Git clone
git clone <tu_repo_url> .

# Opción B: SCP
scp -r ./fray-rent-system/* root@<tu_droplet_ip>:/var/www/fray-rent-car/

# 3. Instalar dependencias backend
cd /var/www/fray-rent-car/backend
npm install --production

# 4. Crear directorio uploads
mkdir -p /var/www/fray-rent-car/backend/uploads/vehicles

# 5. Importar base de datos
mysql -u frayrent -p fray_rent_car < /var/www/fray-rent-car/database/fray-rent-car.sql
mysql -u frayrent -p fray_rent_car < /var/www/fray-rent-car/database/vehicles-upgrade.sql
mysql -u frayrent -p fray_rent_car < /var/www/fray-rent-car/database/seed-data.sql
mysql -u frayrent -p fray_rent_car < /var/www/fray-rent-car/database/website-content.sql
```

### 2.3 Configuración de Variables de Entorno

```bash
# 1. Backend
cat > /var/www/fray-rent-car/backend/.env << EOF
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=frayrent
DB_PASS=<password_fuerte>
DB_NAME=fray_rent_car
JWT_SECRET=<nuevo_secret>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://frayrentcar.com
EOF

# 2. Admin Panel
cat > /var/www/fray-rent-car/admin-panel/.env << EOF
VITE_API_URL=https://api.frayrentcar.com
EOF

# 3. Web Public
cat > /var/www/fray-rent-car/web-public/.env << EOF
VITE_API_URL=https://api.frayrentcar.com
EOF
```

### 2.4 Build de Aplicaciones Frontend

```bash
# 1. Build admin-panel
cd /var/www/fray-rent-car/admin-panel
npm install
npm run build

# 2. Build web-public
cd /var/www/fray-rent-car/web-public
npm install
npm run build
```

### 2.5 Configuración de PM2

```bash
# 1. Crear ecosistema para PM2
cat > /var/www/fray-rent-car/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'fray-rent-backend',
    script: 'src/server.js',
    cwd: '/var/www/fray-rent-car/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/fray-rent-backend-error.log',
    out_file: '/var/log/pm2/fray-rent-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF

# 2. Crear directorio de logs
mkdir -p /var/log/pm2

# 3. Iniciar aplicación
cd /var/www/fray-rent-car
pm2 start ecosystem.config.js
pm2 save

# 4. Configurar inicio automático
pm2 startup
```

### 2.6 Configuración de Nginx

```bash
# 1. Backend API
cat > /etc/nginx/sites-available/fray-rent-api << 'EOF'
server {
    listen 5000;
    server_name api.frayrentcar.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 2. Admin Panel
cat > /etc/nginx/sites-available/fray-rent-admin << 'EOF'
server {
    listen 80;
    server_name admin.frayrentcar.com;

    root /var/www/fray-rent-car/admin-panel/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 3. Web Public
cat > /etc/nginx/sites-available/fray-rent-web << 'EOF'
server {
    listen 80;
    server_name frayrentcar.com www.frayrentcar.com;

    root /var/www/fray-rent-car/web-public/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 4. Habilitar sitios
ln -s /etc/nginx/sites-available/fray-rent-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/fray-rent-admin /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/fray-rent-web /etc/nginx/sites-enabled/

# 5. Probar configuración
nginx -t

# 6. Recargar Nginx
systemctl reload nginx
```

### 2.7 Configuración SSL con Certbot

```bash
# 1. Obtener certificados
certbot --nginx -d frayrentcar.com -d www.frayrentcar.com -d admin.frayrentcar.com -d api.frayrentcar.com

# 2. Renew automático (certbot configura cron automáticamente)
certbot renew --dry-run
```

---

## 3. Validación Post-Deploy

### 3.1 Endpoints a Verificar

```bash
# API Health
curl -s https://api.frayrentcar.com/api/health
# Esperado: {"message":"API OK","database":"connected"}

# Login
curl -s -X POST https://api.frayrentcar.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@frayrentcar.com","password":"<password_original>"}'
# Esperado: {"token":"...","user":{...}}

# Vehicles
curl -s https://api.frayrentcar.com/api/vehicles \
  -H "Authorization: Bearer <token>"
# Esperado: JSON array

# Dashboard
curl -s https://api.frayrentcar.com/api/dashboard/metrics \
  -H "Authorization: Bearer <token>"
# Esperado: JSON con métricas
```

### 3.2 Páginas Web a Verificar

| # | URL | Verificar |
|---|-----|-----------|
| 1 | https://frayrentcar.com | Home carga correctamente |
| 2 | https://frayrentcar.com/fleet | Lista vehículos |
| 3 | https://frayrentcar.com/booking | Formulario de reserva |
| 4 | https://admin.frayrentcar.com | Login admin |
| 5 | https://admin.frayrentcar.com/dashboard | Stats cargando |

---

## 4. Procedimiento de Rollback

### 4.1 Rollback de Código

```bash
# 1. Ver versión anterior
cd /var/www/fray-rent-car
git log --oneline -10

# 2. Revertir a commit anterior
git revert <commit_hash>
git push origin main

# 3. Reconstruir y reiniciar
cd /var/www/fray-rent-car/backend
npm install --production
pm2 restart fray-rent-backend
```

### 4.2 Rollback de Base de Datos

```bash
# 1. Hacer backup antes de rollback
mysqldump -u frayrent -p fray_rent_car > /backup/fray_rent_car_$(date +%Y%m%d_%H%M%S).sql

# 2. Restaurar desde backup
mysql -u frayrent -p fray_rent_car < /backup/fray_rent_car_20260326_120000.sql
```

### 4.3 Rollback de SSL

```bash
# Si hay problemas con SSL
certbot revert --cert-name frayrentcar.com
systemctl reload nginx
```

---

## 5. Criterios de "Producción OK"

| # | Criterio | Verificación |
|---|----------|--------------|
| 1 | ✅ Backend respondiendo | `curl https://api.frayrentcar.com/api/health` |
| 2 | ✅ Auth funcionando | Login con credenciales reales |
| 3 | ✅ Web pública cargando | https://frayrentcar.com devuelve 200 |
| 4 | ✅ Admin cargando | https://admin.frayrentcar.com devuelve 200 |
| 5 | ✅ SSL activo | Candado verde en navegador |
| 6 | ✅ Dashboard con datos | Métricas cargando |
| 7 | ✅ Reservas funcionando | Crear reserva de prueba |
| 8 | ✅ Upload funcionando | Subir imagen de prueba |
| 9 | ✅ PM2 ejecutando | `pm2 status` muestra online |
| 10 | ✅ Logs sin errores | `pm2 logs` sin errores críticos |

---

## 6. Comandos Útiles Post-Deploy

```bash
# Ver logs en tiempo real
pm2 logs fray-rent-backend

# Reiniciar backend
pm2 restart fray-rent-backend

# Ver estado de procesos
pm2 status

# Ver uso de recursos
pm2 monit

# Reiniciar Nginx
systemctl restart nginx

# Ver logs Nginx
tail -f /var/log/nginx/access.log

# Backup de base de datos
mysqldump -u frayrent -p fray_rent_car > /backup/fray_rent_car_$(date +%Y%m%d).sql
```

---

## 7. Contactos de Emergencia

| # | Recurso | Contacto |
|---|---------|----------|
| 1 | Support DigitalOcean | https://cloud.digitalocean.com/support |
| 2 | Estado de servicios | https://status.digitalocean.com |

---

**Documento preparado para despliegue a producción**
**Fecha: 2026-03-26**
