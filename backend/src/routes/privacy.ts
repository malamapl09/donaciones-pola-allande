import { Router, Request, Response } from 'express';
import { validateEmail } from '../middleware/validation';
import { rightToBeForgettenHandler, dataPortabilityHandler } from '../middleware/gdpr';

const router = Router();

router.post('/data-request', async (req: Request, res: Response) => {
  try {
    const { email, requestType } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Email válido requerido' });
    }

    if (!['export', 'delete'].includes(requestType)) {
      return res.status(400).json({ error: 'Tipo de solicitud inválido' });
    }

    if (requestType === 'export') {
      const userData = await dataPortabilityHandler(email);
      
      res.json({
        message: 'Exportación de datos generada exitosamente',
        data: userData
      });
    } else if (requestType === 'delete') {
      const success = await rightToBeForgettenHandler(email);
      
      if (success) {
        res.json({
          message: 'Datos eliminados exitosamente conforme al derecho al olvido (GDPR Artículo 17)'
        });
      } else {
        res.status(500).json({
          error: 'Error al eliminar los datos. Contacta con soporte.'
        });
      }
    }

  } catch (error) {
    console.error('Error processing GDPR request:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/policy', (req: Request, res: Response) => {
  const privacyPolicy = {
    lastUpdated: '2025-08-09',
    version: '1.0',
    policy: {
      dataController: {
        name: 'Asociación Cultural Pola de Allande',
        email: 'donaciones@polaallande.org',
        address: 'Pola de Allande, Asturias, España'
      },
      dataCollection: {
        purpose: 'Gestionar donaciones para El Día del Inmigrante 2026',
        lawfulBasis: 'Consentimiento y interés legítimo',
        dataTypes: [
          'Nombre (opcional)',
          'Email (opcional)',
          'Teléfono (opcional)',
          'País (opcional)',
          'Monto de donación',
          'Mensaje (opcional)'
        ]
      },
      dataRetention: {
        period: '7 años desde la última actividad',
        purpose: 'Cumplimiento legal y contable'
      },
      rights: [
        {
          right: 'Acceso (Artículo 15)',
          description: 'Obtener copia de tus datos personales'
        },
        {
          right: 'Rectificación (Artículo 16)',
          description: 'Corregir datos incorrectos'
        },
        {
          right: 'Supresión (Artículo 17)',
          description: 'Eliminar tus datos personales'
        },
        {
          right: 'Portabilidad (Artículo 20)',
          description: 'Exportar tus datos en formato estructurado'
        },
        {
          right: 'Oposición (Artículo 21)',
          description: 'Oponerte al tratamiento de tus datos'
        }
      ],
      security: {
        measures: [
          'Cifrado de datos en tránsito y reposo',
          'Control de acceso basado en roles',
          'Auditorías de seguridad regulares',
          'Backup seguro y recuperación de datos'
        ]
      },
      thirdParties: {
        sharing: 'No compartimos datos personales con terceros sin consentimiento',
        processors: [
          'Servicios de hosting (con acuerdos de procesamiento de datos)',
          'Servicios de email (solo para comunicaciones autorizadas)'
        ]
      },
      contact: {
        dpo: 'donaciones@polaallande.org',
        complaints: 'Agencia Española de Protección de Datos (AEPD)'
      }
    }
  };

  res.json(privacyPolicy);
});

router.get('/cookies', (req: Request, res: Response) => {
  const cookiePolicy = {
    lastUpdated: '2025-08-09',
    version: '1.0',
    cookies: {
      essential: [
        {
          name: 'session',
          purpose: 'Mantener sesión de usuario autenticado',
          expiry: '24 horas',
          type: 'HTTP-only'
        }
      ],
      analytics: [
        {
          name: '_ga',
          purpose: 'Google Analytics - identificación de usuario',
          expiry: '2 años',
          provider: 'Google'
        },
        {
          name: '_gid',
          purpose: 'Google Analytics - identificación de sesión',
          expiry: '24 horas',
          provider: 'Google'
        }
      ],
      preferences: [
        {
          name: 'cookieConsent',
          purpose: 'Recordar preferencias de cookies',
          expiry: '1 año',
          type: 'Local Storage'
        }
      ]
    },
    consent: {
      required: true,
      withdrawable: true,
      contact: 'donaciones@polaallande.org'
    }
  };

  res.json(cookiePolicy);
});

export default router;