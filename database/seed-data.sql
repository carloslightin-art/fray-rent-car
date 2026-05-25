USE fray_rent_car;

INSERT INTO users (name, email, password, role) VALUES
('Owner FRAY', 'owner@frayrentcar.com', '$2a$10$PfFGLjiLLPCszJ8ynR/IyetPSt24KZEqF.b7d0P.xlS0zNplLizB2', 'owner'),
('Worker FRAY', 'worker@frayrentcar.com', '$2a$10$ngxoppz6mZi49ZCprl8NwOt.UuDSWPIqbZ67XbUNm/iVMig6iF28u', 'worker');

-- Vehicles con imagen fallback visible en admin/web
INSERT INTO vehicles (brand, model, year, price_per_day, status, image_url, description) VALUES
('Mercedes', 'S-Class', 2024, 220.00, 'available', '/images/vehicles/car-3.jpg', 'Sedán ejecutivo premium'),
('Range Rover', 'Sport', 2023, 260.00, 'available', '/images/vehicles/car-1.jpg', 'SUV premium de alto confort'),
('Porsche', '911', 2022, 390.00, 'maintenance', '/images/vehicles/car-2.jpg', 'Deportivo de alto rendimiento');

INSERT INTO clients (name, email, phone, license_number) VALUES
('Carlos Méndez', 'carlos.mendez@email.com', '+1 809 100 0200', 'LIC-RD-10001'),
('Laura Gómez', 'laura.gomez@email.com', '+1 809 300 0400', 'LIC-RD-10002'),
('Grupo Altamira', 'contacto@altamira.com', '+1 809 888 0111', 'LIC-RD-10003');

INSERT INTO reservations (client_id, vehicle_id, start_date, end_date, total_price, status) VALUES
(1, 1, '2026-03-20', '2026-03-23', 660.00, 'confirmed'),
(2, 2, '2026-03-25', '2026-03-27', 520.00, 'pending'),
(3, 3, '2026-04-01', '2026-04-02', 390.00, 'cancelled');
