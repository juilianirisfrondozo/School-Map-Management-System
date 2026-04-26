/* ============================================================
   SchoolMap — admin.js
   Full admin panel: locations, legends, users, logs, dashboard
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Auth guard ─────────────────────────────────────────── */
  // For demo: allow access with hardcoded admin OR via Auth
  const user = Auth.current;
  const isHardcodedAdmin = true; // Set to false to enforce DB auth
  if (!isHardcodedAdmin) Auth.requireAdmin();

  /* ── Init navbar ─────────────────────────────────────────── */
  initNavbar({ activePage: 'admin' });

  /* ── Display admin name ──────────────────────────────────── */
  const nameEl = document.getElementById('admin-name');
  if (nameEl && user) nameEl.textContent = user.first_name || user.username || 'Admin';

  /* ── Date display ────────────────────────────────────────── */
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-PH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ── State ───────────────────────────────────────────────── */
  let locations = [];
  let legends   = [];
  let users     = [];
  let logs      = [];
  let deleteCallback = null;

  /* ══ Tab Navigation ════════════════════════════════════════ */
  const tabNavLinks = document.querySelectorAll('[data-tab-nav]');
  const tabPanels   = document.querySelectorAll('.tab-panel');

  function switchTab(name) {
    tabNavLinks.forEach(l => l.classList.toggle('active', l.dataset.tabNav === name));
    tabPanels.forEach(p => {
      const id = p.id.replace('tab-', '');
      p.classList.toggle('active', id === name);
    });
    if (name === 'dashboard') loadDashboard();
    if (name === 'locations') loadLocations();
    if (name === 'legends')   loadLegends();
    if (name === 'users')     loadUsers();
    if (name === 'logs')      loadLogs();
  }

  tabNavLinks.forEach(link => {
    link.addEventListener('click', () => switchTab(link.dataset.tabNav));
  });

  /* ══ Dashboard ═════════════════════════════════════════════ */
  async function loadDashboard() {
    const [locRes, legRes, usrRes, logRes] = await Promise.all([
      Api.getLocations(), Api.getLegends(), Api.getUsers(), Api.getLogs()
    ]);

    const locs = locRes.success ? locRes.locations || [] : [];
    const legs = legRes.success ? legRes.legends   || [] : [];
    const usrs = usrRes.success ? usrRes.users     || [] : [];
    const lgrs = logRes.success ? logRes.logs      || [] : [];

    setText('stat-locations', locs.length);
    setText('stat-users',     usrs.length);
    setText('stat-legends',   legs.length);
    setText('stat-logs',      lgrs.length);

    const recentLocs = document.getElementById('recent-locations-list');
    if (recentLocs) {
      const recent = locs.slice(-5).reverse();
      recentLocs.innerHTML = recent.length
        ? recent.map(l => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--clr-border);">
              <span style="font-size:18px;">${getCategoryIcon(l.category)}</span>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--clr-text);">${l.name}</div>
                <div style="font-size:11px;color:var(--clr-text-muted);">${l.category} · ${l.floor || '—'} Floor</div>
              </div>
            </div>
          `).join('')
        : '<p>No locations yet.</p>';
    }

    const recentUsers = document.getElementById('recent-users-list');
    if (recentUsers) {
      const recent = usrs.slice(-5).reverse();
      recentUsers.innerHTML = recent.length
        ? recent.map(u => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--clr-border);">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--clr-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">
                ${(u.first_name || u.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--clr-text);">${u.first_name || ''} ${u.last_name || ''}</div>
                <div style="font-size:11px;color:var(--clr-text-muted);">${u.email} · ${u.role}</div>
              </div>
            </div>
          `).join('')
        : '<p>No users yet.</p>';
    }
  }

  /* ══ Locations ═════════════════════════════════════════════ */
  async function loadLocations() {
    const res = await Api.getLocations();
    locations = res.success ? res.locations || [] : [];
    renderLocationsTable();
  }

  function renderLocationsTable() {
    const tbody    = document.getElementById('locations-tbody');
    const query    = (document.getElementById('loc-search')?.value || '').toLowerCase();
    const floor    = document.getElementById('loc-floor-filter')?.value || '';
    const category = document.getElementById('loc-cat-filter')?.value || '';

    let filtered = locations.filter(loc =>
      (!query    || loc.name.toLowerCase().includes(query) || (loc.room_number||'').toLowerCase().includes(query)) &&
      (!floor    || loc.floor === floor) &&
      (!category || loc.category === category)
    );

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--clr-text-muted);">No locations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((loc, i) => `
      <tr>
        <td style="color:var(--clr-text-muted);font-size:12px;">${i + 1}</td>
        <td><strong>${loc.name}</strong></td>
        <td>
          <span class="badge badge-success" style="background:${getLegendColor(loc.category, legends)}22;color:${getLegendColor(loc.category, legends)};">
            ${getCategoryIcon(loc.category)} ${loc.category || '—'}
          </span>
        </td>
        <td>${loc.floor ? loc.floor + ' Floor' : '—'}</td>
        <td>${loc.room_number || '—'}</td>
        <td>${loc.capacity || '—'}</td>
        <td><code style="font-size:12px;">${loc.pin_x ?? '—'}</code></td>
        <td><code style="font-size:12px;">${loc.pin_y ?? '—'}</code></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-outline btn-sm edit-loc-btn" data-id="${loc.id}">Edit</button>
            <button class="btn btn-danger btn-sm del-loc-btn" data-id="${loc.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-loc-btn').forEach(btn => {
      btn.addEventListener('click', () => openLocationModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.del-loc-btn').forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(
        'Are you sure you want to delete this location? All map pins for it will be removed.',
        async () => {
          const res = await Api.deleteLocation(parseInt(btn.dataset.id));
          if (res.success) { Toast.success('Location deleted.'); loadLocations(); }
          else Toast.error(res.message || 'Failed to delete.');
        }
      ));
    });
  }

  document.getElementById('loc-search')?.addEventListener('input', renderLocationsTable);
  document.getElementById('loc-floor-filter')?.addEventListener('change', renderLocationsTable);
  document.getElementById('loc-cat-filter')?.addEventListener('change', renderLocationsTable);

  // Add location button
  document.getElementById('add-location-btn')?.addEventListener('click', () => openLocationModal(null));

  function openLocationModal(id) {
    const loc = id ? locations.find(l => l.id === id) : null;
    document.getElementById('location-modal-title').textContent = loc ? 'Edit Location' : 'Add Location';
    document.getElementById('loc-id').value         = loc ? loc.id : '';
    document.getElementById('loc-name').value        = loc ? loc.name : '';
    document.getElementById('loc-room-number').value = loc ? loc.room_number || '' : '';
    document.getElementById('loc-category').value    = loc ? loc.category || '' : '';
    document.getElementById('loc-floor').value       = loc ? loc.floor || '' : '';
    document.getElementById('loc-capacity').value    = loc ? loc.capacity || '' : '';
    document.getElementById('loc-pin-x').value       = loc ? loc.pin_x ?? '' : '';
    document.getElementById('loc-pin-y').value       = loc ? loc.pin_y ?? '' : '';
    document.getElementById('loc-description').value = loc ? loc.description || '' : '';
    Form.clearErrors(document.getElementById('location-form'));
    Modal.open('location-modal');
  }

  document.getElementById('location-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('location-save-btn');
    const id  = document.getElementById('loc-id').value;
    const data = {
      name:        document.getElementById('loc-name').value.trim(),
      room_number: document.getElementById('loc-room-number').value.trim(),
      category:    document.getElementById('loc-category').value,
      floor:       document.getElementById('loc-floor').value,
      capacity:    document.getElementById('loc-capacity').value || null,
      pin_x:       parseFloat(document.getElementById('loc-pin-x').value) || null,
      pin_y:       parseFloat(document.getElementById('loc-pin-y').value) || null,
      description: document.getElementById('loc-description').value.trim(),
    };

    if (!data.name) { Form.setError('loc-name', 'Name is required.'); return; }
    if (!data.category) { Form.setError('loc-category', 'Category is required.'); return; }
    if (!data.floor) { Form.setError('loc-floor', 'Floor is required.'); return; }

    Form.setLoading(btn, true);
    const res = id ? await Api.updateLocation(id, data) : await Api.addLocation(data);
    Form.setLoading(btn, false);

    if (res.success) {
      Toast.success(id ? 'Location updated!' : 'Location added!');
      Modal.close('location-modal');
      loadLocations();
    } else {
      Toast.error(res.message || 'Failed to save location.');
    }
  });

  /* ══ Legends ═══════════════════════════════════════════════ */
  async function loadLegends() {
    const res = await Api.getLegends();
    legends = res.success ? res.legends || [] : [];
    renderLegendsTable();
  }

  function renderLegendsTable() {
    const tbody = document.getElementById('legends-tbody');
    if (!legends.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--clr-text-muted);">No legends yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = legends.map((lg, i) => `
      <tr>
        <td style="color:var(--clr-text-muted);font-size:12px;">${i + 1}</td>
        <td><strong>${lg.name}</strong></td>
        <td>
          <span class="color-swatch" style="background:${lg.color};"></span>
          <code style="font-size:12px;">${lg.color}</code>
        </td>
        <td style="font-size:20px;">${lg.icon || '—'}</td>
        <td style="color:var(--clr-text-muted);font-size:13px;">${lg.description || '—'}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-outline btn-sm edit-leg-btn" data-id="${lg.id}">Edit</button>
            <button class="btn btn-danger btn-sm del-leg-btn" data-id="${lg.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-leg-btn').forEach(btn => {
      btn.addEventListener('click', () => openLegendModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.del-leg-btn').forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(
        'Delete this legend category? Locations using it will not be affected.',
        async () => {
          const res = await Api.deleteLegend(parseInt(btn.dataset.id));
          if (res.success) { Toast.success('Legend deleted.'); loadLegends(); }
          else Toast.error(res.message || 'Failed to delete.');
        }
      ));
    });
  }

  document.getElementById('add-legend-btn')?.addEventListener('click', () => openLegendModal(null));

  function openLegendModal(id) {
    const lg = id ? legends.find(l => l.id === id) : null;
    document.getElementById('legend-modal-title').textContent = lg ? 'Edit Legend' : 'Add Legend';
    document.getElementById('leg-id').value          = lg ? lg.id : '';
    document.getElementById('leg-name').value         = lg ? lg.name : '';
    document.getElementById('leg-color').value        = lg ? lg.color : '#1a6b3c';
    document.getElementById('leg-icon').value         = lg ? lg.icon || '' : '';
    document.getElementById('leg-description').value  = lg ? lg.description || '' : '';
    Form.clearErrors(document.getElementById('legend-form'));
    Modal.open('legend-modal');
  }

  document.getElementById('legend-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('legend-save-btn');
    const id  = document.getElementById('leg-id').value;
    const data = {
      name:        document.getElementById('leg-name').value.trim(),
      color:       document.getElementById('leg-color').value,
      icon:        document.getElementById('leg-icon').value.trim(),
      description: document.getElementById('leg-description').value.trim(),
    };
    if (!data.name) { Form.setError('leg-name', 'Name is required.'); return; }
    Form.setLoading(btn, true);
    const res = id ? await Api.updateLegend(id, data) : await Api.addLegend(data);
    Form.setLoading(btn, false);
    if (res.success) {
      Toast.success(id ? 'Legend updated!' : 'Legend added!');
      Modal.close('legend-modal');
      loadLegends();
    } else {
      Toast.error(res.message || 'Failed to save legend.');
    }
  });

  /* ══ Users ═════════════════════════════════════════════════ */
  async function loadUsers() {
    const res = await Api.getUsers();
    users = res.success ? res.users || [] : [];
    renderUsersTable();
  }

  function renderUsersTable() {
    const tbody  = document.getElementById('users-tbody');
    const query  = (document.getElementById('user-search')?.value || '').toLowerCase();
    const role   = document.getElementById('user-role-filter')?.value || '';

    let filtered = users.filter(u =>
      (!query || (u.first_name||'').toLowerCase().includes(query) ||
        (u.last_name||'').toLowerCase().includes(query) ||
        (u.username||'').toLowerCase().includes(query) ||
        (u.email||'').toLowerCase().includes(query)) &&
      (!role || u.role === role)
    );

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--clr-text-muted);">No users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((u, i) => {
      const statusClass = { active: 'badge-success', inactive: 'badge-warning', banned: 'badge-danger' }[u.status] || 'badge-info';
      return `
        <tr>
          <td style="color:var(--clr-text-muted);font-size:12px;">${i + 1}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--clr-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">
                ${(u.first_name || u.username || 'U')[0].toUpperCase()}
              </div>
              ${u.first_name || ''} ${u.last_name || ''}
            </div>
          </td>
          <td><code style="font-size:12px;">@${u.username}</code></td>
          <td style="font-size:13px;">${u.email}</td>
          <td><span class="badge badge-info">${u.role}</span></td>
          <td style="font-size:12px;color:var(--clr-text-muted);">${formatDate(u.created_at)}</td>
          <td><span class="badge ${statusClass}">${u.status || 'active'}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn btn-outline btn-sm edit-user-btn" data-id="${u.id}">Edit</button>
              <button class="btn btn-danger btn-sm del-user-btn" data-id="${u.id}" ${u.role==='admin'?'disabled title="Cannot delete admin"':''}>Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-user-btn').forEach(btn => {
      btn.addEventListener('click', () => openUserModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.del-user-btn').forEach(btn => {
      if (btn.disabled) return;
      btn.addEventListener('click', () => confirmDelete(
        'Are you sure you want to delete this user account? This cannot be undone.',
        async () => {
          const res = await Api.deleteUser(parseInt(btn.dataset.id));
          if (res.success) { Toast.success('User deleted.'); loadUsers(); }
          else Toast.error(res.message || 'Failed to delete user.');
        }
      ));
    });
  }

  document.getElementById('user-search')?.addEventListener('input', renderUsersTable);
  document.getElementById('user-role-filter')?.addEventListener('change', renderUsersTable);

  function openUserModal(id) {
    const u = users.find(u => u.id === id);
    if (!u) return;
    document.getElementById('edit-user-id').value   = u.id;
    document.getElementById('edit-first-name').value = u.first_name || '';
    document.getElementById('edit-last-name').value  = u.last_name  || '';
    document.getElementById('edit-email').value      = u.email;
    document.getElementById('edit-role').value       = u.role;
    document.getElementById('edit-status').value     = u.status || 'active';
    Modal.open('user-modal');
  }

  document.getElementById('user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('edit-user-id').value;
    const data = {
      first_name: document.getElementById('edit-first-name').value.trim(),
      last_name:  document.getElementById('edit-last-name').value.trim(),
      email:      document.getElementById('edit-email').value.trim(),
      role:       document.getElementById('edit-role').value,
      status:     document.getElementById('edit-status').value,
    };
    const res = await Api.updateUser(id, data);
    if (res.success) {
      Toast.success('User updated!');
      Modal.close('user-modal');
      loadUsers();
    } else {
      Toast.error(res.message || 'Failed to update user.');
    }
  });

  /* ══ Logs ══════════════════════════════════════════════════ */
  async function loadLogs() {
    const res = await Api.getLogs();
    logs = res.success ? res.logs || [] : [];
    const tbody = document.getElementById('logs-tbody');
    if (!logs.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--clr-text-muted);">No activity logs yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = logs.slice().reverse().map(log => `
      <tr>
        <td style="font-size:12px;color:var(--clr-text-muted);white-space:nowrap;">${formatDate(log.created_at, true)}</td>
        <td style="font-size:13px;">${log.username || '—'}</td>
        <td><span class="badge badge-info">${log.action}</span></td>
        <td style="font-size:13px;color:var(--clr-text-muted);">${log.details || '—'}</td>
      </tr>
    `).join('');
  }

  document.getElementById('refresh-logs-btn')?.addEventListener('click', loadLogs);

  /* ══ Confirm Delete Modal ══════════════════════════════════ */
  function confirmDelete(message, callback) {
    document.getElementById('confirm-msg').textContent = message;
    deleteCallback = callback;
    Modal.open('confirm-modal');
  }

  document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
    Modal.close('confirm-modal');
    if (deleteCallback) {
      await deleteCallback();
      deleteCallback = null;
    }
  });

  /* ══ Helpers ═══════════════════════════════════════════════ */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function formatDate(str, withTime = false) {
    if (!str) return '—';
    try {
      const d = new Date(str);
      return withTime
        ? d.toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })
        : d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return str; }
  }

  function getLegendColor(category, legsArr) {
    if (!category) return '#888';
    const leg = (legsArr || []).find(l => l.name.toLowerCase() === category.toLowerCase());
    if (leg) return leg.color;
    const defaults = {
      classroom: '#1a6b3c', office: '#2f80ed', laboratory: '#f5a623',
      restroom: '#9b59b6', emergency: '#e03e3e', library: '#e67e22',
      canteen: '#e74c3c', gym: '#1abc9c', chapel: '#8e44ad',
    };
    return defaults[category.toLowerCase()] || '#555';
  }

  function getCategoryIcon(cat) {
    const icons = {
      classroom: '🏫', office: '🏢', laboratory: '🔬',
      restroom: '🚻', emergency: '🚨', library: '📚',
      canteen: '🍽️', gym: '🏋️', chapel: '⛪',
    };
    return icons[(cat || '').toLowerCase()] || '📍';
  }

  /* ══ Initial Load ══════════════════════════════════════════ */
  switchTab('dashboard');
});