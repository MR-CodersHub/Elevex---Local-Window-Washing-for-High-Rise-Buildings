/**
 * ELEVEX — High-Rise Facade & Window Cleaning
 * Core Interactive Logic & Building Manager Portal System
 */

// Immediate Theme and Direction apply (avoids FOUC)
(function() {
  try {
    const savedTheme = localStorage.getItem('elevex_theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    const savedDir = localStorage.getItem('elevex_dir');
    if (savedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  } catch(e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndRTL();
  initAccountDropdown();
  initMobileNavigation();
  initBuildingManagerPortal();
  initAdminDashboard();
  initAuthModal();
  initEnquiryForms();
  initBackToTop();
  initTabFilters();
  initCostEstimator();
  initScrollAnimations();
  initStatCounters();
});

/* ==========================================================================
   1. USER ACCOUNT DROPDOWN
   ========================================================================== */
function initAccountDropdown() {
  const accountToggles = document.querySelectorAll('.js-account-toggle');
  const accountMenu = document.querySelector('.account-dropdown-menu');

  if (!accountMenu) return;

  accountToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = accountMenu.classList.contains('show');
      closeAllDropdowns();
      if (!isOpen) {
        accountMenu.classList.add('show');
        toggle.classList.add('active');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.account-dropdown-wrapper')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  function closeAllDropdowns() {
    accountMenu.classList.remove('show');
    accountToggles.forEach(t => t.classList.remove('active'));
  }
}

/* ==========================================================================
   2. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('open');
      toggleBtn.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  toggleBtn.addEventListener('click', toggleDrawer);
  if (overlay) overlay.addEventListener('click', toggleDrawer);

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (drawer.classList.contains('open')) toggleDrawer();
    });
  });
}

/* ==========================================================================
   3. BUILDING MANAGER PORTAL (Full Facility Management Experience)
   ========================================================================== */
function initBuildingManagerPortal() {
  const portalTriggers = document.querySelectorAll('.js-open-portal');
  const portalModal = document.getElementById('buildingManagerPortal');

  if (!portalModal) return;

  const closeBtns = portalModal.querySelectorAll('.js-close-modal');

  portalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Close dropdown if open
      const menu = document.querySelector('.account-dropdown-menu');
      if (menu) menu.classList.remove('show');
      portalModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      portalModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  });

  portalModal.addEventListener('click', (e) => {
    if (e.target === portalModal) {
      portalModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Portal Tab Switching
  const portalTabs = portalModal.querySelectorAll('.portal-tab-btn');
  const portalPanes = portalModal.querySelectorAll('.portal-pane');

  portalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPaneId = tab.getAttribute('data-portal-tab');
      
      portalTabs.forEach(t => t.classList.remove('active'));
      portalPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetPaneId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Facility Manager Simulated New Request
  const newRequestForm = document.getElementById('portalRequestForm');
  if (newRequestForm) {
    newRequestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const serviceType = document.getElementById('portalServiceType')?.value || 'Rope Access Cleaning';
      const dropZone = document.getElementById('portalDropZone')?.value || 'North Tower Facade';
      showToast(`Service Request Submitted: ${serviceType} on ${dropZone}. Priority RAMS generation initiated.`);
      newRequestForm.reset();
      
      // Auto-switch to schedules tab to show user
      const scheduleTab = document.querySelector('[data-portal-tab="portalSchedules"]');
      if (scheduleTab) scheduleTab.click();
    });
  }

  // Building Switcher Select
  const buildingSelect = document.getElementById('portalBuildingSelect');
  if (buildingSelect) {
    buildingSelect.addEventListener('change', (e) => {
      const bName = e.target.options[e.target.selectedIndex].text;
      showToast(`Switched active facility to: ${bName}`);
      const buildingNameDisplay = document.getElementById('currentBuildingName');
      if (buildingNameDisplay) buildingNameDisplay.textContent = bName;
    });
  }
}

/* ==========================================================================
   4. ADMIN DASHBOARD MODAL
   ========================================================================== */
function initAdminDashboard() {
  const adminTriggers = document.querySelectorAll('.js-open-admin');
  const adminModal = document.getElementById('adminDashboardModal');

  if (!adminModal) return;

  const closeBtns = adminModal.querySelectorAll('.js-close-modal');

  adminTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const menu = document.querySelector('.account-dropdown-menu');
      if (menu) menu.classList.remove('show');
      adminModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  });

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      adminModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
}

/* ==========================================================================
   5. AUTH (LOGIN / REGISTER) MODAL
   ========================================================================== */
function initAuthModal() {
  const authTriggers = document.querySelectorAll('.js-open-auth');
  const authModal = document.getElementById('authModal');

  if (!authModal) return;

  const closeBtns = authModal.querySelectorAll('.js-close-modal');

  authTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const menu = document.querySelector('.account-dropdown-menu');
      if (menu) menu.classList.remove('show');
      authModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      authModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  });

  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Login form simulated submission
  const loginForm = document.getElementById('clientLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value || 'manager@commercial.com';
      showToast(`Welcome back, Property Manager (${email}). Session authorized.`);
      authModal.classList.remove('show');
      document.body.style.overflow = '';
      
      // Prompt user to open portal
      setTimeout(() => {
        const portal = document.getElementById('buildingManagerPortal');
        if (portal) {
          portal.classList.add('show');
          document.body.style.overflow = 'hidden';
        }
      }, 700);
    });
  }
}

/* ==========================================================================
   6. ENQUIRY / SITE ASSESSMENT FORMS
   ========================================================================== */
