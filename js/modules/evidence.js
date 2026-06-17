/* ============================================================
   evidence.js — Digital Evidence Management Module
   TrafficVision AI
   ============================================================ */

const EvidenceModule = (() => {
  // Generate evidence packages from high-confidence violations
  function getEvidencePackages() {
    return window.TrafficData.VIOLATIONS_DB
      .filter(v => v.confidence >= 92 && v.severity === 'high')
      .slice(0, 12);
  }

  function renderEvidenceGrid() {
    const container = document.getElementById('evidence-grid-container');
    if (!container) return;

    const packages = getEvidencePackages();

    container.innerHTML = packages.map(v => buildEvidenceCard(v)).join('');
  }

  function buildEvidenceCard(v) {
    const statusColor = {
      'Pending':       'var(--warning)',
      'Challan Issued':'var(--primary)',
      'Paid':          'var(--accent)',
      'Under Review':  'var(--purple)',
    }[v.status] || 'var(--text-muted)';

    return `
      <div class="evidence-card" onclick="EvidenceModule.showEvidenceDetail('${v.id}')">
        <div class="evidence-card-image">
          ${buildEvidenceCanvasHTML(v)}
        </div>
        <div class="evidence-card-body">
          <div class="evidence-card-id">${v.evidenceId} · ${v.camera}</div>
          <div class="evidence-card-title">${v.typeIcon} ${v.typeLabel}</div>
          <div class="evidence-meta-grid">
            <div class="evidence-meta-item">
              <div class="evidence-meta-label">Plate</div>
              <div class="evidence-meta-value font-mono" style="color:var(--cyan)">${v.plate}</div>
            </div>
            <div class="evidence-meta-item">
              <div class="evidence-meta-label">Confidence</div>
              <div class="evidence-meta-value" style="color:var(--accent)">${v.confidence}%</div>
            </div>
            <div class="evidence-meta-item">
              <div class="evidence-meta-label">Date</div>
              <div class="evidence-meta-value">${v.dateStr}</div>
            </div>
            <div class="evidence-meta-item">
              <div class="evidence-meta-label">Fine</div>
              <div class="evidence-meta-value">₹${v.fineAmount}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="badge severity-${v.severity}">${v.severity.toUpperCase()}</span>
            <span style="font-size:0.75rem;font-weight:600;color:${statusColor}">${v.status}</span>
          </div>
        </div>
      </div>
    `;
  }

  function buildEvidenceCanvasHTML(v) {
    // Draw synthetic evidence image inline
    return `
      <canvas id="ev-canvas-${v.id}" width="320" height="180"
        style="width:100%;height:100%;object-fit:cover"
        data-type="${v.type}" data-color="${v.typeColor}"></canvas>
    `;
  }

  function drawEvidenceCanvases() {
    document.querySelectorAll('[id^="ev-canvas-"]').forEach(canvas => {
      const ctx   = canvas.getContext('2d');
      const type  = canvas.dataset.type;
      const color = canvas.dataset.color;
      const W = canvas.width, H = canvas.height;
      drawEvidenceScene(ctx, W, H, type, color);
    });
  }

  function drawEvidenceScene(ctx, W, H, type, color) {
    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.55, '#1e3a5f');
    bg.addColorStop(0.55, '#374151');
    bg.addColorStop(1, '#1f2937');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Noise
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    // Main subject box
    const bx = W * 0.2, by = H * 0.2, bw = W * 0.5, bh = H * 0.55;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = color + '18';
    ctx.fillRect(bx, by, bw, bh);

    // Corner marks
    const cs = 8;
    [[0,0],[1,0],[0,1],[1,1]].forEach(([fx, fy]) => {
      const cx = bx + fx * bw, cy = by + fy * bh;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + (fx ? -cs : cs), cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + (fy ? -cs : cs));
      ctx.stroke();
    });

    // Label
    const typeIcons = { helmet:'🪖', seatbelt:'🔒', triple:'🏍️', wrongside:'⬅️', redlight:'🚦', parking:'🅿️', stopline:'🛑' };
    ctx.fillStyle = color + 'ee';
    ctx.fillRect(bx, by - 18, 120, 16);
    ctx.fillStyle = '#fff';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText(`${typeIcons[type] || '⚠️'} VIOLATION ${Math.floor(Math.random() * 10 + 90)}%`, bx + 4, by - 6);

    // Plate overlay
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(2, H - 22, W - 4, 20);
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 8px JetBrains Mono, monospace';
    ctx.fillText(`EVIDENCE · ${new Date().toLocaleDateString('en-IN')} · AI CERTIFIED`, 6, H - 9);

    // Crosshair
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
    ctx.stroke();
  }

  function showEvidenceDetail(vid) {
    const v = window.TrafficData.VIOLATIONS_DB.find(x => x.id === vid);
    if (!v) return;

    const modal = document.getElementById('evidence-modal');
    if (!modal) return;

    // Populate modal
    document.getElementById('evm-id').textContent        = v.evidenceId;
    document.getElementById('evm-type').textContent      = v.typeLabel;
    document.getElementById('evm-plate').textContent     = v.plate;
    document.getElementById('evm-location').textContent  = v.location;
    document.getElementById('evm-datetime').textContent  = `${v.dateStr} at ${v.timeStr}`;
    document.getElementById('evm-confidence').textContent= `${v.confidence}%`;
    document.getElementById('evm-camera').textContent    = v.camera;
    document.getElementById('evm-severity').textContent  = v.severity.toUpperCase();
    document.getElementById('evm-fine').textContent      = `₹${v.fineAmount}`;
    document.getElementById('evm-status').textContent    = v.status;
    document.getElementById('evm-lat').textContent       = v.lat.toFixed(6);
    document.getElementById('evm-lng').textContent       = v.lng.toFixed(6);
    document.getElementById('evm-model').textContent     = 'YOLOv11 + PaddleOCR';
    document.getElementById('evm-hash').textContent      = `SHA-256: ${generateFakeHash()}`;

    const evCanvas = document.getElementById('evm-canvas');
    if (evCanvas) {
      const ctx = evCanvas.getContext('2d');
      drawEvidenceScene(ctx, evCanvas.width, evCanvas.height, v.type, v.typeColor);
    }

    modal.classList.remove('hidden');
  }

  function generateFakeHash() {
    const chars = '0123456789abcdef';
    return Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * 16)]).join('');
  }

  function exportAllEvidence() {
    const packages = getEvidencePackages();
    showToast('\ud83d\udce6 Export Started', `Preparing ${packages.length} evidence packages for export\u2026`, 'info');
    setTimeout(() => {
      let csv = 'ID,Plate,Location,Time,Hash\n';
      packages.forEach(p => {
        csv += `${p.id},${p.plate},"${p.location}",${p.timeStr},${p.hash}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TrafficVision_Evidence_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('\u2705 Export Ready', `${packages.length} evidence packages exported as CSV.`, 'success');
    }, 1500);
  }

  function downloadCertificate() {
    const idEl   = document.getElementById('evm-id');
    const plateEl = document.getElementById('evm-plate');
    const locEl = document.getElementById('evm-loc');
    const timeEl = document.getElementById('evm-time');
    const hashEl = document.getElementById('evm-hash');
    const typeEl = document.querySelector('#evidence-modal .modal-title');
    
    const id    = idEl    ? idEl.textContent    : 'EV-XXXX';
    const plate = plateEl ? plateEl.textContent : 'UNKNOWN';
    const loc   = locEl   ? locEl.textContent   : 'N/A';
    const time  = timeEl  ? timeEl.textContent  : 'N/A';
    const hash  = hashEl  ? hashEl.textContent  : 'N/A';
    const type  = typeEl  ? typeEl.textContent.replace('\ud83d\udcc4 Evidence: ', '') : 'Violation';

    showToast('\ud83d\udcc4 Generating Certificate', `Preparing certified evidence for ${plate}\u2026`, 'info');
    setTimeout(() => {
      const content = `TrafficVision AI - Official Violation Certificate
=========================================================
Evidence ID:    ${id}
Vehicle Plate:  ${plate}
Violation:      ${type}
Location:       ${loc}
Timestamp:      ${time}

Details:
This document serves as an AI-certified evidence package.
The evidence has been processed by TrafficVision AI and 
securely logged.

SHA-256 Checksum:
${hash}
=========================================================
Generated on: ${new Date().toString()}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${id}_${plate}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('\u2705 Certificate Downloaded', `Evidence package ${id} saved to your downloads.`, 'success');
    }, 1200);
  }

  function init() {
    renderEvidenceGrid();
    setTimeout(drawEvidenceCanvases, 100);
  }

  return { init, showEvidenceDetail, exportAllEvidence, downloadCertificate };
})();

window.EvidenceModule = EvidenceModule;
