/* ============================================================
   dashboard.js — Live Monitoring Dashboard Module
   TrafficVision AI
   ============================================================ */

const DashboardModule = (() => {
  const { VIOLATIONS_DB, VIOLATION_TYPES, LOCATIONS, pick, randInt, randFloat, generateViolation } = window.TrafficData;
  let feedInterval = null;
  let kpiInterval  = null;
  let camAnimFrame = null;
  let violationCounter = VIOLATIONS_DB.length;
  let initialized = false;

  // ─── KPI Cards ──────────────────────────────────────────
  function renderKPIs() {
    const today = new Date().toDateString();
    const todayCount = VIOLATIONS_DB.filter(v => v.timestamp.toDateString() === today).length;
    const highRisk = window.HotspotData.zones.filter(z => z.riskScore >= 85).length;
    const pending  = VIOLATIONS_DB.filter(v => v.status === 'Pending').length;
    const accuracy = 94.7;

    animateCounter('kpi-today',    todayCount,  '',  '%d');
    animateCounter('kpi-alerts',   pending,     '',  '%d');
    animateCounter('kpi-zones',    highRisk,    '',  '%d');
    animateCounter('kpi-accuracy', accuracy,    '%', '%.1f');
  }

  function animateCounter(id, target, suffix = '', fmt = '%d') {
    const el = document.getElementById(id);
    if (!el) return;
    const start    = 0;
    const duration = 1200;
    const startTs  = performance.now();
    function step(ts) {
      const progress = Math.min((ts - startTs) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const val      = start + (target - start) * ease;
      el.textContent = (fmt === '%.1f' ? val.toFixed(1) : Math.round(val)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ─── Live Violation Feed ─────────────────────────────────
  function renderFeed() {
    const container = document.getElementById('live-feed-list');
    if (!container) return;

    // Pre-populate with recent 12 violations
    const recent = VIOLATIONS_DB.slice(0, 12);
    container.innerHTML = '';
    recent.forEach(v => container.appendChild(buildFeedItem(v)));
  }

  function buildFeedItem(v) {
    const item = document.createElement('div');
    item.className = 'violation-item';
    item.innerHTML = `
      <div class="violation-item-icon" style="background:${v.typeColor}22; color:${v.typeColor}; font-size:1.1rem;">
        ${v.typeIcon}
      </div>
      <div class="violation-item-body">
        <div class="violation-item-type">${v.typeLabel}</div>
        <div class="violation-item-meta">
          <span class="font-mono text-xs" style="color:var(--cyan)">${v.plate}</span>
          <span>·</span>
          <span>${v.location.length > 25 ? v.location.slice(0, 25) + '…' : v.location}</span>
          <span>·</span>
          <span class="badge badge-${v.severity === 'high' ? 'danger' : v.severity === 'medium' ? 'warning' : 'primary'}" style="font-size:0.6rem; padding:1px 6px">
            ${v.severity.toUpperCase()}
          </span>
        </div>
      </div>
      <div class="violation-item-time">${v.timeStr}</div>
    `;
    item.addEventListener('click', () => showViolationModal(v));
    return item;
  }

  function pushNewViolation() {
    const container = document.getElementById('live-feed-list');
    if (!container || Router.getCurrent() !== 'dashboard') return;

    const v = generateViolation(++violationCounter, 0);
    v.timestamp = new Date();
    v.timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const item = buildFeedItem(v);
    container.insertBefore(item, container.firstChild);

    // Update KPI counter
    const kpiEl = document.getElementById('kpi-today');
    if (kpiEl) kpiEl.textContent = (parseInt(kpiEl.textContent) || 0) + 1;

    // Remove old items beyond 25
    while (container.children.length > 25) container.removeChild(container.lastChild);

    // Toast notification for high-severity
    if (v.severity === 'high' && Math.random() < 0.6) {
      showToast(v.typeIcon + ' Alert', `${v.typeLabel} at ${v.location.slice(0, 30)}`, 'danger');
    }

    // Add to DB for other pages
    VIOLATIONS_DB.unshift(v);
  }

  // ─── Camera Canvas Simulation ────────────────────────────
  const CAMERA_DEFS = [
    { id: 'cam1', label: 'CAM-SG-001 · SG Highway',    fps: 12 },
    { id: 'cam2', label: 'CAM-DRV-001 · Drive-in Rd',  fps: 10 },
    { id: 'cam3', label: 'CAM-THA-001 · Thaltej',       fps: 12 },
    { id: 'cam4', label: 'CAM-NAR-001 · Naranpura',     fps: 10 },
  ];

  // Animated camera feeds using canvas
  const camStates = {};

  function initCameras() {
    CAMERA_DEFS.forEach(cam => {
      const canvas = document.getElementById(`canvas-${cam.id}`);
      if (!canvas) return;
      canvas.width  = 320;
      canvas.height = 240;
      camStates[cam.id] = {
        ctx: canvas.getContext('2d'),
        frame: 0,
        boxes: generateBoxes(),
        boxTimer: 0,
      };
    });
    animateCameras();
  }

  function generateBoxes() {
    const n = randInt(1, 4);
    const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
    return Array.from({ length: n }, () => ({
      x: randInt(20, 220), y: randInt(30, 150),
      w: randInt(50, 90),  h: randInt(60, 100),
      color: pick(colors),
      label: pick(['Helmet ✓', 'No Helmet ✗', 'Vehicle', 'Rider', 'Car']),
      conf: randFloat(85, 99, 1),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function animateCameras() {
    CAMERA_DEFS.forEach(cam => {
      const state = camStates[cam.id];
      if (!state) return;
      const { ctx } = state;
      const W = 320, H = 240;

      // Road background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);

      // Road texture
      ctx.fillStyle = '#1a2234';
      ctx.fillRect(0, H * 0.55, W, H);

      // Road markings
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(W / 2, H * 0.55);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizon line
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.55);
      ctx.lineTo(W, H * 0.55);
      ctx.stroke();

      // Subtle noise / grain
      for (let i = 0; i < 60; i++) {
        const alpha = Math.random() * 0.06;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }

      // Move & draw boxes
      state.boxTimer++;
      if (state.boxTimer > 80) {
        state.boxes = generateBoxes();
        state.boxTimer = 0;
      }

      state.boxes.forEach(box => {
        box.x += box.vx;
        box.y += box.vy;
        if (box.x < 0 || box.x + box.w > W) box.vx *= -1;
        if (box.y < 20 || box.y + box.h > H - 20) box.vy *= -1;

        // Bounding box
        ctx.strokeStyle = box.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Corner marks
        const cs = 8;
        ctx.lineWidth = 2.5;
        [[0,0],[1,0],[0,1],[1,1]].forEach(([fx, fy]) => {
          const cx = box.x + fx * box.w;
          const cy = box.y + fy * box.h;
          ctx.beginPath();
          ctx.moveTo(cx + (fx ? -cs : cs), cy);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx, cy + (fy ? -cs : cs));
          ctx.stroke();
        });

        // Label badge
        ctx.fillStyle = box.color + 'dd';
        ctx.fillRect(box.x, box.y - 18, box.label.length * 6.5 + 10, 16);
        ctx.fillStyle = '#fff';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`${box.label} ${box.conf}%`, box.x + 5, box.y - 6);
      });

      // Scan line effect
      const scanY = (state.frame % H);
      const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 4);
      gradient.addColorStop(0, 'rgba(59,130,246,0)');
      gradient.addColorStop(0.5, 'rgba(59,130,246,0.06)');
      gradient.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY, W, 4);

      // Timestamp overlay
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, H - 20, W, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(new Date().toLocaleTimeString('en-IN') + '  |  LIVE', 6, H - 7);

      state.frame++;
    });

    camAnimFrame = requestAnimationFrame(animateCameras);
  }

  // ─── Violation Type Distribution Bars ────────────────────
  function renderViolationBars() {
    const container = document.getElementById('violation-bars');
    if (!container) return;

    const byType = window.TrafficData.getViolationsByType();
    const total  = Object.values(byType).reduce((a, b) => a + b, 0);

    container.innerHTML = window.TrafficData.VIOLATION_TYPES.map(vt => {
      const count = byType[vt.id] || 0;
      const pct   = total ? Math.round((count / total) * 100) : 0;
      return `
        <div class="mini-bar-row">
          <div class="mini-bar-label">${vt.icon} ${vt.label}</div>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width:0%;background:${vt.color}"
                 data-target="${pct}%" data-width="${pct}"></div>
          </div>
          <div class="mini-bar-value">${count}</div>
        </div>
      `;
    }).join('');

    // Animate bars
    setTimeout(() => {
      container.querySelectorAll('.mini-bar-fill').forEach(el => {
        el.style.width = el.dataset.target;
      });
    }, 200);
  }

  // ─── Zone Risk Mini List ──────────────────────────────────
  function renderTopZones() {
    const container = document.getElementById('dash-top-zones');
    if (!container) return;
    const zones = window.HotspotData.zones.slice(0, 5);
    container.innerHTML = zones.map((z, i) => `
      <div class="zone-card">
        <div class="zone-rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : 'other'}">${z.rank}</div>
        <div class="zone-info">
          <div class="zone-name">${z.name}</div>
          <div class="zone-meta">${z.violations} violations · ${z.patrol ? '🚔 Patrol Active' : 'No Patrol'}</div>
        </div>
        <div class="zone-score">${z.riskScore}</div>
      </div>
    `).join('');
  }

  // ─── Modal ────────────────────────────────────────────────
  function showViolationModal(v) {
    const overlay = document.getElementById('violation-modal');
    if (!overlay) return;
    document.getElementById('vm-type').textContent     = v.typeLabel;
    document.getElementById('vm-type').style.color     = v.typeColor;
    document.getElementById('vm-plate').textContent    = v.plate;
    document.getElementById('vm-location').textContent = v.location;
    document.getElementById('vm-time').textContent     = v.dateStr + ' ' + v.timeStr;
    document.getElementById('vm-confidence').textContent = v.confidence + '%';
    document.getElementById('vm-camera').textContent   = v.camera;
    document.getElementById('vm-status').textContent   = v.status;
    document.getElementById('vm-fine').textContent     = '₹' + v.fineAmount;
    document.getElementById('vm-severity').textContent = v.severity.toUpperCase();
    document.getElementById('vm-severity').className  = `badge severity-${v.severity}`;
    document.getElementById('vm-evidence').textContent = v.evidenceId;
    overlay.classList.remove('hidden');
  }

  // ─── Issue Challan ────────────────────────────────────────
  function issueChallan(btn) {
    if (btn && btn.dataset.issued === 'true') {
      showToast('\u2139\ufe0f Challan Already Issued', 'A challan has already been issued for this violation.', 'info');
      return;
    }
    const plateEl = document.getElementById('vm-plate');
    const typeEl  = document.getElementById('vm-type');
    const fineEl  = document.getElementById('vm-fine');
    const plate = plateEl ? plateEl.textContent : 'N/A';
    const type  = typeEl  ? typeEl.textContent  : 'Violation';
    const fine  = fineEl  ? fineEl.textContent  : '\u20b90';
    if (btn) {
      btn.dataset.issued = 'true';
      btn.textContent = '\u2713 Challan Issued';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }
    const statusEl = document.getElementById('vm-status');
    if (statusEl) statusEl.textContent = 'Challan Issued';
    document.getElementById('violation-modal').classList.add('hidden');
    showToast('\ud83d\udcdc Challan Issued', `Challan for ${plate} \u2014 ${type} (${fine}) has been dispatched to the registered owner.`, 'success');
  }

  // ─── Public API ───────────────────────────────────────────
  function init() {
    if (initialized) return;
    initialized = true;
    renderKPIs();
    renderFeed();
    renderViolationBars();
    renderTopZones();
    initCameras();

    // Live feed updates every 3–7s
    feedInterval = setInterval(pushNewViolation, randInt(3000, 7000));
  }

  function destroy() {
    clearInterval(feedInterval);
    clearInterval(kpiInterval);
    if (camAnimFrame) cancelAnimationFrame(camAnimFrame);
    initialized = false;
  }

  return { init, destroy, showViolationModal, animateCounter, issueChallan };
})();

window.DashboardModule = DashboardModule;
