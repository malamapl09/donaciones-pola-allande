import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validateDonation = (req: Request, res: Response, next: NextFunction) => {
  const { amount, donorEmail, donorPhone } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Monto inválido' });
  }

  if (donorEmail && !validator.isEmail(donorEmail)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (donorPhone && !validator.isMobilePhone(donorPhone, 'any')) {
    return res.status(400).json({ error: 'Teléfono inválido' });
  }

  next();
};

export const validateReferral = (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nombre requerido (mínimo 2 caracteres)' });
  }

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  next();
};