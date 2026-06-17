/* ============================================================
   router.js — Client-side Hash Router
   TrafficVision AI
   ============================================================ */

const Router = (() => {
  const routes = {};
  let currentPage = null;

  function register(id, onEnter) {
    routes[id] = onEnter;
  }

  function navigate(pageId) {
    if (currentPage === pageId) return;
    currentPage = pageId;

    // Hide all pages
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));

    // Show target page
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
      target.classList.add('active');
    }

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });

    // Update topbar title
    const titleEl  = document.getElementById('topbar-title');
    const titleSub = document.getElementById('topbar-subtitle');
    const pageMeta = PAGE_META[pageId] || {};
    if (titleEl)  titleEl.textContent  = pageMeta.title  || pageId;
    if (titleSub) titleSub.textContent = pageMeta.sub    || '';

    // Fire onEnter callback
    if (routes[pageId]) {
      setTimeout(() => routes[pageId](), 50);
    }

    // Update URL hash
    window.location.hash = pageId;

    // Scroll to top
    const main = document.querySelector('.main-content');
    if (main) main.scrollTop = 0;
  }

  function init() {
    // Attach nav item listeners
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.addEventListener('click', () => navigate(el.dataset.page));
    });

    // Read hash or default
    const hash = window.location.hash.replace('#', '');
    navigate(hash && routes[hash] ? hash : 'dashboard');
  }

  function getCurrent() { return currentPage; }

  return { register, navigate, init, getCurrent };
})();

const PAGE_META = {
  dashboard:   { title: 'Live Monitoring Dashboard',        sub: 'Real-time traffic violation surveillance & alerts' },
  detection:   { title: 'Violation Detection Lab',          sub: 'AI-powered multi-violation image analysis' },
  hotspot:     { title: 'GIS Hotspot Intelligence',         sub: 'Geographic violation density mapping & zone analytics' },
  analytics:   { title: 'Analytics & Trends',               sub: 'Violation patterns, peak hours, and temporal trends' },
  plates:      { title: 'License Plate Registry',           sub: 'OCR records, vehicle history & repeat offenders' },
  enforcement: { title: 'Enforcement Intelligence',         sub: 'AI-driven patrol deployment & resource optimization' },
  predictions: { title: 'Predictive Violation Forecasting', sub: 'LSTM + XGBoost ensemble violation forecasting' },
  evidence:    { title: 'Digital Evidence Management',      sub: 'Court-admissible AI evidence packages' },
  reports:     { title: 'Reports & Export',                 sub: 'Summary statistics, PDF/Excel export' },
};

window.Router   = Router;
window.PAGE_META = PAGE_META;
