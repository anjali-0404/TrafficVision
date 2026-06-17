/* ============================================================
   appui.js — Topbar UI: Notifications, Settings, Profile
   TrafficVision AI
   ============================================================ */

const AppUI = (() => {

  // ─── Recent Notifications ────────────────────────────────
  const NOTIF_TEMPLATES = [
    { icon: '🚨', title: 'High-Risk Alert',       msg: 'SG Highway — 3 helmet violations in 2 min.', time: '2m ago',  type: 'danger'  },
    { icon: '🚔', title: 'Patrol Deployed',        msg: 'Unit #7 dispatched to Drive-in Road.',       time: '8m ago',  type: 'success' },
    { icon: '🚦', title: 'Red-Light Spike',        msg: 'Naranpura Circle — 12 RLJ in last hour.',    time: '15m ago', type: 'warning' },
    { icon: '📋', title: 'Challan Batch Issued',   msg: '28 challans dispatched to registered owners.',time: '22m ago', type: 'info'    },
    { icon: '🪖', title: 'Helmet Violation Surge', msg: 'Thaltej Crossroads risk score now 91/100.',   time: '31m ago', type: 'danger'  },
    { icon: '🛑', title: 'Stop-Line Violation',    msg: 'GJ01ZZ9901 — Stop line crossed at Prahlad.', time: '45m ago', type: 'warning' },
    { icon: '✅', title: 'AI Model Retrained',     msg: 'YOLOv11 accuracy updated to 94.9% mAP@0.5.', time: '1h ago',  type: 'success' },
    { icon: '🏍️', title: 'Triple Riding Detected', msg: 'GJ05TT3389 — 3 riders, Satellite Road.',     time: '1h 20m', type: 'danger'  },
  ];

  let notifOpen    = false;
  let settingsOpen = false;
  let profileOpen  = false;

  // ─── Notification Dropdown ───────────────────────────────
  function buildNotifPanel() {
    const existing = document.getElementById('notif-dropdown');
    if (existing) return existing;

    const panel = document.createElement('div');
    panel.id = 'notif-dropdown';
    panel.style.cssText = `
      position:fixed;
      top:56px;
      right:90px;
      width:340px;
      max-height:460px;
      overflow-y:auto;
      background:var(--bg-surface);
      border:1px solid var(--border);
      border-radius:var(--radius-lg);
      box-shadow:0 20px 60px rgba(0,0,0,0.5);
      z-index:9999;
      display:none;
    `;

    const typeColors = { danger:'var(--danger)', success:'var(--accent)', warning:'var(--warning)', info:'var(--primary)' };

    panel.innerHTML = `
      <div style="padding:14px 16px 10px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:700;font-size:0.875rem;color:var(--text-primary)">🔔 Notifications</span>
        <button onclick="AppUI.clearNotifications()" style="font-size:0.7rem;color:var(--primary);cursor:pointer;font-weight:600;padding:2px 8px;border:1px solid var(--primary);border-radius:4px">Clear All</button>
      </div>
      ${NOTIF_TEMPLATES.map((n, i) => `
        <div class="notif-item" id="notif-item-${i}" onclick="AppUI.dismissNotif(${i})" style="
          display:flex;gap:10px;padding:10px 14px;
          border-bottom:1px solid var(--border);
          cursor:pointer;
          transition:background 0.15s;
          align-items:flex-start;
        " onmouseover="this.style.background='var(--bg-surface-2)'" onmouseout="this.style.background=''">
          <div style="font-size:1.1rem;margin-top:2px">${n.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.8125rem;font-weight:600;color:${typeColors[n.type]}">${n.title}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.msg}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">${n.time}</div>
          </div>
          <div style="font-size:0.7rem;color:var(--text-muted);cursor:pointer" title="Dismiss">✕</div>
        </div>
      `).join('')}
      <div style="padding:10px 14px;text-align:center">
        <button onclick="AppUI.viewAllAlerts()" style="font-size:0.75rem;color:var(--primary);cursor:pointer;font-weight:600">View All Alerts →</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (notifOpen && !panel.contains(e.target) && e.target.id !== 'btn-notifications') {
        closeNotifications();
      }
    });

    return panel;
  }

  function toggleNotifications() {
    const panel = buildNotifPanel();
    notifOpen = !notifOpen;
    panel.style.display = notifOpen ? 'block' : 'none';
    if (notifOpen) {
      // Reset badge
      const badge = document.getElementById('notif-badge');
      if (badge) badge.textContent = '0';
    }
  }

  function closeNotifications() {
    const panel = document.getElementById('notif-dropdown');
    if (panel) panel.style.display = 'none';
    notifOpen = false;
  }

  function dismissNotif(idx) {
    const item = document.getElementById(`notif-item-${idx}`);
    if (item) {
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.2s';
      setTimeout(() => item.remove(), 200);
    }
  }

  function clearNotifications() {
    const panel = document.getElementById('notif-dropdown');
    if (panel) {
      panel.querySelectorAll('.notif-item').forEach(item => item.remove());
      showToast('🔕 Cleared', 'All notifications have been dismissed.', 'info');
    }
  }

  function viewAllAlerts() {
    closeNotifications();
    Router.navigate('enforcement');
    showToast('🚨 Alert Center', 'Showing Enforcement Intelligence — AI Patrol Recommendations.', 'info');
  }

  // ─── Settings Modal ──────────────────────────────────────
  function buildSettingsModal() {
    const existing = document.getElementById('settings-modal-overlay');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = 'settings-modal-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:520px">
        <div class="modal-header">
          <div class="modal-title">⚙️ System Settings</div>
          <button class="modal-close" data-close-modal="settings-modal-overlay">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">

          <div style="display:flex;flex-direction:column;gap:var(--space-4)">

            <div style="padding:var(--space-4);background:var(--bg-surface-2);border-radius:var(--radius-md);border:1px solid var(--border)">
              <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-3)">Display</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                <span style="font-size:0.875rem;color:var(--text-primary)">Live Feed Refresh Rate</span>
                <select id="setting-refresh" style="background:var(--bg-surface-3);border:1px solid var(--border);color:var(--text-primary);padding:4px 8px;border-radius:6px;font-size:0.8125rem">
                  <option value="3">Fast (3–5s)</option>
                  <option value="7" selected>Normal (5–7s)</option>
                  <option value="15">Slow (10–15s)</option>
                </select>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:0.875rem;color:var(--text-primary)">Show Toast Notifications</span>
                <input type="checkbox" id="setting-toasts" checked style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer">
              </div>
            </div>

            <div style="padding:var(--space-4);background:var(--bg-surface-2);border-radius:var(--radius-md);border:1px solid var(--border)">
              <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-3)">AI Pipeline</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)">
                <span style="font-size:0.875rem;color:var(--text-primary)">Detection Confidence Threshold</span>
                <div style="display:flex;align-items:center;gap:8px">
                  <input type="range" min="50" max="99" value="85" id="setting-conf-slider" style="width:90px;accent-color:var(--primary)">
                  <span id="setting-conf-val" style="font-family:var(--font-mono);font-size:0.8125rem;color:var(--primary);min-width:28px">85%</span>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:0.875rem;color:var(--text-primary)">Auto-Generate Evidence Packages</span>
                <input type="checkbox" id="setting-auto-ev" checked style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer">
              </div>
            </div>

            <div style="padding:var(--space-4);background:var(--bg-surface-2);border-radius:var(--radius-md);border:1px solid var(--border)">
              <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:var(--space-3)">System Info</div>
              <div style="display:flex;justify-content:space-between;font-size:0.8125rem;margin-bottom:8px">
                <span style="color:var(--text-muted)">Platform Version</span>
                <span style="color:var(--text-primary);font-family:var(--font-mono)">TrafficVision AI v2.0</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:0.8125rem;margin-bottom:8px">
                <span style="color:var(--text-muted)">AI Engine</span>
                <span class="badge badge-success">YOLOv11 + DeepSORT</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:0.8125rem">
                <span style="color:var(--text-muted)">System Status</span>
                <span class="badge badge-success">● All Systems Online</span>
              </div>
            </div>

          </div>

          <div style="display:flex;gap:var(--space-3);margin-top:var(--space-5)">
            <button class="btn btn-primary" style="flex:1" onclick="AppUI.saveSettings()">Save Settings</button>
            <button class="btn btn-secondary" data-close-modal="settings-modal-overlay">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Wire the conf slider live update
    const slider = overlay.querySelector('#setting-conf-slider');
    const valEl  = overlay.querySelector('#setting-conf-val');
    if (slider && valEl) {
      slider.addEventListener('input', () => { valEl.textContent = slider.value + '%'; });
    }

    // Close on overlay click
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });

    // Wire close buttons via app.js handler
    overlay.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => overlay.classList.add('hidden'));
    });

    return overlay;
  }

  function openSettings() {
    const modal = buildSettingsModal();
    modal.classList.remove('hidden');
  }

  function saveSettings() {
    const conf    = document.getElementById('setting-conf-slider')?.value || 85;
    const toasts  = document.getElementById('setting-toasts')?.checked;
    const autoEv  = document.getElementById('setting-auto-ev')?.checked;
    const refresh = document.getElementById('setting-refresh')?.value;
    document.getElementById('settings-modal-overlay')?.classList.add('hidden');
    showToast('✅ Settings Saved', `Confidence: ${conf}% · Toasts: ${toasts ? 'ON' : 'OFF'} · Auto-Evidence: ${autoEv ? 'ON' : 'OFF'}`, 'success');
  }

  // ─── Profile Modal ───────────────────────────────────────
  function buildProfileModal() {
    const existing = document.getElementById('profile-modal-overlay');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = 'profile-modal-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:420px">
        <div class="modal-header">
          <div class="modal-title">👮 Inspector Profile</div>
          <button class="modal-close" data-close-modal="profile-modal-overlay">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="text-align:center;margin-bottom:var(--space-5)">
            <div style="width:64px;height:64px;background:linear-gradient(135deg,var(--primary),var(--purple));border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:var(--space-3)">IA</div>
            <div style="font-size:1.0625rem;font-weight:700;color:var(--text-primary)">Inspector Admin</div>
            <div style="font-size:0.8125rem;color:var(--text-muted)">Senior Traffic Enforcement Officer</div>
            <div style="margin-top:6px"><span class="badge badge-success">● On Duty</span></div>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--space-3)">
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:0.8125rem;color:var(--text-muted)">Badge Number</span>
              <span style="font-size:0.8125rem;font-family:var(--font-mono);color:var(--cyan)">AHD-TRF-0042</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:0.8125rem;color:var(--text-muted)">Department</span>
              <span style="font-size:0.8125rem;color:var(--text-primary)">Traffic Control Division</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:0.8125rem;color:var(--text-muted)">Access Level</span>
              <span class="badge badge-danger">Administrator</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:0.8125rem;color:var(--text-muted)">Shift</span>
              <span style="font-size:0.8125rem;color:var(--text-primary)">06:00 – 18:00 (Day)</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0">
              <span style="font-size:0.8125rem;color:var(--text-muted)">Challans Issued Today</span>
              <span style="font-size:0.8125rem;font-weight:700;color:var(--primary)">14</span>
            </div>
          </div>

          <div style="display:flex;gap:var(--space-3);margin-top:var(--space-5)">
            <button class="btn btn-secondary" style="flex:1" onclick="AppUI.changeShift()">Change Shift</button>
            <button class="btn btn-danger" style="flex:1" onclick="AppUI.logout()">Sign Out</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
    overlay.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => overlay.classList.add('hidden'));
    });

    return overlay;
  }

  function openProfile() {
    const modal = buildProfileModal();
    modal.classList.remove('hidden');
  }

  function changeShift() {
    document.getElementById('profile-modal-overlay')?.classList.add('hidden');
    showToast('🔄 Shift Changed', 'Night shift (18:00–06:00) activated. Supervisor notified.', 'info');
  }

  function logout() {
    document.getElementById('profile-modal-overlay')?.classList.add('hidden');
    showToast('👋 Signed Out', 'Inspector Admin has been signed out. Session closed.', 'info');
  }

  // ─── Public API ──────────────────────────────────────────
  return {
    toggleNotifications,
    closeNotifications,
    clearNotifications,
    dismissNotif,
    viewAllAlerts,
    openSettings,
    saveSettings,
    openProfile,
    changeShift,
    logout,
  };
})();

window.AppUI = AppUI;
