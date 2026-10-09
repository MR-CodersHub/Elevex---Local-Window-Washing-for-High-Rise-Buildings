/**
 * ELEVEX High-Rise Facade Solutions
 * Portal Authentication Controller
 * Features:
 * - Theme & RTL Direction Control
 * - Google & Apple OAuth One-Click Simulators
 * - Interactive Password Visibility Toggles
 * - End-to-End Functional Password Reset (Multi-step verification & live strength meter)
 * - Property Registration Onboarding Modal
 * - Fast 1-Click Role Demos (Facility Director & Operations Lead)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthThemeAndRtl();
  initSocialAuth();
  initPasswordVisibility();
  initResetPassword();
  initLoginForm();
  initPropertyRegistrationModal();
});

/* ==========================================================================
   1. THEME & RTL CONTROLLER
   ========================================================================== */
function initAuthThemeAndRtl() {
  const themeToggles = document.querySelectorAll('.js-theme-toggle');
  const rtlToggles = document.querySelectorAll('.js-rtl-toggle');

  // Load saved theme
  const savedTheme = localStorage.getItem('elevex_theme') || 'dark';
  applyTheme(savedTheme);

  // Load saved direction
  const savedDir = localStorage.getItem('elevex_dir') || 'ltr';
  applyDir(savedDir);

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    }
    try {
      localStorage.setItem('elevex_theme', theme);
    } catch (e) {}

    themeToggles.forEach(btn => {
      btn.setAttribute('title', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      const sun = btn.querySelector('.sun-icon');
      const moon = btn.querySelector('.moon-icon');
      if (sun && moon) {
        if (theme === 'light') {
          sun.style.display = 'none';
          moon.style.display = 'block';
        } else {
          sun.style.display = 'block';
          moon.style.display = 'none';
        }
      }
    });
  }

  function applyDir(dir) {
    const isRtl = dir === 'rtl';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    try {
      localStorage.setItem('elevex_dir', isRtl ? 'rtl' : 'ltr');
    } catch (e) {}

    rtlToggles.forEach(btn => {
      btn.setAttribute('title', isRtl ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
      btn.setAttribute('aria-label', isRtl ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
      const badge = btn.querySelector('.rtl-badge');
      if (badge) {
        badge.textContent = isRtl ? 'LTR' : 'RTL';
      }
    });
  }

  themeToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || (document.body.classList.contains('light-theme') ? 'light' : 'dark');
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      showPortalToast(next === 'light' ? 'Light Mode Activated' : 'Dark High-Contrast Mode Activated');
    });
  });

  rtlToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('dir') || 'ltr';
      const next = current === 'rtl' ? 'ltr' : 'rtl';
      applyDir(next);
      showPortalToast(next === 'rtl' ? 'RTL Layout Activated' : 'LTR Layout Activated');
    });
  });
}

/* ==========================================================================
   2. SOCIAL AUTHENTICATION (GOOGLE & APPLE)
   ========================================================================== */
function initSocialAuth() {
  const googleBtn = document.getElementById('btnGoogleAuth');
  const appleBtn = document.getElementById('btnAppleAuth');

  if (googleBtn) {
    googleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const originalText = googleBtn.querySelector('span').textContent;
      googleBtn.querySelector('span').textContent = 'Connecting to Google...';
      googleBtn.style.opacity = '0.7';
      googleBtn.style.pointerEvents = 'none';

      showPortalToast('Google Workspace Verified: marcus.sterling@meridiantower.com');

      setTimeout(() => {
        showPortalToast('Session Authorized. Launching Building Manager Portal...');
        setTimeout(() => {
          window.location.href = 'portal-dashboard.html';
        }, 700);
      }, 700);
    });
  }

  if (appleBtn) {
    appleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const originalText = appleBtn.querySelector('span').textContent;
      appleBtn.querySelector('span').textContent = 'Authenticating Apple ID...';
      appleBtn.style.opacity = '0.7';
      appleBtn.style.pointerEvents = 'none';

      showPortalToast('Apple ID Verified: marcus.sterling@icloud.com');

      setTimeout(() => {
        showPortalToast('Security Handshake Passed. Launching Building Portal...');
        setTimeout(() => {
          window.location.href = 'portal-dashboard.html';
        }, 700);
      }, 700);
    });
  }
}

/* ==========================================================================
   3. PASSWORD VISIBILITY TOGGLE CONTROLLER
   ========================================================================== */
