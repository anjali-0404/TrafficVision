/* ============================================================
   search.js — License Plate Registry & Search Module
   TrafficVision AI
   ============================================================ */

const SearchModule = (() => {
  let currentPage = 1;
  const perPage   = 15;
  let filteredData = [];
  let sortKey = 'timestamp';
  let sortDir = -1;

  function getFiltered() {
    const query    = (document.getElementById('plate-search-input')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('plate-type-filter')?.value || '';
    const sevFilter  = document.getElementById('plate-sev-filter')?.value  || '';
    const statusFilter = document.getElementById('plate-status-filter')?.value || '';

    return window.TrafficData.VIOLATIONS_DB.filter(v => {
      const matchQ    = !query || v.plate.toLowerCase().includes(query) || v.location.toLowerCase().includes(query) || v.typeLabel.toLowerCase().includes(query);
      const matchType = !typeFilter || v.type === typeFilter;
      const matchSev  = !sevFilter  || v.severity === sevFilter;
      const matchStat = !statusFilter || v.status === statusFilter;
      return matchQ && matchType && matchSev && matchStat;
    }).sort((a, b) => {
      if (sortKey === 'timestamp') return sortDir * (b.timestamp - a.timestamp);
      if (sortKey === 'confidence') return sortDir * (b.confidence - a.confidence);
      if (sortKey === 'fineAmount') return sortDir * (b.fineAmount - a.fineAmount);
      return 0;
    });
  }

  function render() {
    filteredData = getFiltered();
    const total  = filteredData.length;
    const pages  = Math.ceil(total / perPage);
    currentPage  = Math.min(currentPage, pages || 1);

    const pageData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    // Update count tag
    const countEl = document.getElementById('plates-count');
    if (countEl) countEl.textContent = `${total} records`;

    // Render table
    const tbody = document.getElementById('plates-tbody');
    if (!tbody) return;

    if (pageData.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">
          No records found matching your filters.
        </td></tr>
      `;
    } else {
      tbody.innerHTML = pageData.map(v => `
        <tr class="${v.repeatOffender ? 'repeat-offender' : ''}" style="cursor:pointer"
            onclick="SearchModule.showVehicleHistory('${v.plate}')">
          <td><span class="plate-number">${v.plate}</span></td>
          <td>
            <span style="color:${v.typeColor}; font-size:1rem">${v.typeIcon}</span>
            <span style="margin-left:6px; font-size:0.8125rem">${v.typeLabel}</span>
          </td>
          <td style="color:var(--text-secondary); font-size:0.8125rem">
            ${v.location.length > 22 ? v.location.slice(0, 22) + '…' : v.location}
          </td>
          <td style="font-size:0.8125rem; color:var(--text-muted)">
            ${v.dateStr}<br><span class="font-mono text-xs">${v.timeStr}</span>
          </td>
          <td><span class="conf-score">${v.confidence}%</span></td>
          <td><span class="badge severity-${v.severity}">${v.severity.toUpperCase()}</span></td>
          <td>${getStatusBadge(v.status)}</td>
          <td style="font-weight:700;color:var(--text-primary)">₹${v.fineAmount}</td>
          <td>
            ${v.repeatOffender ? '<span class="badge badge-danger">⚠ Repeat</span>' : '<span class="badge badge-muted">First</span>'}
          </td>
        </tr>
      `).join('');
    }

    renderPagination(pages);
  }

  function getStatusBadge(status) {
    const map = {
      'Pending':      'badge-warning',
      'Challan Issued':'badge-primary',
      'Paid':         'badge-success',
      'Under Review': 'badge-purple',
    };
    return `<span class="badge ${map[status] || 'badge-muted'}">${status}</span>`;
  }

  function renderPagination(pages) {
    const pag = document.getElementById('plates-pagination');
    if (!pag) return;
    if (pages <= 1) { pag.innerHTML = ''; return; }

    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(pages, currentPage + 2);
    let html = '';

    if (currentPage > 1) html += `<button class="page-btn" onclick="SearchModule.goPage(${currentPage - 1})">‹</button>`;
    for (let i = start; i <= end; i++) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="SearchModule.goPage(${i})">${i}</button>`;
    }
    if (currentPage < pages) html += `<button class="page-btn" onclick="SearchModule.goPage(${currentPage + 1})">›</button>`;

    pag.innerHTML = html;
  }

  function goPage(p) {
    currentPage = p;
    render();
  }

  function showVehicleHistory(plate) {
    const records = window.TrafficData.VIOLATIONS_DB.filter(v => v.plate === plate).slice(0, 10);
    const modal   = document.getElementById('vehicle-modal');
    if (!modal) return;

    document.getElementById('vm-plate-title').textContent  = plate;
    document.getElementById('vm-total-violations').textContent = records.length;

    const listEl = document.getElementById('vm-violation-list');
    if (listEl) {
      listEl.innerHTML = records.map(v => `
        <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);align-items:center">
          <span style="font-size:1.2rem">${v.typeIcon}</span>
          <div style="flex:1">
            <div style="font-size:0.8125rem;font-weight:600;color:var(--text-primary)">${v.typeLabel}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${v.location} · ${v.dateStr}</div>
          </div>
          <div>
            <span class="badge severity-${v.severity}">${v.severity}</span>
            <div style="font-size:0.75rem;color:var(--text-muted);text-align:right;margin-top:3px">₹${v.fineAmount}</div>
          </div>
        </div>
      `).join('');
    }

    const totalFines = records.reduce((s, v) => s + v.fineAmount, 0);
    const fineEl = document.getElementById('vm-total-fines');
    if (fineEl) fineEl.textContent = `₹${totalFines.toLocaleString('en-IN')}`;

    modal.classList.remove('hidden');
  }

  function initFilters() {
    ['plate-search-input', 'plate-type-filter', 'plate-sev-filter', 'plate-status-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => { currentPage = 1; render(); });
    });

    // Populate type filter options
    const typeFilter = document.getElementById('plate-type-filter');
    if (typeFilter) {
      typeFilter.innerHTML = '<option value="">All Types</option>' +
        window.TrafficData.VIOLATION_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
    }
  }

  function init() {
    initFilters();
    render();
  }

  return { init, render, goPage, showVehicleHistory };
})();

window.SearchModule = SearchModule;
