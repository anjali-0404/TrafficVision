/* ============================================================
   app.js — Application Entry Point & Initialization
   TrafficVision AI
   ============================================================ */

// ─── Toast Notification System (global) ─────────────────────
function showToast(title, msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', danger: '🚨', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: 'var(--accent-dim)',
    danger:  'var(--danger-dim)',
    info:    'var(--primary-dim)',
    warning: 'var(--warning-dim)',
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon" style="background:${colors[type] || colors.info}; font-size:1rem">
      ${icons[type] || icons.info}
    </div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="color:var(--text-muted);font-size:1rem;padding:4px 6px;border-radius:4px;transition:color 0.15s" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

window.showToast = showToast;

// ─── Modal Close Helpers ────────────────────────────────────
function initModalCloseHandlers() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.closeModal;
      const modal    = document.getElementById(targetId);
      if (modal) modal.classList.add('hidden');
    });
  });

  // Click outside to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });
}

// ─── Clock Display ──────────────────────────────────────────
function startClock() {
  function update() {
    const el = document.getElementById('topbar-clock');
    if (el) {
      el.textContent = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
    }
  }
  update();
  setInterval(update, 1000);
}

// ─── Notification Badge Updates ─────────────────────────────
function updateNotifBadge() {
  const badge = document.getElementById('notif-badge');
  if (badge) {
    let count = parseInt(badge.textContent || '0') + 1;
    if (count > 99) count = 99;
    badge.textContent = count;
  }
}

// ─── Register All Pages ─────────────────────────────────────
function registerPages() {
  Router.register('dashboard', () => {
    DashboardModule.init();
  });

  Router.register('detection', () => {
    DetectionModule.init();
  });

  Router.register('hotspot', () => {
    HeatmapModule.init();
    HeatmapModule.renderZonesPanel();
  });

  Router.register('analytics', () => {
    AnalyticsModule.init();
  });

  Router.register('plates', () => {
    SearchModule.init();
  });

  Router.register('enforcement', () => {
    EnforcementModule.init();
  });

  Router.register('predictions', () => {
    PredictionsModule.init();
  });

  Router.register('evidence', () => {
    EvidenceModule.init();
  });

  Router.register('reports', () => {
    ReportsModule.init();
  });
}

// ─── Sidebar Collapse Toggle ─────────────────────────────────
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar   = document.querySelector('.sidebar');
  const main      = document.querySelector('.main-content');
  const topbar    = document.querySelector('.topbar');

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    main?.classList.toggle('sidebar-collapsed');
    topbar?.classList.toggle('sidebar-collapsed');
  });
}

// ─── Keyboard Shortcuts ──────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    // Alt + number to navigate
    if (e.altKey) {
      const pageMap = {
        '1': 'dashboard', '2': 'detection', '3': 'hotspot',
        '4': 'analytics', '5': 'plates',    '6': 'enforcement',
        '7': 'predictions','8': 'evidence',  '9': 'reports',
      };
      if (pageMap[e.key]) {
        e.preventDefault();
        Router.navigate(pageMap[e.key]);
      }
    }
    // ESC to close modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }
  });
}

// ─── Progress Bars Animation on Scroll ──────────────────────
function initProgressAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.dataset.width;
        if (target) bar.style.width = target + '%';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.mini-bar-fill').forEach(bar => observer.observe(bar));
}

// ─── Simulate incoming alerts periodically ──────────────────
function initAlertSimulation() {
  setInterval(() => {
    if (Math.random() < 0.3) {
      updateNotifBadge();
    }
  }, 8000);
}

// ─── Main Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🚦 TrafficVision AI — Initializing...', 'color:#3b82f6;font-size:14px;font-weight:700');
  console.log('%cTraffic Violation Intelligence & Enforcement Platform v2.0', 'color:#94a3b8;font-size:12px');

  // Boot sequence
  startClock();
  initModalCloseHandlers();
  initSidebarToggle();
  initKeyboardShortcuts();
  initAlertSimulation();

  // Register all page modules
  registerPages();

  // Start router (will trigger first page render)
  Router.init();

  // Initial toast
  setTimeout(() => {
    showToast('🚦 System Online', 'TrafficVision AI is monitoring all camera feeds.', 'success');
  }, 800);

  console.log('%c✅ TrafficVision AI ready.', 'color:#10b981;font-size:12px;font-weight:700');
});