function initPasswordVisibility() {
  // Main login password visibility toggle
  const mainToggleBtn = document.getElementById('btnTogglePassword');
  const mainPassInput = document.getElementById('portalPassword') || document.getElementById('managerPassword');

  if (mainToggleBtn && mainPassInput) {
    mainToggleBtn.addEventListener('click', () => {
      toggleInputVisibility(mainPassInput, mainToggleBtn);
    });
  }

  // Reset modal password visibility toggles
  const resetPassToggles = document.querySelectorAll('.js-reset-toggle-pass');
  resetPassToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        toggleInputVisibility(targetInput, btn);
      }
    });
  });

  function toggleInputVisibility(inputEl, btnEl) {
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';

    const eyeShow = btnEl.querySelector('.eye-show');
    const eyeHide = btnEl.querySelector('.eye-hide');

    if (eyeShow && eyeHide) {
      if (isPassword) {
        eyeShow.style.display = 'none';
        eyeHide.style.display = 'block';
        btnEl.setAttribute('aria-label', 'Hide password');
        btnEl.setAttribute('title', 'Hide password');
      } else {
        eyeShow.style.display = 'block';
        eyeHide.style.display = 'none';
        btnEl.setAttribute('aria-label', 'Show password');
        btnEl.setAttribute('title', 'Show password');
      }
    }
  }
}

/* ==========================================================================
   4. FUNCTIONAL RESET PASSWORD CONTROLLER
   ========================================================================== */
