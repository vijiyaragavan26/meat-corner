import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { config } from '../config';
import { db, User } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'ADMIN', 'DELIVERY_PARTNER']).default('CUSTOMER')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = db.getUserByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const newUser: User = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      name: validated.name,
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      passwordHash,
      role: validated.role,
      avatarUrl: null,
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createUser(newUser);

    if (validated.role === 'DELIVERY_PARTNER') {
      db.deliveryPartners.push({
        id: `dp_${uuidv4().substring(0, 8)}`,
        userId: newUser.id,
        fullName: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        address: 'Default City Center',
        drivingLicenseNo: 'TN33-TEMP-' + Math.floor(100000 + Math.random() * 900000),
        vehicleType: 'Motorcycle',
        vehicleNumber: 'TN 33 ' + Math.floor(1000 + Math.random() * 9000),
        approvalStatus: 'APPROVED',
        isOnline: true,
        isAvailable: true,
        commissionRate: 40,
        totalDeliveries: 0,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);
    const user = db.getUserByEmail(validated.email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // If delivery partner, return partner record
    const deliveryPartner = user.role === 'DELIVERY_PARTNER' ? db.getDeliveryPartnerByUserId(user.id) : undefined;

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl
        },
        deliveryPartner
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: err.errors[0].message });
    }
    return res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const dp = req.user.role === 'DELIVERY_PARTNER' ? db.getDeliveryPartnerByUserId(req.user.id) : undefined;
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        avatarUrl: req.user.avatarUrl
      },
      deliveryPartner: dp
    }
  });
};
