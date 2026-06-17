/* ============================================================
   reports.js — Reports & Export Module
   TrafficVision AI
   ============================================================ */

const ReportsModule = (() => {
  let reportChart = null;

  function renderSummaryStats() {
    const db = window.TrafficData.VIOLATIONS_DB;
    const today = new Date().toDateString();

    const stats = {
      total:    db.length,
      today:    db.filter(v => v.timestamp.toDateString() === today).length,
      high:     db.filter(v => v.severity === 'high').length,
      pending:  db.filter(v => v.status === 'Pending').length,
      challan:  db.filter(v => v.status === 'Challan Issued').length,
      paid:     db.filter(v => v.status === 'Paid').length,
      fines:    db.reduce((s, v) => s + v.fineAmount, 0),
      collected:db.filter(v => v.status === 'Paid').reduce((s, v) => s + v.fineAmount, 0),
      cameras:  window.TrafficData.CAMERAS.length,
      zones:    window.HotspotData.zones.length,
      accuracy: 94.7,
      uptime:   99.2,
    };

    Object.entries({
      'rpt-total':    stats.total,
      'rpt-today':    stats.today,
      'rpt-high':     stats.high,
      'rpt-pending':  stats.pending,
      'rpt-challan':  stats.challan,
      'rpt-paid':     stats.paid,
      'rpt-cameras':  stats.cameras,
      'rpt-zones':    stats.zones,
    }).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) DashboardModule.animateCounter(id, val, '', '%d');
    });

    const fineEl = document.getElementById('rpt-fines');
    if (fineEl) fineEl.textContent = `₹${Math.round(stats.fines / 100000).toFixed(1)}L`;

    const collEl = document.getElementById('rpt-collected');
    if (collEl) collEl.textContent = `₹${Math.round(stats.collected / 1000)}K`;

    const accEl = document.getElementById('rpt-accuracy');
    if (accEl) accEl.textContent = `${stats.accuracy}%`;

    const upEl = document.getElementById('rpt-uptime');
    if (upEl) upEl.textContent = `${stats.uptime}%`;
  }

  function renderReportChart() {
    if (reportChart) { reportChart.destroy(); reportChart = null; }
    const ctx = document.getElementById('chart-report-trend');
    if (!ctx) return;

    const data30 = window.TrafficData.getViolationsLast30Days();

    reportChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data30.map(d => d.label),
        datasets: [
          {
            label: 'Total Violations',
            data: data30.map(d => d.count),
            borderColor: 'hsl(217,91%,60%)',
            backgroundColor: 'hsla(217,91%,60%,0.15)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2,
          },
          {
            label: 'High Severity',
            data: data30.map(d => Math.round(d.count * 0.45)),
            borderColor: 'hsl(0,85%,60%)',
            backgroundColor: 'hsla(0,85%,60%,0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'hsl(215,15%,70%)',
              font: { size: 11, family: 'Inter' },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: 'hsl(222,28%,14%)',
            borderColor: 'hsl(217,30%,35%)',
            borderWidth: 1,
            titleColor: 'hsl(210,25%,95%)',
            bodyColor: 'hsl(215,15%,70%)',
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'hsl(215,12%,48%)', font: { size: 9 }, maxRotation: 60 },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'hsl(215,12%,48%)', font: { size: 11 } },
            border: { display: false },
            beginAtZero: true,
          },
        },
      },
    });
  }

  function renderTypeBreakdown() {
    const container = document.getElementById('report-type-breakdown');
    if (!container) return;

    const byType = window.TrafficData.getViolationsByType();
    const types  = window.TrafficData.VIOLATION_TYPES;
    const total  = Object.values(byType).reduce((a, b) => a + b, 0);

    container.innerHTML = types.map(t => {
      const count = byType[t.id] || 0;
      const pct   = total ? ((count / total) * 100).toFixed(1) : '0.0';
      const avgFine = Math.round(
        window.TrafficData.VIOLATIONS_DB
          .filter(v => v.type === t.id)
          .reduce((s, v) => s + v.fineAmount, 0) / (count || 1)
      );
      return `
        <tr>
          <td>
            <span style="font-size:1rem">${t.icon}</span>
            <span style="margin-left:8px;font-size:0.8125rem;font-weight:600;color:var(--text-primary)">${t.label}</span>
          </td>
          <td style="font-family:var(--font-mono);font-weight:700;color:var(--text-primary)">${count.toLocaleString('en-IN')}</td>
          <td style="color:var(--text-muted)">${pct}%</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar" style="width:100px;display:inline-block">
                <div class="progress-fill" style="width:${pct}%;background:${t.color}"></div>
              </div>
            </div>
          </td>
          <td style="font-weight:600;color:var(--text-primary)">₹${avgFine}</td>
          <td><span class="badge severity-${t.severity}">${t.severity.toUpperCase()}</span></td>
        </tr>
      `;
    }).join('');
  }

  function initExportButtons() {
    const pdfBtn  = document.getElementById('btn-export-pdf');
    const xlsBtn  = document.getElementById('btn-export-xls');
    const csvBtn  = document.getElementById('btn-export-csv');

    [pdfBtn, xlsBtn, csvBtn].forEach((btn, i) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const fmts = ['PDF', 'Excel', 'CSV'];
        showToast('📥 Export Started', `Generating ${fmts[i]} report… This may take a moment.`, 'success');
        setTimeout(() => showToast('✅ Export Complete', `${fmts[i]} report is ready for download.`, 'success'), 2000);
      });
    });
  }

  function init() {
    renderSummaryStats();
    renderReportChart();
    renderTypeBreakdown();
    initExportButtons();
  }

  return { init };
})();

window.ReportsModule = ReportsModule;
