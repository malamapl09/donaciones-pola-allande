# Database Schema - Donaciones Pola de Allande

Base de datos PostgreSQL para el sistema de donaciones.

## Estructura de Tablas

### Tablas Principales

1. **donations** - Registro de donaciones
   - Información del donante (nombre, email, país)
   - Monto y moneda
   - Estado (pending, confirmed, rejected)
   - Referencia de seguimiento
   - Código de referral asociado

2. **referrals** - Sistema de referencias
   - Códigos únicos para embajadores
   - Estadísticas de donaciones conseguidas
   - Información de contacto

3. **admin_users** - Usuarios administrativos
   - Autenticación para panel de admin
   - Roles y permisos

4. **event_content** - Contenido del evento
   - Información editable sobre el evento
   - Páginas de República Dominicana
   - Contenido CMS

5. **donation_goals** - Metas de recaudación
   - Objetivos financieros
   - Seguimiento de progreso

6. **certificates** - Certificados digitales
   - Certificados de participación para donantes
   - Numeración única

## Configuración

### Requisitos
- PostgreSQL 12+
- UUID extension

### Instalación

1. Crear base de datos:
```bash
createdb donaciones_pola
```

2. Aplicar schema y datos iniciales:
```bash
./setup.sh donaciones_pola postgres
```

3. O manualmente:
```bash
psql -d donaciones_pola -f schema.sql
psql -d donaciones_pola -f seed.sql
```

## Características

- **UUIDs** como claves primarias
- **Triggers** automáticos para estadísticas
- **Índices** optimizados para consultas frecuentes
- **Constraints** para integridad de datos
- **Funciones** para cálculos automáticos

## Estados de Donación

- `pending` - Pendiente de confirmación
- `confirmed` - Confirmada por administrador
- `rejected` - Rechazada

## Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de emails y teléfonos
- Campos sensibles opcionales para anonimato