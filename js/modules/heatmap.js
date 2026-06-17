/* ============================================================
   heatmap.js — GIS Hotspot Intelligence (Leaflet.js)
   TrafficVision AI
   ============================================================ */

const HeatmapModule = (() => {
  let map         = null;
  let heatLayer   = null;
  let markerLayer = null;
  let initialized = false;

  const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  function init() {
    if (initialized) {
      if (map) map.invalidateSize();
      return;
    }

    const el = document.getElementById('map-container');
    if (!el || typeof L === 'undefined') return;

    // Initialize Leaflet
    map = L.map('map-container', {
      center: window.HotspotData.center,
      zoom:   window.HotspotData.zoom,
      zoomControl: true,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18, subdomains: 'abcd' }).addTo(map);

    // Heatmap layer
    if (typeof L.heatLayer !== 'undefined') {
      heatLayer = L.heatLayer(window.HotspotData.points, {
        radius: 30,
        blur: 22,
        maxZoom: 17,
        gradient: { 0.1: '#0000ff', 0.25: '#00ffff', 0.5: '#00ff00', 0.75: '#ffff00', 1.0: '#ff0000' },
      }).addTo(map);
    }

    // Zone markers
    addZoneMarkers();

    // Violation point markers (sample)
    addViolationMarkers();

    initialized = true;

    // Update map after short delay (layout may not be ready)
    setTimeout(() => map && map.invalidateSize(), 300);

    // Violation type filter
    initFilters();

    // Time slider
    initTimeSlider();
  }

  function addZoneMarkers() {
    if (markerLayer) { markerLayer.clearLayers(); }
    markerLayer = L.layerGroup().addTo(map);

    window.HotspotData.zones.forEach(zone => {
      const color = zone.riskScore >= 90 ? '#ef4444' : zone.riskScore >= 80 ? '#f59e0b' : '#3b82f6';
      const size  = zone.riskScore >= 90 ? 20 : 16;

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:${size}px; height:${size}px;
            background:${color}; border-radius:50%;
            border:2px solid #fff;
            box-shadow:0 0 12px ${color}88;
            display:flex; align-items:center; justify-content:center;
            font-size:9px; font-weight:700; color:#fff;
          ">${zone.rank}</div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon }).addTo(markerLayer);

      marker.bindPopup(`
        <div class="map-popup-title">#${zone.rank} ${zone.name}</div>
        <div class="map-popup-row"><span class="map-popup-key">Violations</span><span class="map-popup-val">${zone.violations}</span></div>
        <div class="map-popup-row"><span class="map-popup-key">Risk Score</span><span class="map-popup-val" style="color:${color}">${zone.riskScore}/100</span></div>
        <div class="map-popup-row"><span class="map-popup-key">Patrol Status</span><span class="map-popup-val">${zone.patrol ? '🚔 Active' : '❌ None'}</span></div>
      `);
    });
  }

  function addViolationMarkers() {
    const sample = window.TrafficData.VIOLATIONS_DB.slice(0, 40);
    sample.forEach(v => {
      const circle = L.circleMarker([v.lat, v.lng], {
        radius:      4,
        fillColor:   v.typeColor,
        color:       v.typeColor,
        weight:      1,
        opacity:     0.8,
        fillOpacity: 0.7,
      }).addTo(markerLayer);

      circle.bindPopup(`
        <div class="map-popup-title">${v.typeIcon} ${v.typeLabel}</div>
        <div class="map-popup-row"><span class="map-popup-key">Plate</span><span class="map-popup-val" style="color:var(--cyan); font-family:monospace">${v.plate}</span></div>
        <div class="map-popup-row"><span class="map-popup-key">Time</span><span class="map-popup-val">${v.timeStr}</span></div>
        <div class="map-popup-row"><span class="map-popup-key">Confidence</span><span class="map-popup-val">${v.confidence}%</span></div>
      `);
    });
  }

  function initFilters() {
    document.querySelectorAll('.map-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.map-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const type = pill.dataset.type;
        updateHeatmap(type);
      });
    });
  }

  function updateHeatmap(typeFilter) {
    if (!heatLayer || typeof L.heatLayer === 'undefined') return;
    let points = window.HotspotData.points;
    if (typeFilter && typeFilter !== 'all') {
      // Simulate per-type filtering by reducing intensity
      points = points.map(p => [p[0], p[1], p[2] * (0.4 + Math.random() * 0.6)]);
    }
    heatLayer.setLatLngs(points);
  }

  function initTimeSlider() {
    const slider = document.getElementById('time-range-slider');
    const label  = document.getElementById('time-range-label');
    if (!slider || !label) return;

    slider.addEventListener('input', () => {
      const h = parseInt(slider.value);
      label.textContent = h === 24 ? 'All Day' : `${h < 10 ? '0' + h : h}:00`;
      // Adjust heatmap intensity to simulate time filtering
      if (heatLayer) {
        const factor = getHourFactor(h);
        const pts = window.HotspotData.points.map(p => [p[0], p[1], p[2] * factor]);
        heatLayer.setLatLngs(pts);
      }
    });
  }

  function getHourFactor(h) {
    // Simulate peak hours
    if (h === 24) return 1.0;
    const peaks = { 8: 0.9, 9: 1.0, 17: 0.95, 18: 1.0, 19: 0.9 };
    return peaks[h] || (h >= 22 || h <= 5 ? 0.3 : 0.5 + Math.random() * 0.3);
  }

  // Top zones panel
  function renderZonesPanel() {
    const container = document.getElementById('top-zones-panel');
    if (!container) return;

    container.innerHTML = window.HotspotData.zones.map((z, i) => `
      <div class="zone-card" onclick="HeatmapModule.flyTo(${z.lat}, ${z.lng})">
        <div class="zone-rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : 'other'}">${z.rank}</div>
        <div class="zone-info">
          <div class="zone-name">${z.name}</div>
          <div class="zone-meta">${z.violations} violations · Risk: ${z.riskScore}/100</div>
          <div class="progress-bar" style="margin-top:4px">
            <div class="progress-fill red" style="width:${z.riskScore}%"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function flyTo(lat, lng) {
    if (map) map.flyTo([lat, lng], 15, { duration: 1.5 });
  }

  return { init, flyTo, renderZonesPanel };
})();

window.HeatmapModule = HeatmapModule;
