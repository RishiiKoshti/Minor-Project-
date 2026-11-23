import React, { useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  verifyEmailOtp,
  resendVerificationOtp,
  requestPasswordReset,
  resetPasswordWithOtp,
  seedDemoAccountIfNeeded,
} from './auth';

export default function AuthPage({
  initialMode = 'login', // 'login' | 'signup' | 'forgot' | 'verify'
  returnTo = 'Home',
  onAuthSuccess,
  onCancel,
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot' | 'reset' | 'verify'

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRemember, setLoginRemember] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Email verification state
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [displayedDemoOtp, setDisplayedDemoOtp] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot / Reset password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    seedDemoAccountIfNeeded();
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // 1-Click quick fill demo credentials
  const fillDemoAccount = () => {
    setLoginIdentifier('alex.sharma@example.com');
    setLoginPassword('Password@123');
    setLoginError('');
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await loginUser({
        identifier: loginIdentifier,
        password: loginPassword,
        rememberMe: loginRemember,
      });

      if (!res.success) {
        setLoginError(res.error);
        setLoginLoading(false);
        return;
      }

      showToast(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess(res.user, returnTo);
        }
      }, 500);
    } catch (err) {
      setLoginError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Signup submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please verify your password.');
      return;
    }

    setSignupLoading(true);

    try {
      const res = await registerUser({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
      });

      if (!res.success) {
        setSignupError(res.error);
        setSignupLoading(false);
        return;
      }

      setVerificationEmail(signupEmail);
      setDisplayedDemoOtp(res.verificationOtp || '123456');
      setMode('verify');
      showToast('Registration successful! Please verify your email.');
    } catch (err) {
      setSignupError('An error occurred during account creation. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationSuccess('');

    const res = verifyEmailOtp(verificationEmail, verificationOtp);
    if (!res.success) {
      setVerificationError(res.error);
      return;
    }

    setVerificationSuccess('Email verified successfully! You can now sign in.');
    showToast('Email verified! Logging you in...');
    setTimeout(() => {
      // Auto-switch to login or complete sign in
      setLoginIdentifier(verificationEmail);
      setMode('login');
    }, 1500);
  };

  // Resend verification OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const res = resendVerificationOtp(verificationEmail);
    if (res.success) {
      setDisplayedDemoOtp(res.code);
      setResendCooldown(30);
      showToast('New verification code sent!');
    }
  };

  // Handle Request Password Reset
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = requestPasswordReset(forgotIdentifier);
      if (!res.success) {
        setForgotError(res.error);
        setForgotLoading(false);
        return;
      }

      setForgotSuccess(res.message);
      setDisplayedDemoOtp(res.resetOtp || '123456');
      setMode('reset');
    } catch {
      setForgotError('Unable to process password reset. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Reset Password with OTP
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await resetPasswordWithOtp(forgotIdentifier, resetOtp, newPassword);
      if (!res.success) {
        setForgotError(res.error);
        setForgotLoading(false);
        return;
      }

      showToast('Password reset successful! Please log in.');
      setMode('login');
      setLoginIdentifier(forgotIdentifier);
      setLoginPassword('');
    } catch {
      setForgotError('Failed to reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'gray' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#ff6b6b' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#feca57' };
    if (score === 3) return { score: 3, label: 'Good', color: '#48dbfb' };
    return { score: 4, label: 'Strong', color: '#1dd1a1' };
  };

  const strength = getPasswordStrength(signupPassword);

  return (
    <div className="auth-page-wrapper">
      {toastMessage && <div className="auth-floating-toast">{toastMessage}</div>}

      <div className="auth-card-container">
        {/* Top Header & Branding */}
        <div className="auth-card-header">
          <div className="auth-logo-badge">
            <span className="logo-mark">E</span>
          </div>
          <h2>
            {mode === 'login' && 'Sign in to ElectroHaven'}
            {mode === 'signup' && 'Create your ElectroHaven Account'}
            {mode === 'forgot' && 'Reset your Password'}
            {mode === 'reset' && 'Set New Password'}
            {mode === 'verify' && 'Verify Your Email'}
          </h2>
          <p>
            {mode === 'login' && 'Access your orders, saved addresses, wishlist, and fast checkout.'}
            {mode === 'signup' && 'Join thousands of tech enthusiasts with exclusive member deals.'}
            {mode === 'forgot' && 'Enter your registered email or mobile to receive a reset code.'}
            {mode === 'reset' && 'Enter the 6-digit code and choose a new secure password.'}
            {mode === 'verify' && `Enter the 6-digit code sent to ${verificationEmail}.`}
          </p>
        </div>

        {/* Tab Switcher (Only visible for Login / Signup) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="auth-tab-switch" role="tablist">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setLoginError('');
                setSignupError('');
              }}
              role="tab"
              aria-selected={mode === 'login'}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setLoginError('');
                setSignupError('');
              }}
              role="tab"
              aria-selected={mode === 'signup'}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ========================================================
            MODE: LOGIN
            ======================================================== */}
        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            {loginError && <div className="auth-error-banner">{loginError}</div>}

            <div className="auth-field">
              <label htmlFor="login-identifier">Email or Mobile Number</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  id="login-identifier"
                  type="text"
                  placeholder="name@example.com or 10-digit mobile"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setLoginError('');
                  }}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setMode('forgot');
                    setForgotIdentifier(loginIdentifier);
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            <div className="auth-checkbox-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={loginRemember}
                  onChange={(e) => setLoginRemember(e.target.checked)}
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            <button type="submit" className="primary auth-submit-btn" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In to ElectroHaven'} <b>→</b>
            </button>

            {/* Quick Demo Helper Card */}
            <div className="auth-demo-card">
              <div className="auth-demo-badge">QUICK DEMO LOGIN</div>
              <p>Test with our pre-configured verified account:</p>
              <code>alex.sharma@example.com / Password@123</code>
              <button type="button" className="outline-button auth-demo-fill-btn" onClick={fillDemoAccount}>
                ⚡ Auto-fill Demo Credentials
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            MODE: SIGNUP
            ======================================================== */}
        {mode === 'signup' && (
          <form className="auth-form" onSubmit={handleSignupSubmit}>
            {signupError && <div className="auth-error-banner">{signupError}</div>}

            <div className="auth-field">
              <label htmlFor="signup-name">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. Alex Sharma"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    setSignupError('');
                  }}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    setSignupError('');
                  }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-phone">Mobile Number</label>
              <div className="auth-input-wrap">
                <span className="auth-input-prefix">+91</span>
                <input
                  id="signup-phone"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={signupPhone}
                  onChange={(e) => {
                    setSignupPhone(e.target.value.replace(/\D/g, ''));
                    setSignupError('');
                  }}
                  required
                  autoComplete="tel"
                />
              </div>
              <small className="auth-field-hint">Used for order SMS updates and doorstep delivery.</small>
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password">Create Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="signup-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters (letters, numbers, symbols)"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    setSignupError('');
                  }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                >
                  {showSignupPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>

              {/* Password strength indicator */}
              {signupPassword && (
                <div className="auth-strength-meter">
                  <div className="auth-strength-bars">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="auth-strength-bar"
                        style={{
                          backgroundColor:
                            step <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="auth-strength-text" style={{ color: strength.color }}>
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="signup-confirm-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={signupConfirmPassword}
                  onChange={(e) => {
                    setSignupConfirmPassword(e.target.value);
                    setSignupError('');
                  }}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="primary auth-submit-btn" disabled={signupLoading}>
              {signupLoading ? 'Creating account...' : 'Create My Account'} <b>→</b>
            </button>
          </form>
        )}

        {/* ========================================================
            MODE: VERIFY EMAIL OTP
            ======================================================== */}
        {mode === 'verify' && (
          <form className="auth-form" onSubmit={handleVerifySubmit}>
            {verificationError && <div className="auth-error-banner">{verificationError}</div>}
            {verificationSuccess && <div className="auth-success-banner">{verificationSuccess}</div>}

            <div className="auth-verify-notice">
              <span className="auth-verify-icon">📬</span>
              <p>
                We sent a 6-digit confirmation code to:
                <br />
                <strong>{verificationEmail}</strong>
              </p>
            </div>

            {/* Interactive Demo Simulation Banner */}
            {displayedDemoOtp && (
              <div className="auth-simulated-sms">
                <small>🔔 SIMULATED EMAIL INBOX (DEMO)</small>
                <strong>Your ElectroHaven verification code is:</strong>
                <span className="auth-otp-badge">{displayedDemoOtp}</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setVerificationOtp(displayedDemoOtp)}
                >
                  ⚡ Click to Auto-fill Code
                </button>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="verify-otp">Enter 6-Digit Code</label>
              <div className="auth-input-wrap">
                <input
                  id="verify-otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="auth-otp-input"
                  value={verificationOtp}
                  onChange={(e) => {
                    setVerificationOtp(e.target.value.replace(/\D/g, ''));
                    setVerificationError('');
                  }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="primary auth-submit-btn">
              Verify Email &amp; Proceed <b>→</b>
            </button>

            <div className="auth-resend-row">
              {resendCooldown > 0 ? (
                <span>Resend code in {resendCooldown}s</span>
              ) : (
                <button type="button" className="auth-link-btn" onClick={handleResendOtp}>
                  Resend verification code
                </button>
              )}
            </div>
          </form>
        )}

        {/* ========================================================
            MODE: FORGOT PASSWORD (REQUEST)
            ======================================================== */}
        {mode === 'forgot' && (
          <form className="auth-form" onSubmit={handleForgotSubmit}>
            {forgotError && <div className="auth-error-banner">{forgotError}</div>}
            {forgotSuccess && <div className="auth-success-banner">{forgotSuccess}</div>}

            <div className="auth-field">
              <label htmlFor="forgot-identifier">Registered Email or Mobile</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉</span>
                <input
                  id="forgot-identifier"
                  type="text"
                  placeholder="Enter email or 10-digit mobile"
                  value={forgotIdentifier}
                  onChange={(e) => {
                    setForgotIdentifier(e.target.value);
                    setForgotError('');
                  }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary auth-submit-btn" disabled={forgotLoading}>
              {forgotLoading ? 'Sending OTP...' : 'Send Verification OTP'} <b>→</b>
            </button>

            <div className="auth-back-row">
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('login');
                  setForgotError('');
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            MODE: RESET PASSWORD (ENTER OTP + NEW PASSWORD)
            ======================================================== */}
        {mode === 'reset' && (
          <form className="auth-form" onSubmit={handleResetSubmit}>
            {forgotError && <div className="auth-error-banner">{forgotError}</div>}

            {displayedDemoOtp && (
              <div className="auth-simulated-sms">
                <small>🔔 SIMULATED SMS / EMAIL (DEMO)</small>
                <strong>Your ElectroHaven Password Reset OTP is:</strong>
                <span className="auth-otp-badge">{displayedDemoOtp}</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setResetOtp(displayedDemoOtp)}
                >
                  ⚡ Click to Auto-fill OTP
                </button>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="reset-otp">Enter 6-Digit OTP</label>
              <div className="auth-input-wrap">
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="auth-otp-input"
                  value={resetOtp}
                  onChange={(e) => {
                    setResetOtp(e.target.value.replace(/\D/g, ''));
                    setForgotError('');
                  }}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="new-password">New Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setForgotError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-new-password">Confirm New Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="confirm-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    setForgotError('');
                  }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary auth-submit-btn" disabled={forgotLoading}>
              {forgotLoading ? 'Updating password...' : 'Update Password &amp; Sign In'} <b>→</b>
            </button>
          </form>
        )}

        {/* Security & Encryption Footer Note */}
        <div className="auth-security-footer">
          <span>🔒 256-bit PBKDF2 Encrypted Authentication</span>
          <span>🛡 Never Plaintext Stored</span>
        </div>
      </div>
    </div>
  );
}