function initEnquiryForms() {
  const forms = document.querySelectorAll('.js-enquiry-form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin" viewBox="0 0 24 24" style="width: 18px; height: 18px; animation: spin 1s linear infinite;" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor" opacity="0.3"></circle>
            <path d="M4 12a8 8 0 018-8" stroke-width="4" stroke="currentColor"></path>
          </svg> Generating RAMS & Quote...
        `;
      }

      setTimeout(() => {
        showToast('Site Assessment Request Received! A certified Operations Specialist will contact you within 2 hours with our preliminary access plan.');
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }, 1200);
    });
  });
}

/* ==========================================================================
   7. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   8. TAB FILTERS (Services & Blog)
   ========================================================================== */
function initTabFilters() {
  const filterBtns = document.querySelectorAll('.js-filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.filter-container');
      if (!parent) return;

      const groupBtns = parent.querySelectorAll('.js-filter-btn');
      groupBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      const items = parent.querySelectorAll('.js-filterable-item');

      items.forEach(item => {
        if (filterVal === 'all' || item.getAttribute('data-category') === filterVal) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   9. INTERACTIVE SERVICE ESTIMATOR (For Facility & Strata Managers)
   ========================================================================== */
function initCostEstimator() {
  const calcHeight = document.getElementById('calcBuildingHeight');
  const calcMethod = document.getElementById('calcAccessMethod');
  const calcFrequency = document.getElementById('calcFrequency');
  const calcOutput = document.getElementById('calcEstimatedDuration');
  const calcPrice = document.getElementById('calcEstimatedBudget');

  if (!calcHeight || !calcMethod || !calcPrice) return;

  function updateEstimate() {
    const floors = parseInt(calcHeight.value) || 15;
    const method = calcMethod.value; // 'rope', 'mewp', 'bmu'
    const freq = calcFrequency ? calcFrequency.value : 'quarterly';

    let dayRatePerFloor = 0.25; // 0.25 days per floor
    let baseRateFloor = 140; // $140 per floor

    if (method === 'rope') {
      dayRatePerFloor = 0.20; // Ropes are 30% faster setup
      baseRateFloor = 125;
    } else if (method === 'mewp') {
      dayRatePerFloor = 0.28;
      baseRateFloor = 160;
    } else if (method === 'bmu') {
      dayRatePerFloor = 0.22;
      baseRateFloor = 135;
    }

    let discount = 1.0;
    if (freq === 'quarterly') discount = 0.85; // 15% maintenance contract discount
    if (freq === 'monthly') discount = 0.75; // 25% discount

    const totalDays = Math.max(1, Math.ceil(floors * dayRatePerFloor));
    const totalEst = Math.round(floors * baseRateFloor * discount);

    if (calcOutput) calcOutput.textContent = `${totalDays} Days (Dual Crew Rig)`;
    calcPrice.textContent = `$${totalEst.toLocaleString()} estimated`;
  }

  calcHeight.addEventListener('input', updateEstimate);
  calcMethod.addEventListener('change', updateEstimate);
  if (calcFrequency) calcFrequency.addEventListener('change', updateEstimate);
  updateEstimate();
}

/* ==========================================================================
   10. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/* ==========================================================================
   11. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal-fade-up, .reveal-stagger');
  if (!elements.length) return;

  const revealInView = () => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 120) {
        el.classList.add('is-visible');
      }
    });
  };

  revealInView();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '100px 0px 100px 0px',
      threshold: 0.01
    });

    elements.forEach(el => {
      if (!el.classList.contains('is-visible')) {
        observer.observe(el);
      }
    });
  } else {
    elements.forEach(el => el.classList.add('is-visible'));
  }

  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('resize', revealInView, { passive: true });
}

/* ==========================================================================
   12. ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initStatCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter'), 10);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1600;
          const start = performance.now();

          const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * target);
            el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
          };

          requestAnimationFrame(update);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  }
}

/* ==========================================================================
   RTL & THEME TOGGLE CONTROLLER
   ========================================================================== */
function initThemeAndRTL() {
  const themeToggles = document.querySelectorAll('.js-theme-toggle');
  const rtlToggles = document.querySelectorAll('.js-rtl-toggle');

  // Load saved theme (default: light)
  const savedTheme = localStorage.getItem('elevex_theme') || 'light';
  applyTheme(savedTheme);

  // Load saved direction (default: ltr)
  const savedDir = localStorage.getItem('elevex_dir') || 'ltr';
  applyDirection(savedDir);

  // Theme Toggle Event Handlers
  themeToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      try {
        localStorage.setItem('elevex_theme', newTheme);
      } catch(err) {}
    });
  });

  // RTL Toggle Event Handlers
  rtlToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currentDir = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(newDir);
      try {
        localStorage.setItem('elevex_dir', newDir);
      } catch(err) {}
    });
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    themeToggles.forEach(btn => {
      const isDark = theme === 'dark';
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.classList.toggle('active', isDark);
    });
    window.dispatchEvent(new Event('scroll'));
  }

  function applyDirection(dir) {
    const isRtl = dir === 'rtl';
    if (isRtl) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    rtlToggles.forEach(btn => {
      btn.setAttribute('title', isRtl ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
      btn.setAttribute('aria-label', isRtl ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
      btn.classList.toggle('active', isRtl);
      const label = btn.querySelector('.rtl-badge');
      if (label) {
        label.textContent = isRtl ? 'LTR' : 'RTL';
      }
    });
    window.dispatchEvent(new Event('scroll'));
  }
}

