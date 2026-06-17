/* ============================================================
   predictions.js — Predictive Forecasting Module (Chart.js)
   TrafficVision AI
   ============================================================ */

const PredictionsModule = (() => {
  let forecastChart  = null;
  let weeklyChart    = null;
  let initialized    = false;

  function destroyChart(c) { if (c) { c.destroy(); } return null; }

  // ─── 24-Hour Forecast Chart ──────────────────────────────
  function renderForecastChart() {
    forecastChart = destroyChart(forecastChart);
    const ctx = document.getElementById('chart-forecast');
    if (!ctx) return;

    const data   = window.PredictionData.forecast24h;
    const labels = data.map(d => d.label);

    forecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Predicted',
            data: data.map(d => d.predicted),
            borderColor: 'hsl(217,91%,60%)',
            backgroundColor: (c) => {
              const g = c.chart.ctx.createLinearGradient(0, 0, 0, 220);
              g.addColorStop(0, 'hsla(217,91%,60%,0.25)');
              g.addColorStop(1, 'hsla(217,91%,60%,0.0)');
              return g;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: data.map(d => d.isPast ? 3 : 5),
            pointBackgroundColor: data.map(d => d.isPast ? 'hsl(215,12%,48%)' : 'hsl(217,91%,60%)'),
            pointBorderColor: 'hsl(222,28%,11%)',
            pointBorderWidth: 2,
          },
          {
            label: 'Upper Bound',
            data: data.map(d => d.upper),
            borderColor: 'hsla(217,91%,60%,0.25)',
            borderDash: [6, 4],
            borderWidth: 1,
            pointRadius: 0,
            fill: false,
          },
          {
            label: 'Lower Bound',
            data: data.map(d => d.lower),
            borderColor: 'hsla(217,91%,60%,0.25)',
            borderDash: [6, 4],
            borderWidth: 1,
            pointRadius: 0,
            fill: '-1',
            backgroundColor: 'hsla(217,91%,60%,0.08)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
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
          annotation: {},
        },
        scales: {
          x: {
            grid:  { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'hsl(215,12%,48%)', font: { size: 10 }, maxRotation: 45 },
            border: { display: false },
          },
          y: {
            grid:  { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: 'hsl(215,12%,48%)', font: { size: 11 } },
            border: { display: false },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // ─── Weekly Pattern Chart ────────────────────────────────
  function renderWeeklyChart() {
    weeklyChart = destroyChart(weeklyChart);
    const ctx = document.getElementById('chart-weekly-pattern');
    if (!ctx) return;

    const d = window.PredictionData.weeklyPattern;

    weeklyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Predicted',
            data: d.predicted,
            backgroundColor: 'hsla(217,91%,60%,0.7)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Actual',
            data: d.actual,
            backgroundColor: 'hsla(160,70%,45%,0.7)',
            borderRadius: 4,
            borderSkipped: false,
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
            grid: { display: false },
            ticks: { color: 'hsl(215,12%,48%)', font: { size: 11 } },
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

  // ─── Zone Predictions Table ───────────────────────────────
  function renderZonePredictions() {
    const tbody = document.getElementById('zone-predictions-body');
    if (!tbody) return;

    tbody.innerHTML = window.PredictionData.zonePredictions.map((z, idx) => {
      const trendIcon  = z.trend === 'up' ? '▲' : '▼';
      const trendColor = z.trend === 'up' ? 'var(--danger)' : 'var(--accent)';
      const riskColor  = z.predictedRisk >= 90 ? 'var(--danger)' : z.predictedRisk >= 75 ? 'var(--warning)' : 'var(--accent)';

      return `
        <tr>
          <td style="font-size:0.8125rem;font-weight:600;color:var(--text-primary)">
            ${z.zone.length > 28 ? z.zone.slice(0, 28) + '\u2026' : z.zone}
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar" style="width:80px;display:inline-block">
                <div class="progress-fill" style="width:${z.currentRisk}%;background:var(--text-muted)"></div>
              </div>
              <span class="font-mono text-sm">${z.currentRisk}</span>
            </div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div class="progress-bar" style="width:80px;display:inline-block">
                <div class="progress-fill" style="width:${z.predictedRisk}%;background:${riskColor}"></div>
              </div>
              <span class="font-mono text-sm" style="color:${riskColor}">${z.predictedRisk}</span>
            </div>
          </td>
          <td style="color:${trendColor};font-weight:700">${trendIcon} ${z.trend.toUpperCase()}</td>
          <td style="color:var(--text-muted);font-size:0.8125rem">${z.eta}</td>
          <td>
            <button class="btn btn-sm btn-secondary" id="alert-btn-${idx}"
              onclick="PredictionsModule.alertZone('${z.zone.replace(/'/g, '\\\'')}', '${z.trend}', '${z.predictedRisk}', ${idx})">
              Alert
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ─── Weather Factors ─────────────────────────────────────
  function renderWeatherFactors() {
    const container = document.getElementById('weather-factors');
    if (!container) return;

    container.innerHTML = window.PredictionData.weatherFactors.map((f, i) => `
      <div class="weather-factor-card ${f.active ? 'active' : ''}">
        <div class="weather-factor-icon">${f.icon}</div>
        <div class="weather-factor-info">
          <div class="weather-factor-name">${f.name}</div>
          <div class="weather-factor-impact">Impact: ${f.impact}</div>
        </div>
        <label style="cursor:pointer">
          <input type="checkbox" ${f.active ? 'checked' : ''}
            id="weather-toggle-${i}"
            style="accent-color:var(--primary)"
            onchange="PredictionsModule.toggleWeather(${i})">
        </label>
      </div>
    `).join('');
  }

  function toggleWeather(idx) {
    window.PredictionData.weatherFactors[idx].active = !window.PredictionData.weatherFactors[idx].active;
    const factor = window.PredictionData.weatherFactors[idx];
    const state  = factor.active ? 'enabled' : 'disabled';
    showToast(`${factor.icon} Factor ${state.charAt(0).toUpperCase() + state.slice(1)}`,
      `${factor.name} factor ${state} — forecast model updating.`, 'info');
  }

  function alertZone(zone, trend, riskScore, idx) {
    const btn = document.getElementById(`alert-btn-${idx}`);
    const isHigh = parseInt(riskScore) >= 80;
    const icon = isHigh ? '🚨' : '⚠️';
    if (btn && btn.dataset.alerted === 'true') {
      showToast('ℹ️ Already Alerted', `Alert already dispatched for ${zone.slice(0, 35)}.`, 'info');
      return;
    }
    if (btn) {
      btn.dataset.alerted = 'true';
      btn.textContent = '✓ Alerted';
      btn.style.background = isHigh ? 'var(--danger)' : 'var(--warning)';
      btn.style.color = '#fff';
      btn.style.borderColor = isHigh ? 'var(--danger)' : 'var(--warning)';
    }
    const trendMsg = trend === 'up' ? 'Risk INCREASING' : 'Risk DECREASING';
    showToast(`${icon} Zone Alert Dispatched`,
      `${zone.slice(0, 40)} — ${trendMsg}. Risk score: ${riskScore}/100. Patrol notified.`,
      isHigh ? 'danger' : 'warning');
  }

  // ─── Model Metrics ────────────────────────────────────────
  function renderModelMetrics() {
    const m = window.PredictionData.modelMetrics;
    const metrics = [
      { id: 'pred-accuracy', val: m.accuracy, suffix: '%' },
      { id: 'pred-mae', val: m.maeScore, suffix: '' },
      { id: 'pred-r2', val: m.r2Score, suffix: '' },
    ];
    metrics.forEach(met => {
      const el = document.getElementById(met.id);
      if (el) el.textContent = met.val + met.suffix;
    });

    const modelTypeEl = document.getElementById('pred-model-type');
    if (modelTypeEl) modelTypeEl.textContent = m.modelType;

    const lastTrainEl = document.getElementById('pred-last-trained');
    if (lastTrainEl) lastTrainEl.textContent = m.lastTrained;

    const dataPtsEl = document.getElementById('pred-data-points');
    if (dataPtsEl) dataPtsEl.textContent = m.dataPoints.toLocaleString('en-IN');
  }

  function init() {
    if (initialized) {
      forecastChart = null;
      weeklyChart   = null;
    }
    initialized = true;
    renderForecastChart();
    renderWeeklyChart();
    renderZonePredictions();
    renderWeatherFactors();
    renderModelMetrics();
  }

  return { init, toggleWeather, alertZone };
})();

window.PredictionsModule = PredictionsModule;
