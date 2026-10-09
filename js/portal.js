/**
 * ELEVEX High-Rise Facade Access & Window Cleaning
 * Building Manager Portal Logic (portal.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initPortalTabs();
  initPortalSidebar();
  initPortalModals();
  initPortalFilters();
  initScheduleForm();
  initPortalActions();
  initFacilitySwitcher();
  initPortalThemeAndRtl();
});

// Toast System
window.showPortalToast = function(message, duration = 3500) {
  const toast = document.getElementById('portalToast');
  const toastText = document.getElementById('portalToastText');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  if (window._portalToastTimer) clearTimeout(window._portalToastTimer);
  window._portalToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
};

// Tab Switching System
function initPortalTabs() {
  const navItems = document.querySelectorAll('.portal-nav-item');
  const tabPanes = document.querySelectorAll('.portal-tab-pane');

  function normalizeTabName(raw) {
    if (!raw) return '';
    let id = String(raw).replace(/^#/, '').trim();
    // Strip leading 'tab' prefix if followed by letters (e.g. 'tabSchedule' -> 'schedule')
    if (/^tab[a-zA-Z]/.test(id)) {
      id = id.slice(3);
    }
    return id.toLowerCase();
  }

  function switchTab(rawTabId) {
    if (!rawTabId) return;
    const tabName = normalizeTabName(rawTabId);
    if (!tabName) return;

    const capName = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const targetPane = document.getElementById(`tab${capName}`) ||
                       document.getElementById(`tab${tabName}`) ||
                       document.getElementById(tabName);
    
    if (!targetPane) return;

    // Update Panes
    tabPanes.forEach(pane => {
      if (pane === targetPane) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Update Nav Items
    navItems.forEach(item => {
      const itemRaw = item.getAttribute('data-tab') || item.getAttribute('href') || '';
      const itemNorm = normalizeTabName(itemRaw);
      if (itemNorm === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, `#${tabName}`);
    } else {
      location.hash = `#${tabName}`;
    }

    // Scroll to top of main area
    const mainEl = document.querySelector('.portal-main');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);

    // Close mobile sidebar if open
    closeMobileSidebar();
  }

  // Sidebar item clicks
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab') || item.getAttribute('href');
      switchTab(tab);
    });
  });

  // Buttons with .js-switch-tab (supports data-tab or data-target="tabXYZ")
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-switch-tab');
    if (btn) {
      e.preventDefault();
      const rawTab = btn.getAttribute('data-tab') || btn.getAttribute('data-target') || btn.getAttribute('href') || '';
      if (rawTab) switchTab(rawTab);
    }
  });

  // Buttons with .js-open-schedule-modal (opens schedule modal from anywhere)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-open-schedule-modal')) {
      e.preventDefault();
      const modal = document.getElementById('scheduleModal');
      if (modal) openModal(modal);
    }
  });

  // Check URL hash on load
  const currentHash = window.location.hash.replace('#', '');
  if (currentHash) {
    switchTab(currentHash);
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) switchTab(hash);
  });
}


// Mobile Sidebar
function initPortalSidebar() {
  const sidebar = document.getElementById('portalSidebar');
  const toggleBtn = document.getElementById('portalSidebarToggle');
  const overlay = document.getElementById('portalSidebarOverlay');

  if (!toggleBtn || !sidebar || !overlay) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('portalSidebar');
  const overlay = document.getElementById('portalSidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// Modal System
function initPortalModals() {
  // Open modal via data-modal-target
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-target]');
    if (trigger) {
      e.preventDefault();
      const targetSelector = trigger.getAttribute('data-modal-target');
      const targetModal = document.querySelector(targetSelector);
      if (targetModal) openModal(targetModal);
    }
  });

  // Close modal via close button
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-close-modal')) {
      e.preventDefault();
      const modal = e.target.closest('.portal-modal-backdrop');
      if (modal) closeModal(modal);
    }
  });

  // Close modal on backdrop click
  document.querySelectorAll('.portal-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.portal-modal-backdrop.open');
      if (openModalEl) closeModal(openModalEl);
    }
  });
}

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  document.body.style.overflow = '';
}

// Filter Chips
function initPortalFilters() {
  function setupFilter(containerId, tableId) {
    const container = document.getElementById(containerId);
    const table = document.getElementById(tableId);
    if (!container || !table) return;

    const chips = container.querySelectorAll('.portal-filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filterVal = (chip.getAttribute('data-filter') || 'all').toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
          if (filterVal === 'all') {
            row.style.display = '';
            return;
          }
          const rowStatus = (row.getAttribute('data-status') || '').toLowerCase();
          const rowText = row.textContent.toLowerCase();

          if (rowStatus === filterVal || rowStatus.includes(filterVal) || rowText.includes(filterVal)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }

  // Schedule Filter
  setupFilter('scheduleFilterChips', 'scheduleTable');
  // Safety Filter
  setupFilter('safetyFilterChips', 'safetyTable');
  // Invoices Filter
  setupFilter('invoiceFilterChips', 'invoicesTable');
}

// Schedule Form
function initScheduleForm() {
  const form = document.getElementById('newScheduleForm');
  const modal = document.getElementById('scheduleModal');
  const tbody = document.getElementById('scheduleTableBody');

  if (!form || !modal || !tbody) return;

  // Set default minimum date to tomorrow
  const dateInput = document.getElementById('schedDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const building = document.getElementById('schedBuilding').value;
    const service = document.getElementById('schedService').value;
    const dateVal = document.getElementById('schedDate').value;
    const timeVal = document.getElementById('schedTime').value;
    const freq = document.getElementById('schedFrequency').value;
    const access = document.getElementById('schedAccess').value;
    const special = document.getElementById('schedSpecial').value;

    // Format display date
    const d = new Date(dateVal);
    const formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Generate random reference ID
    const randomId = 'DRP-2026-' + Math.floor(120 + Math.random() * 800);

    // Create new row
    const tr = document.createElement('tr');
    tr.style.animation = 'fadeInUp 0.3s ease';
    tr.innerHTML = `
      <td><span class="portal-badge badge-cyan">${randomId}</span></td>
      <td>
        <strong style="color: #fff;">${formattedDate}</strong>
        <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${timeVal} • ${freq}</div>
      </td>
      <td>
        <strong style="color: #fff;">${building}</strong>
        <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${service}</div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--portal-accent-pink)" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style="color: #fff; font-size: 0.85rem;">${access}</span>
        </div>
      </td>
      <td>
        <div style="font-size: 0.85rem; color: #fff;">Crew Alpha (Assigned)</div>
        <div style="font-size: 0.76rem; color: var(--portal-text-muted);">IRATA L3 Lead</div>
      </td>
      <td><span class="portal-badge badge-confirmed">Confirmed</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="portal-action-btn js-reschedule-btn" data-id="${randomId}">Reschedule</button>
          <button class="portal-action-btn btn-outline-danger js-cancel-btn" data-id="${randomId}">Cancel</button>
        </div>
      </td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);

    // Close modal & reset form
    closeModal(modal);
    form.reset();

    showPortalToast(`Drop ${randomId} scheduled for ${formattedDate}! Operations dispatch notified.`);
  });
}

// Portal Action Buttons (Reschedule, Cancel, View Doc, View Report, View Invoice)
function initPortalActions() {
  document.addEventListener('click', (e) => {
    // Reschedule
    const reschedBtn = e.target.closest('.js-reschedule-btn');
    if (reschedBtn) {
      const dropId = reschedBtn.getAttribute('data-id') || 'Visit';
      const newDate = prompt(`Enter new date for ${dropId} (e.g., 28 Oct 2026):`);
      if (newDate) {
        const row = reschedBtn.closest('tr');
        if (row) {
          const dateCell = row.cells[1];
          if (dateCell) {
            const timeSub = dateCell.querySelector('div') ? dateCell.querySelector('div').textContent : '07:00 AM Shift';
            dateCell.innerHTML = `<strong style="color: #fff;">${newDate}</strong><div style="font-size: 0.76rem; color: var(--portal-text-muted);">${timeSub} (Rescheduled)</div>`;
          }
        }
        showPortalToast(`${dropId} successfully rescheduled to ${newDate}.`);
      }
      return;
    }

    // Cancel
    const cancelBtn = e.target.closest('.js-cancel-btn');
    if (cancelBtn) {
      const dropId = cancelBtn.getAttribute('data-id') || 'Visit';
      if (confirm(`Are you sure you want to cancel ${dropId}? Safety rigging slots will be released.`)) {
        const row = cancelBtn.closest('tr');
        if (row) {
          const statusCell = row.cells[5];
          if (statusCell) {
            statusCell.innerHTML = `<span class="portal-badge badge-danger">Cancelled</span>`;
          }
          cancelBtn.remove();
        }
        showPortalToast(`${dropId} has been cancelled.`);
      }
      return;
    }

    // View Safety Doc
    const docBtn = e.target.closest('.js-view-doc-btn');
    if (docBtn) {
      const docName = docBtn.getAttribute('data-doc-name') || docBtn.getAttribute('data-doc') || 'Safety Document';
      const docId = docBtn.getAttribute('data-doc-id') || docBtn.getAttribute('data-cert') || 'IRATA-CERT-2026';
      const docCrew = docBtn.getAttribute('data-doc-crew') || docBtn.getAttribute('data-crew') || 'Apex Rigging Alpha';
      const docExpiry = docBtn.getAttribute('data-doc-expiry') || docBtn.getAttribute('data-expiry') || 'Valid 2027';

      const titleEl = document.getElementById('docModalTitle');
      const nameEl = document.getElementById('docModalDocName');
      const certEl = document.getElementById('docModalCertId');
      const crewEl = document.getElementById('docModalCrew');
      const expEl = document.getElementById('docModalExpiry');

      if (titleEl) titleEl.textContent = `Verify: ${docName}`;
      if (nameEl) nameEl.textContent = docName;
      if (certEl) certEl.textContent = docId;
      if (crewEl) crewEl.textContent = docCrew;
      if (expEl) expEl.textContent = docExpiry;

      const modal = document.getElementById('docModal');
      if (modal) openModal(modal);
      return;
    }

    // View Report Audit Modal
    const reportBtn = e.target.closest('.js-open-report-modal') || e.target.closest('.js-view-report-btn');
    if (reportBtn) {
      const repId = reportBtn.getAttribute('data-id') || 'REP-2026-108';
      const repDate = reportBtn.getAttribute('data-date') || '04 Oct 2026';
      const repElev = reportBtn.getAttribute('data-elevation') || 'North Elevation (Floors 1–52)';
      const repScore = reportBtn.getAttribute('data-score') || '100% Optical Pass';

      const titleEl = document.getElementById('reportModalTitle');
      const dateEl = document.getElementById('reportModalDate');
      const elevEl = document.getElementById('reportModalElevation');
      const scoreEl = document.getElementById('reportModalScore');

      if (titleEl) titleEl.textContent = `Facade Service Audit: ${repId}`;
      if (dateEl) dateEl.textContent = repDate;
      if (elevEl) elevEl.textContent = repElev;
      if (scoreEl) scoreEl.textContent = repScore;

      const modal = document.getElementById('reportModal');
      if (modal) openModal(modal);
      return;
    }

    // View Invoice Modal
    const invoiceBtn = e.target.closest('.js-view-invoice-btn');
    if (invoiceBtn) {
      const invId = invoiceBtn.getAttribute('data-id') || 'INV-2026-0842';
      const invAmount = invoiceBtn.getAttribute('data-amount') || '$14,200.00';
      const invStatus = invoiceBtn.getAttribute('data-status') || 'Pending Approval';

      const titleEl = document.getElementById('invoiceModalTitle');
      const amountEl = document.getElementById('invoiceModalAmount');
      const statusEl = document.getElementById('invoiceModalStatus');

      if (titleEl) titleEl.textContent = `Invoice Detail: ${invId}`;
      if (amountEl) amountEl.textContent = invAmount;
      if (statusEl) {
        statusEl.textContent = `Status: ${invStatus}`;
        statusEl.style.color = invStatus.toLowerCase().includes('paid') ? '#10b981' : '#fbbf24';
      }

      const modal = document.getElementById('invoiceModal');
      if (modal) openModal(modal);
      return;
    }

    // Pay Invoice Confirmation
    const payBtn = e.target.closest('.js-pay-invoice-action');
    if (payBtn) {
      const modal = document.getElementById('invoiceModal');
      if (modal) closeModal(modal);

      const pendingRow = document.querySelector('#invoicesTable tr[data-status="pending"]');
      if (pendingRow) {
        pendingRow.setAttribute('data-status', 'paid');
        const badge = pendingRow.querySelector('.portal-badge');
        if (badge) {
          badge.className = 'portal-badge badge-valid';
          badge.textContent = 'Paid';
        }
      }
      showPortalToast('Payment authorization successful! Remittance receipt generated for Accounts.');
      return;
    }
  });
}

// Facility Switcher Dropdown
function initFacilitySwitcher() {
  const switcher = document.getElementById('portalFacilitySwitcher');
  const nameDisplay = document.getElementById('overviewFacilityName');
  const labelDisplay = document.getElementById('sidebarFacilityLabel');
  const specsBuilding = document.getElementById('specsBuildingName');

  if (!switcher) return;

  switcher.addEventListener('change', () => {
    const selectedOption = switcher.options[switcher.selectedIndex];
    const buildingName = selectedOption.text.split('(')[0].trim();
    const facilityDetail = selectedOption.text;

    if (nameDisplay) nameDisplay.textContent = buildingName;
    if (labelDisplay) labelDisplay.textContent = facilityDetail;
    if (specsBuilding) specsBuilding.value = buildingName;

    showPortalToast(`Facility profile switched to: ${buildingName}`);
  });
}

// Theme and RTL Toggle for Dashboard
function initPortalThemeAndRtl() {
  const themeToggles = document.querySelectorAll('.js-theme-toggle');
  const rtlToggles = document.querySelectorAll('.js-rtl-toggle');

  // 1. Initial Theme Apply
  const savedTheme = localStorage.getItem('elevex_theme') || 'dark';
  applyTheme(savedTheme);

  // 2. Initial RTL Apply
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

    // Update buttons
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
      showPortalToast(next === 'light' ? 'Light visual theme enabled' : 'Dark high-contrast theme enabled');
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
