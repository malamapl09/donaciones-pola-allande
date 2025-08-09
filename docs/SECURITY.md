# Guía de Seguridad - Donaciones Pola de Allande

## Visión General

Este documento describe las medidas de seguridad implementadas en el sistema de donaciones para proteger los datos de los usuarios y garantizar la integridad del sistema.

## Medidas de Seguridad Implementadas

### 1. Seguridad en el Backend

#### Autenticación y Autorización
- **JWT (JSON Web Tokens)** para autenticación de administradores
- **Tokens con expiración** (24 horas por defecto)
- **Middleware de autenticación** que valida tokens en endpoints protegidos
- **Control de acceso basado en roles**

#### Rate Limiting
- **Límite de donaciones**: 5 intentos por IP cada 15 minutos
- **Límite de login**: 5 intentos por IP cada 15 minutos  
- **Límite general**: 100 solicitudes por IP cada 15 minutos
- **Implementación en memoria** con limpieza automática

#### Validación y Sanitización
- **Validación de entrada** para todos los endpoints
- **Sanitización HTML** para prevenir XSS
- **Validación de tipos de datos** (emails, teléfonos, montos)
- **Escape de caracteres especiales**

#### Headers de Seguridad
- **Helmet.js** configurado con políticas CSP
- **CORS** configurado para orígenes específicos
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: activado

#### Detección de Actividad Sospechosa
- **Detección de User-Agent sospechosos**
- **Validación de queries maliciosos**
- **Logging de eventos de seguridad**
- **Validación de referrer para operaciones críticas**

### 2. Cumplimiento GDPR

#### Principios Implementados
- **Minimización de datos**: Solo se recopilan datos necesarios
- **Consentimiento explícito** para cookies y tracking
- **Anonimización automática** cuando se solicita
- **Derecho al olvido** implementado
- **Portabilidad de datos** disponible

#### Endpoints de Privacidad
- `POST /api/privacy/data-request` - Exportación o eliminación de datos
- `GET /api/privacy/policy` - Política de privacidad estructurada
- `GET /api/privacy/cookies` - Política de cookies

#### Gestión de Cookies
- **Consent banner** con opciones granulares
- **Categorización de cookies** (esenciales, analytics, marketing)
- **Persistencia de preferencias** en localStorage
- **Integración con Google Analytics** condicional

### 3. Logging y Auditoría

#### Tipos de Logs
- **Access logs**: Todas las solicitudes HTTP
- **Error logs**: Errores del sistema con stack traces
- **Security logs**: Eventos de seguridad y actividad sospechosa
- **Donation logs**: Registro de todas las donaciones
- **Audit logs**: Acciones administrativas

#### Formato de Logs
```json
{
  "timestamp": "2025-08-09T12:00:00.000Z",
  "event": "DONATION_CREATED",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": { "amount": 50.00, "isAnonymous": false }
}
```

### 4. Cifrado y Hashing

#### Cifrado de Datos Sensibles
- **AES-256-GCM** para cifrado simétrico
- **PBKDF2** para derivación de claves
- **Salt único** por cada operación
- **Authentication tags** para integridad

#### Hashing de Contraseñas
- **bcrypt** con salt rounds configurable
- **Almacenamiento seguro** de hashes
- **Comparación timing-safe**

### 5. Validaciones Específicas

#### Donaciones
- **Monto mínimo/máximo**: €0.01 - €100,000
- **Máximo 2 decimales** en los montos
- **Validación de emails y teléfonos**
- **Sanitización de mensajes**

#### Códigos de Referencia
- **Generación única** con timestamp y random
- **Validación de formato**
- **Prevención de colisiones**

## Configuración de Producción

### Variables de Entorno Críticas
```bash
# Claves secretas (CAMBIAR en producción)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
ENCRYPTION_KEY=your-super-secret-encryption-key-32-chars

# URL del frontend para CORS
FRONTEND_URL=https://yourdomain.com

# Base de datos segura
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=true

# Logging
LOG_DIR=/var/log/donaciones
```

### Configuración SSL/HTTPS
```javascript
// Para producción con certificados SSL
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  const fs = require('fs');
  
  const options = {
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    key: fs.readFileSync(process.env.SSL_KEY_PATH)
  };
  
  https.createServer(options, app).listen(443);
}
```

## Mejores Prácticas

### Para Desarrolladores
1. **Nunca** hardcodear secretos en el código
2. **Siempre** validar y sanitizar entradas del usuario
3. **Usar** HTTPS en producción
4. **Revisar** logs regularmente para actividad sospechosa
5. **Actualizar** dependencias regularmente

### Para Administradores
1. **Cambiar** todas las claves por defecto
2. **Configurar** backups seguros de la base de datos
3. **Monitorear** logs de seguridad
4. **Implementar** firewall y protección DDoS
5. **Realizar** auditorías de seguridad periódicas

## Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:
- **Email**: security@polaallande.org
- **Proceso**: Divulgación responsable con 90 días para corrección

## Compliance

### GDPR (Reglamento General de Protección de Datos)
- ✅ Consentimiento explícito
- ✅ Derecho de acceso
- ✅ Derecho de rectificación
- ✅ Derecho al olvido
- ✅ Portabilidad de datos
- ✅ Minimización de datos
- ✅ Cifrado de datos sensibles

### LOPD (Ley Orgánica de Protección de Datos - España)
- ✅ Registro de actividades de tratamiento
- ✅ Medidas técnicas y organizativas
- ✅ Análisis de riesgo implementado
- ✅ Procedimientos de brecha de datos