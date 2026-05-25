-- Script para actualizar la tabla vehicles con nuevos campos
-- Añade columnas: category, is_active, is_featured, sort_order
-- EJECUTAR SOLO SI la tabla vehicles no tiene estas columnas aún
-- ✅ Este script es SEGURO: no borra datos existentes

USE fray_rent_car;

-- Añadir columnas nuevas (ignorando error si ya existen)
ALTER TABLE vehicles ADD COLUMN category ENUM('economico', 'suv', 'premium', 'luxury') DEFAULT 'economico' AFTER status;
ALTER TABLE vehicles ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER description;
ALTER TABLE vehicles ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER is_active;
ALTER TABLE vehicles ADD COLUMN sort_order INT UNSIGNED DEFAULT 0 AFTER is_featured;

-- Ampliar image_url para URLs largas
ALTER TABLE vehicles MODIFY COLUMN image_url VARCHAR(500) NULL;

-- Verificar estructura
DESCRIBE vehicles;

-- Ver datos existentes (no se han borrado)
SELECT id, brand, model, price_per_day, category, is_active, is_featured, sort_order FROM vehicles;
