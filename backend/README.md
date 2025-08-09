# Backend - Donaciones Pola de Allande

Backend API para el sistema de donaciones del evento "El Día del Inmigrante 2026".

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con los valores correctos
```

3. Iniciar en modo desarrollo:
```bash
npm run dev
```

## Estructura

```
src/
├── routes/          # Rutas de la API
├── models/          # Modelos de datos
├── middleware/      # Middleware personalizado
├── utils/           # Utilidades
└── types/           # Tipos TypeScript
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/donations` - Nueva donación
- `GET /api/donations/stats` - Estadísticas públicas
- `GET /api/referrals/:code` - Info de referencia
- `POST /api/referrals` - Crear enlace de referencia

## Desarrollo

- Puerto: 3001
- Base de datos: PostgreSQL
- Autenticación: JWT