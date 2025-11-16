import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { asyncHandler, APIError } from '../middleware/errorHandler';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// ============================================================================
// REGISTER
// ============================================================================

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, fullName, name } = req.body;

  // Validation
  if (!email || !password) {
    throw new APIError('Email and password are required', 400);
  }

  if (password.length < 8) {
    throw new APIError('Password must be at least 8 characters', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new APIError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName: fullName || name,
      role: 'STUDENT',
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token,
  });
}));

// ============================================================================
// LOGIN
// ============================================================================

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new APIError('Email and password are required', 400);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new APIError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new APIError('Account is inactive', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new APIError('Invalid credentials', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    token,
  });
}));

// ============================================================================
// GET CURRENT USER
// ============================================================================

router.get('/me', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      bio: true,
      preferences: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.json({ user });
}));

// ============================================================================
// UPDATE PROFILE
// ============================================================================

router.patch('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { fullName, bio, avatarUrl, preferences } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(preferences && { preferences }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      bio: true,
      preferences: true,
    },
  });

  res.json({
    message: 'Profile updated successfully',
    user,
  });
}));

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

router.post('/change-password', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword) {
    throw new APIError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new APIError('New password must be at least 8 characters', 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new APIError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password changed successfully' });
}));

// ============================================================================
// LOGOUT (Optional - mostly handled client-side by removing token)
// ============================================================================

router.post('/logout', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  // In a more complex system, you might invalidate the token here
  // For now, just return success
  res.json({ message: 'Logout successful' });
}));

export default router;
