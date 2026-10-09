/**
 * ELEVEX High-Rise Facade Access & Operations
 * Admin Management Portal Logic (admin-portal.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
  initAdminSidebar();
  initAdminModals();
  initAdminFilters();
  initAdminForms();
  initAdminActions();
  initSectorSwitcher();
  initAdminThemeAndRtl();
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

// Tab Switching
function initAdminTabs() {
  const navItems = document.querySelectorAll('.portal-nav-item');
  const tabPanes = document.querySelectorAll('.portal-tab-pane');

  function switchTab(tabId) {
    if (!tabId) return;
    const cleanId = tabId.replace('#', '');
    const targetPane = document.getElementById(`tab${cleanId.charAt(0).toUpperCase() + cleanId.slice(1)}`);
    
    if (!targetPane) return;

    tabPanes.forEach(pane => pane.classList.remove('active'));
    targetPane.classList.add('active');

    navItems.forEach(item => {
      const itemTab = item.getAttribute('data-tab');
      if (itemTab === cleanId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (history.pushState) {
      history.pushState(null, null, `#${cleanId}`);
    } else {
      location.hash = `#${cleanId}`;
    }

    const mainEl = document.querySelector('.portal-main');
    if (mainEl) mainEl.scrollTop = 0;

    closeMobileSidebar();
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });

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
function initAdminSidebar() {
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
function initAdminModals() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-target]');
    if (trigger) {
      e.preventDefault();
      const targetSelector = trigger.getAttribute('data-modal-target');
      const targetModal = document.querySelector(targetSelector);
      if (targetModal) openModal(targetModal);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-close-modal')) {
      e.preventDefault();
      const modal = e.target.closest('.portal-modal-backdrop');
      if (modal) closeModal(modal);
    }
  });

  document.querySelectorAll('.portal-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.portal-modal-backdrop.open');
      if (openModalEl) closeModal(openModalEl);
    }
  });

  // Open Stand-Down Trigger
  const standDownBtn = document.querySelector('.js-open-stand-down');
  if (standDownBtn) {
    standDownBtn.addEventListener('click', () => {
      const modal = document.getElementById('adminStandDownModal');
      if (modal) openModal(modal);
    });
  }
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
function initAdminFilters() {
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
          const rowCat = (row.getAttribute('data-category') || row.getAttribute('data-status') || '').toLowerCase();
          const rowText = row.textContent.toLowerCase();

          if (rowCat === filterVal || rowCat.includes(filterVal) || rowText.includes(filterVal)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }

  setupFilter('adminBuildingsFilterChips', 'adminBuildingsTable');
  setupFilter('adminScheduleFilterChips', 'adminScheduleTable');
  setupFilter('adminSafetyFilterChips', 'adminSafetyTable');
}

// Admin Forms
function initAdminForms() {
  // Dispatch Drop Form
  const dispatchForm = document.getElementById('adminDispatchForm');
  const dispatchModal = document.getElementById('adminDispatchModal');
  const scheduleTbody = document.getElementById('adminScheduleTableBody');

  if (dispatchForm && scheduleTbody) {
    const dateInput = document.getElementById('dispatchDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    dispatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tower = document.getElementById('dispatchTower').value;
      const elev = document.getElementById('dispatchElevation').value;
      const dateVal = document.getElementById('dispatchDate').value;
      const shift = document.getElementById('dispatchShift').value;
      const crew = document.getElementById('dispatchCrew').value;
      const access = document.getElementById('dispatchAccess').value;

      const randomId = 'DRP-2026-' + Math.floor(115 + Math.random() * 800);
      const d = new Date(dateVal);
      const formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const tr = document.createElement('tr');
      tr.style.animation = 'fadeInUp 0.3s ease';
      tr.innerHTML = `
        <td><span class="portal-badge badge-cyan">${randomId}</span></td>
        <td>
          <strong style="color: #fff;">${formattedDate}</strong>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${shift}</div>
        </td>
        <td>
          <strong style="color: #fff;">${tower}</strong>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${elev}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem; color: #fff;">${access}</div>
          <div style="font-size: 0.74rem; color: #34d399;">0.00 PPM Pure Reverse Osmosis</div>
        </td>
        <td>
          <div style="color: #fff; font-size: 0.85rem;">${crew}</div>
        </td>
        <td><span class="portal-badge badge-emerald">RAMS Approved</span></td>
        <td><span class="portal-badge badge-scheduled">Dispatched</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="portal-action-btn js-admin-reassign-btn" data-id="${randomId}">Reassign</button>
            <button class="portal-action-btn btn-outline-danger js-admin-complete-btn" data-id="${randomId}">Sign-Off</button>
          </div>
        </td>
      `;

      scheduleTbody.insertBefore(tr, scheduleTbody.firstChild);
      closeModal(dispatchModal);
      dispatchForm.reset();
      showPortalToast(`Drop ${randomId} dispatched to ${tower}! Crew radio alerted.`);
    });
  }

  // Add Tower Form
  const addBuildingForm = document.getElementById('adminAddBuildingForm');
  const addBuildingModal = document.getElementById('adminAddBuildingModal');
  const buildingsTbody = document.getElementById('adminBuildingsTableBody');

  if (addBuildingForm && buildingsTbody) {
    addBuildingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newTowerName').value;
      const addr = document.getElementById('newTowerAddress').value;
      const floors = document.getElementById('newTowerFloors').value;
      const height = document.getElementById('newTowerHeight').value;
      const mgr = document.getElementById('newManagerName').value;

      const code = 'TWR-0' + Math.floor(5 + Math.random() * 20);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="portal-badge badge-cyan">${code}</span></td>
        <td>
          <strong style="color: #fff;">${name}</strong>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${addr}</div>
        </td>
        <td>
          <div style="color: #fff; font-size: 0.85rem;">${mgr}</div>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">Facility Director</div>
        </td>
        <td>
          <div style="color: #fff; font-size: 0.85rem;">${floors} Floors • ${height}</div>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">Curtain Wall Glazing</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: #fff;">Twin-Rope Industrial Abseil</div>
          <div style="font-size: 0.74rem; color: var(--portal-cyan);">Eyebolt System</div>
        </td>
        <td><span class="portal-badge badge-emerald">Quarterly Comprehensive</span></td>
        <td><span class="portal-badge badge-confirmed">Active</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="portal-action-btn js-dispatch-this-tower" data-tower="${name}">Dispatch</button>
            <button class="portal-action-btn btn-outline-danger" onclick="showPortalToast('Tower profile loaded.');">Specs</button>
          </div>
        </td>
      `;

      buildingsTbody.insertBefore(tr, buildingsTbody.firstChild);
      closeModal(addBuildingModal);
      addBuildingForm.reset();
      showPortalToast(`${name} enrolled into active operations portfolio!`);
    });
  }

  // Upload Safety Doc Form
  const uploadDocForm = document.getElementById('adminUploadDocForm');
  const uploadDocModal = document.getElementById('adminUploadDocModal');
  const safetyTbody = document.getElementById('adminSafetyTableBody');

  if (uploadDocForm && safetyTbody) {
    uploadDocForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('uploadDocTitle').value;
      const tower = document.getElementById('uploadDocTower').value;
      const standard = document.getElementById('uploadDocStandard').value;
      const expiry = document.getElementById('uploadDocExpiry').value;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--portal-accent-pink)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <strong style="color: #fff;">${title}</strong>
          </div>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">RAMS Repository File</div>
        </td>
        <td>${tower}</td>
        <td>${standard}</td>
        <td>${new Date().toLocaleDateString('en-GB')}</td>
        <td>${expiry}</td>
        <td><span class="portal-badge badge-emerald">Valid</span></td>
        <td>
          <button class="portal-action-btn" onclick="showPortalToast('${title} verified.');">Verify</button>
        </td>
      `;

      safetyTbody.insertBefore(tr, safetyTbody.firstChild);
      closeModal(uploadDocModal);
      uploadDocForm.reset();
      showPortalToast(`Safety record '${title}' published to RAMS repository!`);
    });
  }

  // Generate Invoice Form
  const invoiceForm = document.getElementById('adminGenerateInvoiceForm');
  const invoiceModal = document.getElementById('adminGenerateInvoiceModal');
  const invoicesTbody = document.getElementById('adminInvoicesTableBody');

  if (invoiceForm) {
    invoiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tower = document.getElementById('invoiceTargetTower').value;
      const amount = document.getElementById('invoiceAmount').value;
      const terms = document.getElementById('invoiceTerms').value;

      const randomInv = 'INV-2026-0' + Math.floor(845 + Math.random() * 100);

      if (invoicesTbody) {
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const due = new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="portal-badge badge-cyan">${randomInv}</span></td>
          <td>
            <strong style="color: var(--portal-text-title);">${tower}</strong>
            <div style="font-size: 0.76rem; color: var(--portal-text-muted);">Commercial Maintenance Retainer</div>
          </td>
          <td>${today}</td>
          <td>${due}</td>
          <td><strong style="color: var(--portal-text-title); font-size: 0.95rem;">$${Number(amount).toLocaleString()}.00</strong></td>
          <td><span class="portal-badge badge-pending">Pending Net-30</span></td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="portal-action-btn" onclick="showPortalToast('Payment reminder sent to ${tower}.');">Remind</button>
              <button class="portal-action-btn btn-outline-danger" onclick="showPortalToast('Invoice ${randomInv} downloaded as PDF.');">PDF</button>
            </div>
          </td>
        `;
        invoicesTbody.insertBefore(tr, invoicesTbody.firstChild);
      }

      closeModal(invoiceModal);
      invoiceForm.reset();
      showPortalToast(`Invoice ${randomInv} for $${Number(amount).toLocaleString()} (${terms}) issued to ${tower}!`);
    });
  }

  // Add Technician Form
  const addTechForm = document.getElementById('adminAddTechForm');
  const addTechModal = document.getElementById('adminAddTechModal');
  const techsTbody = document.getElementById('adminTechsTableBody');

  if (addTechForm && techsTbody) {
    addTechForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newTechName').value;
      const level = document.getElementById('newTechLevel').value;
      const license = document.getElementById('newTechLicense').value;
      const hours = document.getElementById('newTechHours').value;
      const medical = document.getElementById('newTechMedical').value;
      const squad = document.getElementById('newTechSquad').value;

      const d = new Date(medical);
      const formattedMedical = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong style="color: var(--portal-text-title);">${name}</strong>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${level} • ${squad}</div>
        </td>
        <td><span class="portal-badge badge-emerald">${level}</span></td>
        <td><code>${license}</code></td>
        <td><strong style="color: var(--portal-text-title);">${hours}</strong></td>
        <td><span style="color: #34d399;">${formattedMedical}</span></td>
        <td><span class="portal-badge badge-emerald">On Roster</span></td>
        <td>
          <button class="portal-action-btn" onclick="showPortalToast('${name} logbook inspected (${hours}).');">Logbook</button>
        </td>
      `;
      techsTbody.insertBefore(tr, techsTbody.firstChild);
      closeModal(addTechModal);
      addTechForm.reset();
      showPortalToast(`Technician ${name} (${level}) rostered into ${squad}!`);
    });
  }

  // New Inquiry Form
  const inquiryForm = document.getElementById('adminNewInquiryForm');
  const inquiryModal = document.getElementById('adminNewInquiryModal');
  const enquiriesTbody = document.getElementById('adminEnquiriesTableBody');

  if (inquiryForm && enquiriesTbody) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const contact = document.getElementById('inquiryContactName').value;
      const company = document.getElementById('inquiryCompany').value;
      const phone = document.getElementById('inquiryPhone').value;
      const tower = document.getElementById('inquiryTower').value;
      const scope = document.getElementById('inquiryScope').value;

      const randomRef = 'ENQ-2026-0' + Math.floor(43 + Math.random() * 50);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="portal-badge badge-cyan">${randomRef}</span></td>
        <td>
          <strong style="color: var(--portal-text-title);">${contact}</strong>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">${company} • ${phone}</div>
        </td>
        <td>
          <strong style="color: var(--portal-text-title);">${tower}</strong>
          <div style="font-size: 0.76rem; color: var(--portal-text-muted);">Commercial Glazed Envelope</div>
        </td>
        <td>${scope}</td>
        <td>Just now</td>
        <td><span class="portal-badge badge-cyan">New RFP</span></td>
        <td>
          <button class="portal-action-btn" onclick="showPortalToast('Site survey dispatched to ${tower}.');">Dispatch Survey</button>
        </td>
      `;
      enquiriesTbody.insertBefore(tr, enquiriesTbody.firstChild);
      closeModal(inquiryModal);
      inquiryForm.reset();
      showPortalToast(`Inquiry ${randomRef} from ${contact} (${company}) logged! Site survey dispatched.`);
    });
  }
}

// Action Buttons
function initAdminActions() {
  document.addEventListener('click', (e) => {
    // Reassign
    const reassignBtn = e.target.closest('.js-admin-reassign-btn');
    if (reassignBtn) {
      const dropId = reassignBtn.getAttribute('data-id');
      const newCrew = prompt(`Reassign ${dropId} to which crew? (e.g. Crew Bravo, Crew Charlie):`);
      if (newCrew) {
        const row = reassignBtn.closest('tr');
        if (row && row.cells[4]) {
          row.cells[4].innerHTML = `<div style="color: #fff; font-size: 0.85rem;">${newCrew} (Reassigned)</div><div style="font-size: 0.74rem; color: var(--portal-cyan);">IRATA Lead Dispatched</div>`;
        }
        showPortalToast(`${dropId} successfully reassigned to ${newCrew}.`);
      }
      return;
    }

    // Sign-Off Drop
    const completeBtn = e.target.closest('.js-admin-complete-btn');
    if (completeBtn) {
      const dropId = completeBtn.getAttribute('data-id');
      if (confirm(`Approve QA sign-off for ${dropId}? 0.00 TDS pure water audit verified.`)) {
        const row = completeBtn.closest('tr');
        if (row && row.cells[6]) {
          row.cells[6].innerHTML = `<span class="portal-badge badge-emerald">Completed</span>`;
        }
        completeBtn.remove();
        showPortalToast(`${dropId} signed off! Optical glass service audit published to client.`);
      }
      return;
    }

    // Dispatch target tower from Buildings table
    const dispatchTowerBtn = e.target.closest('.js-dispatch-this-tower');
    if (dispatchTowerBtn) {
      const towerName = dispatchTowerBtn.getAttribute('data-tower');
      const select = document.getElementById('dispatchTower');
      if (select) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.includes(towerName)) {
            select.selectedIndex = i;
            break;
          }
        }
      }
      const modal = document.getElementById('adminDispatchModal');
      if (modal) openModal(modal);
      return;
    }

    // Admin QA Report Review
    const qaBtn = e.target.closest('.js-admin-qa-btn');
    if (qaBtn) {
      const repId = qaBtn.getAttribute('data-id');
      const building = qaBtn.getAttribute('data-building');
      showPortalToast(`QA Service Audit for ${repId} (${building}) reviewed and signed off with 100% optical clearance.`);
      return;
    }
  });
}

// Emergency Stand-Down Execution
window.executeStandDown = function() {
  const modal = document.getElementById('adminStandDownModal');
  const reason = document.getElementById('standDownReason') ? document.getElementById('standDownReason').value : 'Weather Threshold';
  
  if (modal) closeModal(modal);

  const windBadge = document.getElementById('adminWindBadge');
  if (windBadge) {
    windBadge.style.background = 'rgba(239, 68, 68, 0.15)';
    windBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    windBadge.style.color = '#f87171';
    windBadge.innerHTML = `
      <span class="portal-telemetry-dot" style="background: #ef4444; box-shadow: 0 0 8px #ef4444;"></span>
      <span>MANDATORY STAND-DOWN ACTIVE (26.4 kts) • ALL ON-ROPE OPS HALTED</span>
    `;
  }

  showPortalToast(`EMERGENCY BROADCAST TRANSMITTED: ${reason}. All 4 rigging crews ordered off-rope.`, 6000);
};

// Sector Switcher
function initSectorSwitcher() {
  const switcher = document.getElementById('adminSectorSwitcher');
  const label = document.getElementById('adminSectorLabel');

  if (!switcher) return;

  switcher.addEventListener('change', () => {
    const text = switcher.options[switcher.selectedIndex].text;
    if (label) label.textContent = text.split('(')[0].trim();
    showPortalToast(`Operational sector filtered: ${text}`);
  });
}

// Theme and RTL
function initAdminThemeAndRtl() {
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
