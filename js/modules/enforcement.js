/* ============================================================
   enforcement.js — Enforcement Intelligence Module
   TrafficVision AI
   ============================================================ */

const EnforcementModule = (() => {
  let riskChart = null;

  // Current slider values
  const params = {
    violationFreq: 75,
    trafficDensity: 80,
    accidentHistory: 60,
    congestionImpact: 70,
  };

  function computeRisk() {
    // Weighted formula
    return Math.round(
      (params.violationFreq * 0.35 +
       params.trafficDensity * 0.25 +
       params.accidentHistory * 0.25 +
       params.congestionImpact * 0.15)
    );
  }

  function updateRiskDisplay() {
    const score = computeRisk();
    const el    = document.getElementById('risk-score-number');
    if (el) el.textContent = score;

    // Update ring
    const ring = document.getElementById('risk-ring-fill');
    if (ring) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference * (1 - score / 100);
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : '#10b981';
    }

    // Level label
    const levelEl = document.getElementById('risk-level-label');
    if (levelEl) {
      levelEl.textContent = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
      levelEl.style.color = score >= 80 ? 'var(--danger)' : score >= 60 ? 'var(--warning)' : 'var(--accent)';
    }
  }

  function initSliders() {
    Object.keys(params).forEach(key => {
      const slider = document.getElementById(`slider-${key}`);
      const valEl  = document.getElementById(`slider-val-${key}`);
      if (!slider) return;
      slider.value = params[key];
      if (valEl) valEl.textContent = params[key];

      slider.addEventListener('input', () => {
        params[key] = parseInt(slider.value);
        if (valEl) valEl.textContent = params[key];
        updateRiskDisplay();
      });
    });
    updateRiskDisplay();
  }

  function renderRecommendations() {
    const container = document.getElementById('enforcement-recommendations');
    if (!container) return;

    const recs = [
      {
        priority: 1, critical: true,
        title: 'Deploy Patrol Unit — SG Highway Junction',
        detail: 'Risk score 95/100. 147 violations in last 7 days. Peak hours: 08:00–10:00 & 17:00–20:00.',
        icon: '🚔',
      },
      {
        priority: 2, critical: true,
        title: 'Red Light Camera — Drive-in Road',
        detail: 'High frequency of red light jumps detected. Recommend permanent enforcement camera installation.',
        icon: '🚦',
      },
      {
        priority: 3, critical: false,
        title: 'Helmet Check Point — Thaltej Crossroads',
        detail: '89 helmet violations logged. Static checkpoint recommended on weekdays 08:00–10:30.',
        icon: '🪖',
      },
      {
        priority: 4, critical: false,
        title: 'Tow Truck Deployment — Naroda Industrial Area',
        detail: '47 illegal parking incidents blocking main artery. Congestion impact score: 8.4/10.',
        icon: '🚛',
      },
      {
        priority: 5, critical: false,
        title: 'Traffic Warden — Satellite Road Crossing',
        detail: '78 stop-line violations. Recommend manual traffic management during peak hours.',
        icon: '👮',
      },
      {
        priority: 6, critical: false,
        title: 'Digital Signage Update — Prahlad Nagar',
        detail: 'Wrong-side driving incidents increasing. Update road markings and install additional signage.',
        icon: '🛑',
      },
    ];

    container.innerHTML = recs.map(r => `
      <div class="recommendation-item" id="rec-item-${r.priority}">
        <div class="recommendation-priority${r.critical ? ' critical' : ''}">${r.priority}</div>
        <div class="recommendation-body">
          <div class="recommendation-title">${r.icon} ${r.title}</div>
          <div class="recommendation-detail">${r.detail}</div>
        </div>
        <button class="btn btn-sm btn-secondary" id="deploy-btn-${r.priority}" style="flex-shrink:0"
          onclick="EnforcementModule.deployRecommendation(${r.priority}, '${r.title.replace(/'/g, '\\\'')}', '${r.icon}')">
          Deploy
        </button>
      </div>
    `).join('');
  }

  function renderResourceAllocation() {
    const container = document.getElementById('resource-allocation');
    if (!container) return;

    const resources = [
      { name: 'Patrol Units', available: 12, deployed: 8, color: 'var(--primary)' },
      { name: 'Enforcement Cameras', available: 45, deployed: 38, color: 'var(--accent)' },
      { name: 'Traffic Wardens', available: 30, deployed: 22, color: 'var(--warning)' },
      { name: 'Tow Trucks', available: 8, deployed: 5, color: 'var(--danger)' },
    ];

    container.innerHTML = resources.map(r => {
      const pct = Math.round((r.deployed / r.available) * 100);
      return `
        <div style="margin-bottom:var(--space-4)">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span class="text-sm font-600">${r.name}</span>
            <span class="text-sm font-mono" style="color:${r.color}">${r.deployed}/${r.available}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:${r.color}"></div>
          </div>
          <div class="text-xs text-muted" style="margin-top:4px">${pct}% deployed · ${r.available - r.deployed} available</div>
        </div>
      `;
    }).join('');
  }

  function renderFineCollection() {
    const container = document.getElementById('fine-collection');
    if (!container) return;

    const db = window.TrafficData.VIOLATIONS_DB;
    const issued = db.filter(v => v.status === 'Challan Issued');
    const paid   = db.filter(v => v.status === 'Paid');
    const pending = db.filter(v => v.status === 'Pending');

    const totalIssued = issued.reduce((s, v) => s + v.fineAmount, 0);
    const totalPaid   = paid.reduce((s, v) => s + v.fineAmount, 0);

    container.innerHTML = `
      <div class="grid grid-3" style="gap:var(--space-3);margin-bottom:var(--space-4)">
        <div class="report-block">
          <div class="report-block-value" style="color:var(--primary)">₹${Math.round(totalIssued/1000)}K</div>
          <div class="report-block-label">Fines Issued</div>
        </div>
        <div class="report-block">
          <div class="report-block-value" style="color:var(--accent)">₹${Math.round(totalPaid/1000)}K</div>
          <div class="report-block-label">Fines Collected</div>
        </div>
        <div class="report-block">
          <div class="report-block-value" style="color:var(--warning)">${pending.length}</div>
          <div class="report-block-label">Pending Cases</div>
        </div>
      </div>
      <div class="progress-bar" style="height:10px">
        <div class="progress-fill green" style="width:${totalIssued ? Math.round(totalPaid/totalIssued*100) : 0}%"></div>
      </div>
      <div class="text-xs text-muted" style="margin-top:6px">
        ${totalIssued ? Math.round(totalPaid/totalIssued*100) : 0}% collection rate
      </div>
    `;
  }

  function deployRecommendation(priority, title, icon) {
    const btn = document.getElementById(`deploy-btn-${priority}`);
    if (!btn) return;
    if (btn.dataset.deployed === 'true') {
      showToast('ℹ️ Already Deployed', `Unit ${priority} — ${title.slice(0, 40)} is already active.`, 'info');
      return;
    }
    btn.dataset.deployed = 'true';
    btn.textContent = '✓ Deployed';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-success');
    btn.style.background = 'var(--accent)';
    btn.style.color = '#0a0e1a';
    btn.style.borderColor = 'var(--accent)';
    showToast(`${icon} Deployment Confirmed`, `Priority ${priority}: ${title.slice(0, 45)} — Unit dispatched successfully.`, 'success');
    // Update resource allocation count
    setTimeout(() => {
      renderResourceAllocation();
      showToast('📊 Resources Updated', 'Resource allocation dashboard has been refreshed.', 'info');
    }, 1500);
  }

  function init() {
    initSliders();
    renderRecommendations();
    renderResourceAllocation();
    renderFineCollection();
  }

  return { init, deployRecommendation };
})();

window.EnforcementModule = EnforcementModule;
