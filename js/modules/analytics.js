/* ============================================================
   analytics.js — Charts & Trends Module (Chart.js)
   TrafficVision AI
   ============================================================ */

const AnalyticsModule = (() => {
  let charts = {};
  let initialized = false;

  const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(222,28%,14%)',
        borderColor:     'hsl(217,30%,35%)',
        borderWidth: 1,
        titleColor:  'hsl(210,25%,95%)',
        bodyColor:   'hsl(215,15%,70%)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: 'hsl(215,12%,48%)', font: { size: 11, family: 'Inter' } },
        border:{ display: false },
      },
      y: {
        grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: 'hsl(215,12%,48%)', font: { size: 11, family: 'Inter' } },
        border:{ display: false },
        beginAtZero: true,
      },
    },
  };

  function destroyChart(key) {
    if (charts[key]) { charts[key].destroy(); delete charts[key]; }
  }

  // ─── Daily Trend Line Chart ──────────────────────────────
  function renderDailyTrend() {
    destroyChart('daily');
    const ctx = document.getElementById('chart-daily-trend');
    if (!ctx) return;

    const data7 = window.TrafficData.getViolationsLast7Days();

    charts['daily'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data7.map(d => d.label),
        datasets: [{
          label: 'Violations',
          data: data7.map(d => d.count),
          borderColor: 'hsl(217,91%,60%)',
          backgroundColor: (ctx2) => {
            const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, 'hsla(217,91%,60%,0.3)');
            g.addColorStop(1, 'hsla(217,91%,60%,0.0)');
            return g;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: 'hsl(217,91%,60%)',
          pointBorderColor: 'hsl(222,28%,11%)',
          pointBorderWidth: 2,
          borderWidth: 2.5,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: { display: false },
        },
      },
    });
  }

  // ─── 30-Day Trend Bar Chart ──────────────────────────────
  function renderMonthlyTrend() {
    destroyChart('monthly');
    const ctx = document.getElementById('chart-monthly-trend');
    if (!ctx) return;

    const data30 = window.TrafficData.getViolationsLast30Days();

    charts['monthly'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data30.map(d => d.label),
        datasets: [{
          label: 'Violations',
          data: data30.map(d => d.count),
          backgroundColor: data30.map((_, i) => {
            const alpha = 0.5 + (i / data30.length) * 0.5;
            return `hsla(217,91%,60%,${alpha})`;
          }),
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      },
    });
  }

  // ─── Violation Type Donut ────────────────────────────────
  function renderTypeDonut() {
    destroyChart('donut');
    const ctx = document.getElementById('chart-type-donut');
    if (!ctx) return;

    const byType = window.TrafficData.getViolationsByType();
    const types  = window.TrafficData.VIOLATION_TYPES;
    const total  = Object.values(byType).reduce((a, b) => a + b, 0);

    charts['donut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: types.map(t => t.label),
        datasets: [{
          data: types.map(t => byType[t.id] || 0),
          backgroundColor: types.map(t => t.color + 'cc'),
          borderColor: types.map(t => t.color),
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        cutout: '72%',
        scales: {},
        plugins: {
          ...CHART_DEFAULTS.plugins,
          legend: {
            display: true,
            position: 'right',
            labels: {
              color:   'hsl(215,15%,70%)',
              font:    { size: 11, family: 'Inter' },
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
        },
      },
    });

    // Center label
    const centerEl = document.getElementById('donut-center-value');
    if (centerEl) centerEl.textContent = total;
  }

  // ─── Hourly Distribution Bar Chart ──────────────────────
  function renderHourlyChart() {
    destroyChart('hourly');
    const ctx = document.getElementById('chart-hourly');
    if (!ctx) return;

    const hours = window.TrafficData.getHourlyDistribution();
    const labels = hours.map((_, i) => i < 10 ? `0${i}:00` : `${i}:00`);

    charts['hourly'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Violations',
          data: hours,
          backgroundColor: hours.map(v => {
            const mx = Math.max(...hours);
            const r  = v / mx;
            if (r > 0.8) return 'hsla(0,85%,60%,0.8)';
            if (r > 0.5) return 'hsla(38,95%,58%,0.75)';
            return 'hsla(217,91%,60%,0.65)';
          }),
          borderRadius: 3,
          borderSkipped: false,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      },
    });
  }

  // ─── Peak Hours Heatmap Grid ─────────────────────────────
  function renderPeakGrid() {
    const container = document.getElementById('peak-hours-grid');
    if (!container) return;

    const { days, matrix } = window.TrafficData.getPeakHoursGrid();
    const maxVal = Math.max(...matrix.flat());

    let html = '<div class="heatmap-time-grid">';
    // Hours header
    html += '<div class="heatmap-day-label"></div>';
    for (let h = 0; h < 24; h++) {
      html += `<div class="heatmap-hour-label">${h}</div>`;
    }
    // Rows
    days.forEach((day, di) => {
      html += `<div class="heatmap-day-label">${day}</div>`;
      matrix[di].forEach((val, hi) => {
        const intensity = maxVal ? val / maxVal : 0;
        const color     = getHeatColor(intensity);
        const tooltip   = `${day} ${hi}:00 — ${val} violations`;
        html += `<div class="heatmap-cell" style="background:${color}" data-tooltip="${tooltip}"></div>`;
      });
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function getHeatColor(t) {
    if (t < 0.01) return 'hsl(222,28%,14%)';
    if (t < 0.2)  return `hsla(217,91%,${50+t*30}%,${0.2+t*0.5})`;
    if (t < 0.5)  return `hsla(${200-t*160},90%,${60-t*10}%,${0.4+t*0.4})`;
    if (t < 0.8)  return `hsla(${38-t*30},95%,${65-t*15}%,${0.6+t*0.3})`;
    return `hsla(0,85%,${60-t*10}%,${0.7+t*0.3})`;
  }

  // ─── Location Bar Chart ──────────────────────────────────
  function renderLocationChart() {
    destroyChart('location');
    const ctx = document.getElementById('chart-location');
    if (!ctx) return;

    const locs = window.TrafficData.getLocationRiskScores().slice(0, 10);

    charts['location'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: locs.map(l => l.name.length > 20 ? l.name.slice(0, 20) + '…' : l.name),
        datasets: [{
          label: 'Violations',
          data: locs.map(l => l.count),
          backgroundColor: locs.map((l, i) => {
            const colors = ['#ef4444','#f97316','#f59e0b','#3b82f6','#8b5cf6',
                            '#10b981','#06b6d4','#3b82f6','#8b5cf6','#10b981'];
            return colors[i % colors.length] + 'cc';
          }),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        ...CHART_DEFAULTS,
        indexAxis: 'y',
        plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
        scales: {
          x: { ...CHART_DEFAULTS.scales.x, beginAtZero: true },
          y: {
            grid:  { display: false },
            ticks: { color: 'hsl(215,15%,70%)', font: { size: 10, family: 'Inter' } },
            border:{ display: false },
          },
        },
      },
    });
  }

  // ─── Summary Metrics ────────────────────────────────────
  function renderSummaryMetrics() {
    const db = window.TrafficData.VIOLATIONS_DB;
    const today = new Date().toDateString();
    const todayCount = db.filter(v => v.timestamp.toDateString() === today).length;
    const totalFines = db.reduce((s, v) => s + (v.status === 'Challan Issued' || v.status === 'Paid' ? v.fineAmount : 0), 0);
    const detected   = db.length;
    const accuracy   = 94.7;

    const metrics = [
      { id: 'analytics-total',    val: detected, suffix: '' },
      { id: 'analytics-today',    val: todayCount, suffix: '' },
      { id: 'analytics-fines',    val: `₹${Math.round(totalFines/1000)}K`, suffix: '' },
      { id: 'analytics-accuracy', val: accuracy, suffix: '%' },
    ];

    metrics.forEach(m => {
      const el = document.getElementById(m.id);
      if (el && typeof m.val === 'number') {
        DashboardModule.animateCounter(m.id, m.val, m.suffix, m.suffix === '%' ? '%.1f' : '%d');
      } else if (el) {
        el.textContent = m.val;
      }
    });
  }

  function init() {
    if (initialized) {
      // Reinitialize charts when revisiting page
      Object.keys(charts).forEach(destroyChart);
    }
    initialized = true;
    renderDailyTrend();
    renderMonthlyTrend();
    renderTypeDonut();
    renderHourlyChart();
    renderPeakGrid();
    renderLocationChart();
    renderSummaryMetrics();
  }

  return { init };
})();

window.AnalyticsModule = AnalyticsModule;