function initResetPassword() {
  const modal = document.getElementById('resetPasswordModal');
  const openTrigger = document.getElementById('linkForgotPassword') || document.getElementById('linkForgotManager');
  const closeBtn = document.getElementById('closeResetModalBtn');
  const cancelBtn = document.getElementById('btnCancelResetModal');

  const resetForm = document.getElementById('resetPasswordForm');
  const resetSuccessCard = document.getElementById('resetSuccessCard');
  const returnLoginBtn = document.getElementById('btnReturnToLoginAfterReset');

  const emailInput = document.getElementById('resetEmailInput');
  const sendCodeBtn = document.getElementById('btnSendResetCode');
  const sendCodeText = document.getElementById('btnSendCodeText');
  const codeSentNotice = document.getElementById('resetCodeSentNotice');
  const codeInput = document.getElementById('resetCodeInput');
  const newPassInput = document.getElementById('resetNewPassword');
  const confirmPassInput = document.getElementById('resetConfirmPassword');
  const strengthBar = document.getElementById('resetStrengthBar');
  const strengthLabel = document.getElementById('resetStrengthLabel');
  const errorMsg = document.getElementById('resetErrorMsg');

  const mainEmailInput = document.getElementById('portalEmail') || document.getElementById('managerEmail');
  const mainPassInput = document.getElementById('portalPassword') || document.getElementById('managerPassword');

  // Open modal
  if (openTrigger && modal) {
    openTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      // Pre-fill email from main login form
      if (emailInput && mainEmailInput) {
        emailInput.value = mainEmailInput.value || 'marcus.sterling@meridiantower.com';
      }
      resetModalState();
      openModal(modal);
    });
  }

  // Close handlers
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => closeModal(modal));
  }
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => closeModal(modal));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal(modal);
    }
  });

  // 4a. Send Verification Code
  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', () => {
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email || !email.includes('@')) {
        showError('Please enter a valid email address to receive verification.');
        if (emailInput) emailInput.focus();
        return;
      }

      hideError();
      if (sendCodeText) sendCodeText.textContent = 'Sending...';
      sendCodeBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        if (sendCodeText) sendCodeText.textContent = 'Resend Code';
        sendCodeBtn.style.pointerEvents = 'auto';
        if (codeSentNotice) codeSentNotice.style.display = 'flex';
        if (codeInput) codeInput.value = '849201';

        showPortalToast(`Security code 849201 dispatched to ${email}`);
        if (newPassInput) newPassInput.focus();
      }, 450);
    });
  }

  // 4b. Live Password Strength Evaluator
  if (newPassInput && strengthBar && strengthLabel) {
    newPassInput.addEventListener('input', () => {
      const val = newPassInput.value;
      const strength = evaluatePasswordStrength(val);
      
      strengthBar.style.width = strength.pct + '%';
      strengthBar.style.background = strength.color;
      strengthLabel.textContent = strength.text;
      strengthLabel.style.color = strength.color;
    });
  }

  function evaluatePasswordStrength(pass) {
    if (!pass) {
      return { pct: 0, color: 'var(--portal-accent-pink)', text: 'Password Strength: Minimum 6 characters' };
    }
    if (pass.length < 6) {
      return { pct: 25, color: '#ef4444', text: 'Too short (Minimum 6 characters needed)' };
    }
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) {
      return { pct: 50, color: '#f59e0b', text: 'Fair strength (Add digits or symbols for higher rating)' };
    } else if (score === 2) {
      return { pct: 75, color: '#38bdf8', text: 'Good strength (Meets commercial portal standard)' };
    } else {
      return { pct: 100, color: '#10b981', text: 'Strong (Fully IRATA Security Compliant)' };
    }
  }

  // 4c. Submit Reset Form
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const code = codeInput ? codeInput.value.trim() : '';
      const newPass = newPassInput ? newPassInput.value : '';
      const confirmPass = confirmPassInput ? confirmPassInput.value : '';

      if (!email || !email.includes('@')) {
        showError('Please enter a valid facility or staff email.');
        return;
      }
      if (!code || code.length < 4) {
        showError('Please enter the verification code received via email.');
        return;
      }
      if (newPass.length < 6) {
        showError('New password must be at least 6 characters long.');
        return;
      }
      if (newPass !== confirmPass) {
        showError('Passwords do not match. Please verify both entries.');
        return;
      }

      hideError();
      const submitBtn = document.getElementById('btnSubmitPasswordReset');
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Updating Security Key...</span>';
        submitBtn.style.pointerEvents = 'none';
      }

      setTimeout(() => {
        // Update main login inputs
        if (mainEmailInput) mainEmailInput.value = email;
        if (mainPassInput) {
          mainPassInput.value = newPass;
          // Trigger visual feedback on main password input
          mainPassInput.style.borderColor = 'var(--portal-emerald)';
          setTimeout(() => {
            mainPassInput.style.borderColor = '';
          }, 2500);
        }

        // Show success state
        if (resetForm) resetForm.style.display = 'none';
        if (resetSuccessCard) resetSuccessCard.style.display = 'block';

        showPortalToast(`Password updated for ${email}! Log in now.`);
      }, 600);
    });
  }

  // 4d. Return to Sign In after reset
  if (returnLoginBtn && modal) {
    returnLoginBtn.addEventListener('click', () => {
      closeModal(modal);
      const submitLogin = document.getElementById('btnPortalLogin');
      if (submitLogin) submitLogin.focus();
    });
  }

  function resetModalState() {
    if (resetForm) resetForm.style.display = 'flex';
    if (resetSuccessCard) resetSuccessCard.style.display = 'none';
    if (newPassInput) newPassInput.value = '';
    if (confirmPassInput) confirmPassInput.value = '';
    if (codeSentNotice) codeSentNotice.style.display = 'none';
    if (strengthBar) strengthBar.style.width = '0%';
    if (strengthLabel) {
      strengthLabel.textContent = 'Password Strength: Minimum 6 characters';
      strengthLabel.style.color = 'var(--portal-text-muted)';
    }
    const submitBtn = document.getElementById('btnSubmitPasswordReset');
    if (submitBtn) {
      submitBtn.innerHTML = `<span>Save &amp; Update Password</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      submitBtn.style.pointerEvents = 'auto';
    }
    hideError();
  }

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = 'block';
    }
  }

  function hideError() {
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.style.display = 'none';
    }
  }
}

/* ==========================================================================
   5. UNIFIED PORTAL LOGIN FORM & DEMO LOGINS
   ========================================================================== */
function initLoginForm() {
  const loginForm = document.getElementById('portalLoginForm') || document.getElementById('managerLoginForm');
  const emailInput = document.getElementById('portalEmail') || document.getElementById('managerEmail');
  const passInput = document.getElementById('portalPassword') || document.getElementById('managerPassword');

  // Submit Primary Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      
      const isOps = email.toLowerCase().includes('elevex.com') || 
                    email.toLowerCase().includes('admin') || 
                    email.toLowerCase().includes('ops') || 
                    email.toLowerCase().includes('sarah');

      if (isOps) {
        showPortalToast(`Operations Command Authorized for ${email.split('@')[0]}. Redirecting to Admin Desk...`);
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 800);
      } else {
        showPortalToast(`Facility Workspace Verified for ${email.split('@')[0]}. Redirecting to Building Portal...`);
        setTimeout(() => {
          window.location.href = 'portal-dashboard.html';
        }, 800);
      }
    });
  }
}

/* ==========================================================================
   6. PROPERTY REGISTRATION MODAL
   ========================================================================== */
function initPropertyRegistrationModal() {
  const modal = document.getElementById('signupPropertyModal');
  const openBtn = document.getElementById('btnOpenRegisterModal');
  const closeBtn = document.getElementById('closeSignupModalBtn');
  const cancelBtn = document.getElementById('btnCancelSignupModal');
  const signupForm = document.getElementById('signupPropertyModalForm') || document.getElementById('signupPropertyForm');

  if (openBtn && modal) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modal);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => closeModal(modal));
  }
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => closeModal(modal));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tower = document.getElementById('signupTowerName') ? document.getElementById('signupTowerName').value : 'Commercial Tower';
      showPortalToast(`Site profile created for ${tower}. Initializing Facility Portal...`);
      if (modal) closeModal(modal);
      setTimeout(() => {
        window.location.href = 'portal-dashboard.html';
      }, 1000);
    });
  }
}

/* ==========================================================================
   MODAL UTILITIES
   ========================================================================== */
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('open');
  modalEl.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  modalEl.classList.remove('show');
  document.body.style.overflow = '';
}

/* ==========================================================================
   TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showPortalToast(message, duration = 3200) {
  const toast = document.getElementById('portalToast');
  const toastText = document.getElementById('portalToastText');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}
