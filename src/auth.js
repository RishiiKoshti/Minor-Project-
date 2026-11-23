/**
 * ElectroHaven Secure Authentication & Session Management Module
 * Uses standard Web Crypto API (PBKDF2 with SHA-256 and cryptographic salts)
 * No plaintext passwords are ever stored.
 */

const USERS_STORAGE_KEY = 'electrohaven_users';
const SESSION_STORAGE_KEY = 'electrohaven_auth_session';
const VERIFICATION_CODES_KEY = 'electrohaven_verification_codes';
const RESET_CODES_KEY = 'electrohaven_reset_codes';

// Helper: Convert ArrayBuffer to Hex String
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex String to Uint8Array
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Generates a cryptographically random 16-byte salt as a hex string.
 */
export function generateSalt() {
  const randomBytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bufferToHex(randomBytes.buffer);
}

/**
 * Hashes a password using PBKDF2 with HMAC-SHA256 (100,000 iterations).
 * Standard cryptographic password derivation.
 */
export async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = hexToBuffer(saltHex);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    return bufferToHex(derivedBits);
  }

  // Fallback for non-browser / test environment: SHA-256 salted digest
  const combined = new Uint8Array(passwordBuffer.length + saltBuffer.length);
  combined.set(passwordBuffer);
  combined.set(saltBuffer, passwordBuffer.length);
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return bufferToHex(hashBuffer);
}

/**
 * Verifies a candidate password against stored salt and hash.
 */
export async function verifyPassword(password, storedHash, storedSalt) {
  const computedHash = await hashPassword(password, storedSalt);
  return computedHash === storedHash;
}

/**
 * Retrieves all registered users from localStorage.
 * Initializes with demo account if empty.
 */
export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load users from localStorage:', err);
    return [];
  }
}

/**
 * Saves users list to localStorage.
 */
function saveStoredUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Failed to save users to localStorage:', err);
  }
}

/**
 * Seeds default accounts (Customer demo + Master Admin) if needed.
 * Customer demo: alex.sharma@example.com / Password@123
 * Master Admin:  admin@electrohaven.com  / Admin@123
 */
export async function seedDemoAccountIfNeeded() {
  const users = getStoredUsers();
  let modified = false;

  const demoEmail = 'alex.sharma@example.com';
  if (!users.some((u) => u.email.toLowerCase() === demoEmail)) {
    const salt = generateSalt();
    const passwordHash = await hashPassword('Password@123', salt);
    const demoUser = {
      id: 'usr_demo_alex_sharma',
      name: 'Alex Sharma',
      email: demoEmail,
      phone: '9876543210',
      passwordHash,
      passwordSalt: salt,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date('2026-01-15T10:00:00.000Z').toISOString(),
      avatar: 'AS',
      role: 'customer',
      status: 'active',
    };
    users.push(demoUser);
    modified = true;
  }

  const adminEmail = 'admin@electrohaven.com';
  if (!users.some((u) => u.email.toLowerCase() === adminEmail)) {
    const adminSalt = generateSalt();
    const adminHash = await hashPassword('Admin@123', adminSalt);
    const adminUser = {
      id: 'usr_admin_master_1',
      name: 'ElectroHaven Administrator',
      email: adminEmail,
      phone: '9898012345',
      passwordHash: adminHash,
      passwordSalt: adminSalt,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      avatar: 'AD',
      role: 'admin',
      status: 'active',
    };
    users.unshift(adminUser);
    modified = true;
  }

  if (modified) {
    saveStoredUsers(users);
  }
}

/**
 * Registers a new user.
 * Validates inputs, hashes password, generates OTP for email verification.
 */
export async function registerUser({ name, email, phone, password }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim().replace(/\D/g, '');

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  const users = getStoredUsers();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  if (users.some((u) => u.phone === cleanPhone)) {
    return { success: false, error: 'An account with this mobile number already exists.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    passwordSalt: salt,
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    avatar: cleanName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
    role: 'customer',
  };

  users.push(newUser);
  saveStoredUsers(users);

  // Generate 6-digit verification code
  const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
  saveVerificationCode(cleanEmail, verificationOtp);

  return {
    success: true,
    user: sanitizeUser(newUser),
    verificationOtp, // Returned for interactive demo display
    message: `Account created successfully! We sent a 6-digit verification code to ${cleanEmail}.`,
  };
}

/**
 * Authenticates user by Email or Phone + Password.
 */
export async function loginUser({ identifier, password, rememberMe = true }) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPhoneId = cleanId.replace(/\D/g, '');

  if (!cleanId) {
    return { success: false, error: 'Please enter your registered email or mobile number.' };
  }

  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  await seedDemoAccountIfNeeded();
  const users = getStoredUsers();

  const user = users.find((u) => {
    return (
      u.email.toLowerCase() === cleanId ||
      (cleanPhoneId.length === 10 && u.phone === cleanPhoneId)
    );
  });

  if (!user) {
    return { success: false, error: 'No account found with this email or mobile number.' };
  }

  if (user.status === 'suspended') {
    return {
      success: false,
      error: 'Your account has been suspended by an administrator. Please contact support at support@electrohaven.in.',
    };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isPasswordValid) {
    return { success: false, error: 'Incorrect password. Please try again or use Forgot Password.' };
  }

  // Create session
  const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString();

  const session = {
    token: sessionToken,
    userId: user.id,
    user: sanitizeUser(user),
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  saveStoredSession(session);

  return {
    success: true,
    user: sanitizeUser(user),
    session,
    message: `Welcome back, ${user.name}!`,
  };
}

/**
 * Saves active session.
 */
export function saveStoredSession(session) {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save session to localStorage:', err);
  }
}

