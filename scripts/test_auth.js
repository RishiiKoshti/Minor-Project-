import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from '../src/auth.js';

// Setup basic localStorage mock for node test
globalThis.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

async function testAuth() {
  console.log('Testing Salt Generation...');
  const salt1 = generateSalt();
  const salt2 = generateSalt();
  console.log('Salt 1:', salt1);
  console.log('Salt 2:', salt2);
  if (salt1 === salt2 || salt1.length !== 32) {
    throw new Error('Salt generation failed');
  }

  console.log('Testing PBKDF2 Hash and Verification...');
  const pass = 'SuperSecret@2026';
  const hash = await hashPassword(pass, salt1);
  console.log('Generated Hash length:', hash.length, 'Hash:', hash);

  const isValid = await verifyPassword(pass, hash, salt1);
  const isInvalid = await verifyPassword('WrongPassword', hash, salt1);
  console.log('Valid password verified:', isValid);
  console.log('Invalid password rejected:', !isInvalid);

  if (!isValid || isInvalid) {
    throw new Error('Password verification failed');
  }

  console.log('Testing User Registration & Login...');
  const { registerUser, loginUser, requestPasswordReset, resetPasswordWithOtp } = await import('../src/auth.js');
  
  const regRes = await registerUser({
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '9825012345',
    password: 'PriyaSecure@123',
  });
  console.log('Registration result:', regRes.success, 'OTP:', regRes.verificationOtp);
  if (!regRes.success) throw new Error('Registration failed: ' + regRes.error);

  const loginRes = await loginUser({
    identifier: 'priya.patel@example.com',
    password: 'PriyaSecure@123',
  });
  console.log('Login result:', loginRes.success, 'User:', loginRes.user?.name);
  if (!loginRes.success) throw new Error('Login failed: ' + loginRes.error);

  const wrongLoginRes = await loginUser({
    identifier: 'priya.patel@example.com',
    password: 'BadPassword',
  });
  console.log('Wrong login rejected:', !wrongLoginRes.success);
  if (wrongLoginRes.success) throw new Error('Wrong login should have failed');

  console.log('Testing Forgot & Reset Password...');
  const forgotRes = requestPasswordReset('priya.patel@example.com');
  console.log('Reset request result:', forgotRes.success, 'OTP:', forgotRes.resetOtp);

  const resetRes = await resetPasswordWithOtp('priya.patel@example.com', forgotRes.resetOtp, 'NewPassword@456');
  console.log('Reset result:', resetRes.success);
  if (!resetRes.success) throw new Error('Reset password failed');

  const newLoginRes = await loginUser({
    identifier: 'priya.patel@example.com',
    password: 'NewPassword@456',
  });
  console.log('Login with new password:', newLoginRes.success);
  if (!newLoginRes.success) throw new Error('Login with new password failed');

  console.log('ALL AUTH TESTS PASSED PERFECTLY!');
}

testAuth().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
