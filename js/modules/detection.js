/* ============================================================
   detection.js — Violation Detection Lab Module
   TrafficVision AI
   ============================================================ */

const DetectionModule = (() => {
  const { VIOLATION_TYPES, pick, randFloat, randInt } = window.TrafficData;
  let demoInterval = null;
  let demoFrame    = null;
  let demoPhase    = 'idle'; // idle | processing | result
  let currentBoxes = [];

  // Color per violation type
  const TYPE_COLORS = {
    helmet:    '#ef4444',
    seatbelt:  '#f59e0b',
    triple:    '#8b5cf6',
    wrongside: '#ec4899',
    redlight:  '#ef4444',
    parking:   '#3b82f6',
    stopline:  '#f97316',
  };

  // ─── Violation Type Counters ─────────────────────────────
  function initCounters() {
    VIOLATION_TYPES.forEach(vt => {
      const el = document.getElementById(`vtype-count-${vt.id}`);
      if (el) {
        const count = window.TrafficData.VIOLATIONS_DB.filter(v => v.type === vt.id).length;
        DashboardModule.animateCounter(`vtype-count-${vt.id}`, count, '', '%d');
      }
    });
  }

  // ─── Upload Simulation ───────────────────────────────────
  function initUploadZone() {
    const zone   = document.getElementById('upload-zone');
    const input  = document.getElementById('upload-input');
    const canvas = document.getElementById('detection-canvas');
    if (!zone) return;

    zone.addEventListener('click', (e) => { e.stopPropagation(); input && input.click(); });
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) processFile(file);
    });

    if (input) {
      input.addEventListener('change', () => {
        if (input.files[0]) processFile(input.files[0]);
      });
    }

    // Demo button
    const demoBtn = document.getElementById('btn-run-demo');
    if (demoBtn) demoBtn.addEventListener('click', runDemo);
  }

  function processFile(file) {
    const canvas = document.getElementById('detection-canvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;

    // Hide upload zone, show canvas wrapper
    const zone = document.getElementById('upload-zone');
    const wrapper = document.getElementById('detection-canvas-wrapper');
    if (zone) zone.style.display = 'none';
    if (wrapper) wrapper.style.display = 'block';
    canvas.classList.remove('hidden');

    const img = new Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth  || 640;
      canvas.height = img.naturalHeight || 360;
      ctx.drawImage(img, 0, 0);
      startProcessing(ctx, canvas.width, canvas.height);
    };
    img.src = URL.createObjectURL(file);
  }

  function runDemo() {
    const canvas = document.getElementById('detection-canvas');
    if (!canvas) return;
    const zone    = document.getElementById('upload-zone');
    const wrapper = document.getElementById('detection-canvas-wrapper');
    if (zone)    zone.style.display    = 'none';
    if (wrapper) wrapper.style.display = 'block';
    canvas.classList.remove('hidden');

    canvas.width  = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Draw synthetic road scene
    drawSyntheticScene(ctx, canvas.width, canvas.height);
    startProcessing(ctx, canvas.width, canvas.height);
  }

  function drawSyntheticScene(ctx, W, H) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.5);

    // Road
    const road = ctx.createLinearGradient(0, H * 0.5, 0, H);
    road.addColorStop(0, '#374151');
    road.addColorStop(1, '#1f2937');
    ctx.fillStyle = road;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);

    // Lane lines
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(W / 2, H * 0.5); ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Side markings
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, H * 0.5); ctx.lineTo(40, H);
    ctx.moveTo(W - 80, H * 0.5); ctx.lineTo(W - 40, H);
    ctx.stroke();

    // Traffic signal
    ctx.fillStyle = '#111';
    ctx.fillRect(W - 80, 40, 30, 80);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(W - 65, 65, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.arc(W - 65, 90, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath(); ctx.arc(W - 65, 115, 10, 0, Math.PI * 2); ctx.fill();

    // Stop line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W - 120, H * 0.5 + 20); ctx.lineTo(W - 30, H * 0.5 + 20);
    ctx.stroke();

    // Vehicle shapes
    // Motorcycle 1 (no helmet)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(120, 220, 60, 40);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.ellipse(135, 215, 10, 10, 0, 0, Math.PI * 2); ctx.fill(); // rider head (no helmet)

    // Car
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(250, 200, 110, 55);
    ctx.fillStyle = '#bfdbfe';
    ctx.fillRect(260, 205, 90, 25);

    // Bike (triple riding)
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(380, 230, 65, 35);
    // 3 riders
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#ddd6fe';
      ctx.beginPath(); ctx.ellipse(393 + i * 18, 225, 8, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function startProcessing(ctx, W, H) {
    demoPhase = 'processing';
    showProcessingOverlay();

    const steps = [
      { label: 'Image Enhancement',    delay: 400 },
      { label: 'Object Detection',     delay: 800 },
      { label: 'Violation Analysis',   delay: 1200 },
      { label: 'License Plate OCR',    delay: 1600 },
      { label: 'Evidence Generation',  delay: 2000 },
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        updateProcessingStep(i);
      }, step.delay);
    });

    setTimeout(() => {
      hideProcessingOverlay();
      demoPhase = 'result';
      showDetectionResults(ctx, W, H);
    }, 2400);
  }

  function showProcessingOverlay() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  function hideProcessingOverlay() {
    const overlay = document.getElementById('processing-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function updateProcessingStep(activeIdx) {
    document.querySelectorAll('.processing-step').forEach((el, i) => {
      el.classList.remove('done', 'active');
      if (i < activeIdx) el.classList.add('done');
      else if (i === activeIdx) el.classList.add('active');
    });
  }

  function showDetectionResults(ctx, W, H) {
    // Generate random detection boxes
    currentBoxes = [];
    const detections = [
      { type: 'helmet',    label: '🪖 No Helmet',   conf: 97.3, color: '#ef4444', x: 110, y: 180, w: 85,  h: 80 },
      { type: 'vehicle',   label: '🚗 Car',          conf: 99.1, color: '#3b82f6', x: 245, y: 195, w: 115, h: 65 },
      { type: 'triple',    label: '🏍️ Triple Riding', conf: 95.8, color: '#8b5cf6', x: 370, y: 215, w: 85,  h: 60 },
      { type: 'redlight',  label: '🚦 Red Light',    conf: 99.8, color: '#ef4444', x: W - 100, y: 30,  w: 45,  h: 100 },
      { type: 'stopline',  label: '🛑 Stop Line',    conf: 98.2, color: '#f97316', x: W - 130, y: H * 0.5 + 10, w: 110, h: 25 },
    ];

    detections.forEach(det => {
      drawDetectionBox(ctx, det);
      currentBoxes.push(det);
    });

    // Populate results panel
    renderResultsPanel(detections);

    // Update detection counter badge
    const badge = document.getElementById('detection-count-badge');
    if (badge) {
      badge.textContent = detections.filter(d => d.type !== 'vehicle').length + ' Violations Found';
      badge.classList.remove('hidden');
    }
  }

  function drawDetectionBox(ctx, det) {
    const { x, y, w, h, color, label, conf } = det;

    // Box
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Fill
    ctx.fillStyle = color + '22';
    ctx.fillRect(x, y, w, h);

    // Corner marks
    const cs = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    [[0,0],[1,0],[0,1],[1,1]].forEach(([fx, fy]) => {
      const cx = x + fx * w, cy = y + fy * h;
      ctx.beginPath();
      ctx.moveTo(cx + (fx ? -cs : cs), cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + (fy ? -cs : cs));
      ctx.stroke();
    });

    // Label
    const lbl  = `${label} ${conf}%`;
    const lw   = ctx.measureText(lbl).width + 12;
    ctx.fillStyle = color + 'ee';
    ctx.fillRect(x, y - 22, lw, 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(lbl, x + 6, y - 8);
  }

  function renderResultsPanel(detections) {
    const panel = document.getElementById('detection-results-panel');
    if (!panel) return;

    const violations = detections.filter(d => d.type !== 'vehicle');
    panel.innerHTML = `
      <div class="font-700 text-sm text-primary" style="margin-bottom:12px">
        ${violations.length} Violation${violations.length !== 1 ? 's' : ''} Detected
      </div>
      ${violations.map(d => `
        <div class="detection-result">
          <div class="detection-result-color" style="background:${d.color}"></div>
          <div class="detection-result-info">
            <div class="detection-result-type">${d.label.split(' ').slice(1).join(' ')}</div>
            <div class="detection-result-conf">Confidence: ${d.conf}%</div>
          </div>
          <div class="badge severity-high">HIGH</div>
        </div>
      `).join('')}
      <div class="detection-result" style="margin-top:8px">
        <div class="detection-result-color" style="background:var(--accent)"></div>
        <div class="detection-result-info">
          <div class="detection-result-type">License Plate OCR</div>
          <div class="detection-result-conf font-mono" style="color:var(--cyan)">GJ01AB1234</div>
        </div>
        <div class="badge badge-success">OCR</div>
      </div>
      <div style="margin-top:12px; padding:10px; background:var(--bg-surface-3); border-radius:var(--radius-md); border:1px solid var(--border)">
        <div class="text-xs text-muted" style="margin-bottom:4px">MODEL PIPELINE</div>
        <div class="text-xs" style="color:var(--text-secondary)">
          YOLOv11 → DeepSORT → PaddleOCR<br>
          Processing: <span style="color:var(--accent)">124ms</span> · GPU: RTX 4090
        </div>
      </div>
    `;
  }

  function init() {
    initCounters();
    initUploadZone();
  }

  return { init };
})();

window.DetectionModule = DetectionModule;