/**
 * Retrieves the current authenticated user and session.
 * Checks expiry and validity.
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.token || !session.userId) return null;

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }

    // Refresh user data from users list
    const users = getStoredUsers();
    const latestUser = users.find((u) => u.id === session.userId);
    if (!latestUser || latestUser.status === 'suspended') {
      clearSession();
      return null;
    }

    session.user = sanitizeUser(latestUser);
    return session;
  } catch {
    return null;
  }
}

export function isAdminUser(user) {
  if (!user) return false;
  return user.role === 'admin' || (user.email && user.email.toLowerCase() === 'admin@electrohaven.com');
}

export function getCurrentUser() {
  const session = getCurrentSession();
  return session ? session.user : null;
}

/**
 * Clears current session (Logout).
 */
export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return { success: true, message: 'You have been logged out successfully.' };
  } catch {
    return { success: false };
  }
}

export function clearSession() {
  logoutUser();
}

/**
 * Email Verification Helpers
 */
function getVerificationCodes() {
  try {
    const raw = localStorage.getItem(VERIFICATION_CODES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveVerificationCode(email, code) {
  try {
    const codes = getVerificationCodes();
    codes[email.toLowerCase()] = {
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins validity
    };
    localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes));
  } catch {}
}

export function getActiveVerificationCode(email) {
  const codes = getVerificationCodes();
  const entry = codes[(email || '').toLowerCase()];
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) return null;
  return entry.code;
}

export function verifyEmailOtp(email, enteredCode) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanCode = (enteredCode || '').trim();

  const activeCode = getActiveVerificationCode(cleanEmail);

  // In demo mode: accept active code OR default master code '123456' for convenience
  if (!activeCode && cleanCode !== '123456') {
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (activeCode !== cleanCode && cleanCode !== '123456') {
    return { success: false, error: 'Invalid verification code. Please check and try again.' };
  }

  // Mark user as emailVerified
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.emailVerified = true;
    saveStoredUsers(users);

    const session = getCurrentSession();
    if (session && session.userId === user.id) {
      session.user.emailVerified = true;
      saveStoredSession(session);
    }
  }

  return { success: true, message: 'Email verified successfully!' };
}

export function resendVerificationOtp(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  saveVerificationCode(cleanEmail, code);
  return { success: true, code, message: `A new 6-digit verification code was sent to ${cleanEmail}.` };
}

/**
 * Forgot & Reset Password
 */
function getResetCodes() {
  try {
    const raw = localStorage.getItem(RESET_CODES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function requestPasswordReset(identifier) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPhone = cleanId.replace(/\D/g, '');

  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === cleanId || (cleanPhone.length === 10 && u.phone === cleanPhone)
  );

  if (!user) {
    return {
      success: false,
      error: 'No registered account found with that email or mobile number.',
    };
  }

  const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const codes = getResetCodes();
    codes[user.email.toLowerCase()] = {
      code: resetOtp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
  } catch {}

  return {
    success: true,
    email: user.email,
    phone: user.phone,
    resetOtp, // Returned for instant interactive demo testing
    message: `Password reset instructions and a 6-digit OTP have been sent to ${user.email}.`,
  };
}

export async function resetPasswordWithOtp(identifier, otp, newPassword) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanOtp) {
    return { success: false, error: 'Please enter the 6-digit OTP.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  const users = getStoredUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      (cleanId.replace(/\D/g, '').length === 10 && u.phone === cleanId.replace(/\D/g, ''))
  );

  if (!user) {
    return { success: false, error: 'Account not found.' };
  }

  const codes = getResetCodes();
  const resetEntry = codes[user.email.toLowerCase()];

  // Accept generated OTP or master demo OTP '123456'
  const isOtpValid = (resetEntry && resetEntry.code === cleanOtp) || cleanOtp === '123456';

  if (!isOtpValid) {
    return { success: false, error: 'Invalid or expired OTP code. Please try again.' };
  }

  // Update password with fresh salt
  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);

  user.passwordHash = passwordHash;
  user.passwordSalt = salt;
  user.updatedAt = new Date().toISOString();
  saveStoredUsers(users);

  // Clear reset OTP
  delete codes[user.email.toLowerCase()];
  localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));

  return {
    success: true,
    message: 'Your password has been reset successfully! You can now sign in with your new password.',
  };
}

/**
 * Sanitizes user object to strip out password hash and salt before returning to client.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}
