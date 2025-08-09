# Arquitectura del Sistema

## Visión General

El sistema consta de tres componentes principales:

1. **Frontend (React SPA)**: Interfaz de usuario responsive
2. **Backend (Node.js/Express)**: API REST y lógica de negocio  
3. **Base de Datos (PostgreSQL)**: Almacenamiento de datos

## Diagrama de Arquitectura

```
[Frontend React] → [API REST] → [PostgreSQL]
       ↓              ↓
[Google Analytics] [Sistema de Referencias]
```

## Componentes del Frontend

- **Páginas Principales:**
  - Landing/Home con información del evento
  - Formulario de donaciones
  - Panel de seguimiento de referencias
  - Páginas informativas (evento, República Dominicana)

- **Componentes Compartidos:**
  - Header/Navigation
  - Footer
  - Barra de progreso de donaciones
  - Formularios reutilizables

## API Backend

### Endpoints Principales:

```
GET    /api/donations              # Estadísticas públicas
POST   /api/donations              # Nueva donación
GET    /api/referrals/:code        # Datos de referencia
POST   /api/referrals              # Crear enlace de referencia

GET    /api/admin/donations        # Dashboard admin
GET    /api/admin/reports          # Reportes y métricas
GET    /api/event/info             # Información del evento
```

### Middlewares:
- Validación de datos
- Rate limiting
- CORS
- Logging
- Error handling

## Base de Datos

### Tablas Principales:

1. **donations**: Registro de donaciones
2. **referrals**: Enlaces y códigos de referencia  
3. **users**: Datos de donantes (opcional/anónimo)
4. **event_info**: Contenido del evento
5. **admin_users**: Acceso administrativo

## Seguridad

- HTTPS obligatorio
- Validación y sanitización de inputs
- Rate limiting en endpoints públicos
- Autenticación JWT para admin
- GDPR compliance para datos personales

## Flujo de Donación

1. Usuario accede (con/sin código referencia)
2. Completa formulario de donación
3. Sistema genera instrucciones de transferencia
4. Confirmación manual por admin
5. Actualización de estadísticas y referencias