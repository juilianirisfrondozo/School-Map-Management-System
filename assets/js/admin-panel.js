/* SchoolMap Admin Panel — admin-panel.js
   Legend-based pin system + cursor-centered scroll zoom
   Data persisted in localStorage */
(() => {
  // ---------- Constants ----------
  const KEYS = {
    floors:    "schoolmap_floors",
    locations: "schoolmap_locations",
    legends:   "schoolmap_legends",
    images:    "schoolmap_floor_images",
  };

  // Built-in SVG icons keyed by name
  const ICONS = {
    BookOpen:        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/></svg>',
    Briefcase:       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    FileText:        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
    Library:         '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>',
    UtensilsCrossed: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Z"/></svg>',
    Dumbbell:        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829Z"/></svg>',
    User:            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    ArrowUpDown:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>',
    DoorOpen:        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/></svg>',
    AlertTriangle:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    MapPin:          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    Toilet:          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h8v4H3z"/><path d="M7 7v2a4 4 0 0 0 8 0V7"/><path d="M11 13v7"/><path d="M8 20h6"/></svg>',
    Star:            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    Home:            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  };
  const ICON_NAMES = Object.keys(ICONS);

  const ICONS_SM = {
    plus:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    pencil:    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497Z"/><path d="m15 5 4 4"/></svg>',
    trash:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    search:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    upload:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/></svg>',
    arrowLeft: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    check:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    move:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l-3 3 3 3"/><path d="m9 5 3-3 3 3"/><path d="M15 19l-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>',
    link:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><path d="M8 12h8"/></svg>',
  };

  // ---------- Defaults ----------
  const DEFAULTS = {
    floors: [
      { id: 1, name: "Ground Floor", label: "1F" },
    ],
    // Legends replace "types" — each legend is a named category with color + icon
    legends: [
      { id: "lg-classroom", label: "Classrooms", color: "#3b82f6", icon: "BookOpen" },
      { id: "lg-office",    label: "Offices",    color: "#8b5cf6", icon: "Briefcase" },
      { id: "lg-restroom",  label: "Restrooms",  color: "#06b6d4", icon: "FileText" },
      { id: "lg-cafeteria", label: "Cafeteria",  color: "#f59e0b", icon: "UtensilsCrossed" },
      { id: "lg-library",   label: "Library",    color: "#10b981", icon: "Library" },
      { id: "lg-gym",       label: "Gymnasium",  color: "#ef4444", icon: "Dumbbell" },
      { id: "lg-admin",     label: "Admin",      color: "#ec4899", icon: "User" },
      { id: "lg-stairwell", label: "Stairwell",  color: "#6b7280", icon: "ArrowUpDown" },
      { id: "lg-entrance",  label: "Entrance",   color: "#22c55e", icon: "DoorOpen" },
      { id: "lg-emergency", label: "Emergency",  color: "#dc2626", icon: "AlertTriangle" },
    ],
    locations: [],
  };

  // ---------- State ----------
  const load = (k, fb, validator = () => true) => {
    try {
      const v = localStorage.getItem(k);
      if (!v) return fb;
      const parsed = JSON.parse(v);
      return validator(parsed) ? parsed : fb;
    } catch {
      return fb;
    }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  const LEGEND_ICON_BY_TYPE = {
    classroom: "BookOpen",
    office:    "Briefcase",
    restroom:  "FileText",
    cafeteria: "UtensilsCrossed",
    library:   "Library",
    gym:       "Dumbbell",
    admin:     "User",
    stairwell: "ArrowUpDown",
    entrance:  "DoorOpen",
    emergency: "AlertTriangle",
  };

  const normalizeLegend = (legend) => {
    if (!legend || typeof legend !== "object") return null;
    const id = String(legend.id || legend.type || "").trim();
    if (!id) return null;
    const label = String(legend.label || legend.type || legend.id || "Unknown");
    const color = typeof legend.color === "string" && legend.color ? legend.color : "#ff4d4d";
    const icon = String(legend.icon || LEGEND_ICON_BY_TYPE[legend.type] || LEGEND_ICON_BY_TYPE[legend.id] || "MapPin");
    return { id, label, color, icon };
  };

  const normalizeLegends = (value) => {
    if (!Array.isArray(value)) {
      if (value && typeof value === "object") {
        value = Object.values(value);
      } else {
        return [];
      }
    }
    const normalized = value.map(normalizeLegend).filter(Boolean);
    return normalized.length ? normalized : [];
  };

  const normalizeFloor = (floor) => {
    if (!floor || typeof floor !== "object") return null;
    const id = Number.isFinite(floor.id) ? floor.id : parseInt(floor.id, 10);
    if (!Number.isFinite(id)) return null;
    const name = String(floor.name || (id === 1 ? "Ground Floor" : `Floor ${id}`));
    const label = String(floor.label || (id === 1 ? "1F" : id === 2 ? "2F" : id === 3 ? "3F" : `${id}F`));
    return { id, name, label };
  };

  const normalizeFloors = (value) => {
    if (!Array.isArray(value)) {
      if (value && typeof value === "object") {
        value = Object.values(value);
      } else {
        return [];
      }
    }
    const normalized = value.map(normalizeFloor).filter(Boolean);
    return normalized.length ? normalized : [];
  };

  const normalizeLocation = (loc) => {
    if (!loc || typeof loc !== "object") return null;
    const id = String(loc.id || loc.name || loc.type || "").trim();
    if (!id) return null;
    const name = String(loc.name || loc.id || "Unnamed Pin");
    const floor = Number.isFinite(loc.floor) ? loc.floor : parseInt(loc.floor, 10) || 1;
    const legendId = String(loc.legendId || loc.type || loc.typeId || loc.category || "").trim();
    const x = Number.isFinite(loc.x) ? loc.x : parseFloat(loc.x) || 0;
    const y = Number.isFinite(loc.y) ? loc.y : parseFloat(loc.y) || 0;
    return { ...loc, id, name, floor, legendId, x, y };
  };

  const normalizeLocations = (value) => {
    if (!Array.isArray(value)) return [];
    return value.map(normalizeLocation).filter(Boolean);
  };

  const state = {
    floors:        normalizeFloors(load(KEYS.floors,    DEFAULTS.floors,    (value) => Array.isArray(value) && value.length > 0)),
    locations:     normalizeLocations(load(KEYS.locations, DEFAULTS.locations, (value) => Array.isArray(value))),
    legends:       normalizeLegends(load(KEYS.legends,   DEFAULTS.legends,   (value) => Array.isArray(value) && value.length > 0)),
    images:        load(KEYS.images,    {},                 (value) => value && typeof value === "object" && !Array.isArray(value)),
    activeFloor:   null,
    activeSection: "floors",
    selectedPinId: null,
    activeLegendId: null,
    mode:          "default", // default | add-pin
    search:        "",
    zoom:          1,
    showGrid:      false,
    showLegend:    true,
    showFloorPreview: false,
    edit:          null, // { kind: "floor"|"pin"|"legend", isNew, draft }
  };
  if (state.floors.length === 0) state.floors = DEFAULTS.floors.slice();
  if (state.legends.length === 0) state.legends = DEFAULTS.legends.slice();
  state.activeFloor = state.floors[0]?.id ?? null;
  state.activeLegendId = state.legends[0]?.id || null;

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  /** Find legend by id */
  const legendById   = (id) => state.legends.find(l => l.id === id);
  /** Colour for a pin — falls back gracefully */
  const colorForPin  = (loc) => legendById(loc.legendId)?.color || "#ff4d4d";
  /** SVG icon string for a pin */
  const iconForPin   = (loc) => {
    const lg = legendById(loc.legendId);
    return ICONS[lg?.icon || "MapPin"] || ICONS.MapPin;
  };
  /** Label of the legend a pin belongs to */
  const labelForPin  = (loc) => legendById(loc.legendId)?.label || "Unknown";
  const activeLegend  = () => legendById(state.activeLegendId) || state.legends[0] || null;
  const floorImageSrc   = (id) => id != null ? (state.images[id] || (id === 1 ? "../images/map-ground-floor.png" : "")) : "";

  const showToast = (msg) => {
    const el = $("#toast");
    el.innerHTML = `${ICONS_SM.check} ${msg}`;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("show"), 1800);
  };

  const updateFloorImagePreview = (src) => {
    const panel = $("#floorImagePreviewPanel");
    const img = $("#floorImagePreview");
    if (!panel || !img) return;
    if (src && state.showFloorPreview) {
      img.src = src;
      panel.hidden = false;
    } else {
      panel.hidden = true;
      img.removeAttribute("src");
    }
  };

  function wirePreviewPanel() {
    const panel = $("#floorImagePreviewPanel");
    if (!panel) return;
    panel.addEventListener("click", (evt) => {
      const btn = evt.target.closest("[data-action]");
      if (!btn) return;
      if (btn.dataset.action === "preview-close") {
        state.showFloorPreview = false;
        updateFloorImagePreview("");
      }
      if (btn.dataset.action === "preview-change-image") {
        state.showFloorPreview = true;
        const fileInput = document.querySelector("#fImageFile");
        if (fileInput) fileInput.click();
      }
    });
  }

  // ---------- Extra CSS (icon grid) ----------
  const extraCSS = document.createElement("style");
  extraCSS.textContent = `
    .icon-grid { display:grid; grid-template-columns: repeat(6, 1fr); gap:6px; padding:8px; background:#fdfbf7;
      border:2px dashed #2d2d2d; border-radius:14px 6px 16px 6px / 6px 16px 6px 14px; }
    .icon-cell { height:38px; display:grid; place-items:center; background:#fff; border:2px solid #2d2d2d;
      border-radius:12px 4px 14px 4px; box-shadow:2px 2px 0 0 #2d2d2d; transition:all .1s ease; }
    .icon-cell:hover { background:#fff9c4; transform:rotate(-3deg); }
    .icon-cell.active { background:#192A57; color:#fff; }
    @media (max-width:600px) { .icon-grid { grid-template-columns: repeat(4, 1fr); } }
  `;
  document.head.appendChild(extraCSS);

  // ---------- Top-bar buttons ----------
  $("#saveBtn").addEventListener("click", () => {
    save(KEYS.floors,    state.floors);
    save(KEYS.locations, state.locations);
    save(KEYS.legends,   state.legends);
    save(KEYS.images,    state.images);
    showToast("All changes saved");
  });

  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all data to defaults?")) return;
    state.floors     = JSON.parse(JSON.stringify(DEFAULTS.floors));
    state.locations  = JSON.parse(JSON.stringify(DEFAULTS.locations));
    state.legends    = JSON.parse(JSON.stringify(DEFAULTS.legends));
    state.images     = {};
    // Seed the 1F ground floor image if the file is local
    state.activeFloor  = state.floors[0]?.id ?? null;
    state.edit         = null;
    state.selectedPinId = null;
    renderAll();
    showToast("Reset to defaults");
  });

  $("#backBtn").addEventListener("click", () => {
    history.length > 1 ? history.back() : alert("This is the standalone admin panel.");
  });

  // Section tabs
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeSection = btn.dataset.section;
      if (state.activeSection !== "pins") state.mode = "default";
      state.edit = null;
      renderTabs();
      renderControlPanel();
    });
  });

  // Map toolbar — grid / legend overlay / zoom buttons
  $("#gridBtn").addEventListener("click",   () => { state.showGrid   = !state.showGrid;   renderMap(); });
  $("#legendBtn").addEventListener("click", () => { state.showLegend = !state.showLegend; renderMap(); });
  $("#zoomIn").addEventListener("click",    () => { state.zoom = clamp(+(state.zoom + 0.1).toFixed(2), 0.25, 4); renderMap(); });
  $("#zoomOut").addEventListener("click",   () => { state.zoom = clamp(+(state.zoom - 0.1).toFixed(2), 0.25, 4); renderMap(); });

  // ============================================================
  // ZOOM — smooth cursor-centred wheel zoom on the map stage
  // ============================================================
  const mapStage  = $("#mapStage");
  const mapCanvas = $("#mapCanvas");

  // We track a logical pan offset so cursor-centred zoom works
  // correctly without breaking percentage-based pin placement.
  // Pan offset is only used for CSS translate; pin x/y remain
  // in 0-100% coordinates relative to mapCanvas dimensions.
  let panX = 0, panY = 0;  // offset in pixels (stage space)
  let isDraggingPin = false;
  let isPanningMap = false;

  function applyTransform(animate) {
    mapCanvas.style.transition = animate ? "transform .18s ease" : "none";
    mapCanvas.style.transform  =
      `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${state.zoom})`;
    $("#zoomLabel").textContent = Math.round(state.zoom * 100) + "%";
  }

  mapStage.addEventListener("wheel", (e) => {
    e.preventDefault();

    const rect    = mapStage.getBoundingClientRect();
    // Cursor position relative to stage centre
    const cx = e.clientX - rect.left - rect.width  / 2;
    const cy = e.clientY - rect.top  - rect.height / 2;

    const delta     = -e.deltaY * 0.001;
    const oldZoom   = state.zoom;
    const newZoom   = clamp(+(oldZoom + delta).toFixed(3), 0.25, 4);
    const zoomRatio = newZoom / oldZoom;

    // Shift pan so the point under the cursor stays fixed
    panX = cx + (panX - cx) * zoomRatio;
    panY = cy + (panY - cy) * zoomRatio;

    state.zoom = newZoom;
    applyTransform(false);
  }, { passive: false });

  mapCanvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    if (e.target.closest(".pin")) return;
    if (state.mode === "add-pin") return;
    if (state.activeFloor == null) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const baseX  = panX;
    const baseY  = panY;
    let moved    = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > 3) {
        moved = true;
        isPanningMap = true;
        mapCanvas.classList.add("panning");
        document.body.style.cursor = "grabbing";
      }
      if (!moved) return;

      panX = baseX + dx / state.zoom;
      panY = baseY + dy / state.zoom;
      applyTransform(false);
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (isPanningMap) {
        mapCanvas.classList.remove("panning");
        document.body.style.cursor = "default";
      }
      setTimeout(() => { isPanningMap = false; }, 0);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // ============================================================
  // MAP CLICK — add a new pin
  // ============================================================
  mapCanvas.addEventListener("click", (e) => {
    if (e.target.closest(".pin")) return;
    if (isDraggingPin || isPanningMap) return;
    if (state.activeFloor == null) { showToast("Add a floor first"); return; }

    const rect = mapCanvas.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width)  * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top)  / rect.height) * 100, 0, 100);

    // If we are mid-edit of a pin and want to reposition by clicking
    if (state.edit && state.edit.kind === "pin" && !state.edit.isNew) {
      state.edit.draft.x = x;
      state.edit.draft.y = y;
      const p = state.locations.find(l => l.id === state.edit.draft.id);
      if (p) { p.x = x; p.y = y; }
      renderControlPanel(); renderMap();
      return;
    }

    if (state.activeSection !== "pins" || state.mode !== "add-pin") return;

    const currentLegend = activeLegend();
    if (!currentLegend) { showToast("Create a legend before placing pins"); return; }

    const loc = {
      id:       "loc-" + Date.now(),
      name:     "New Pin",
      legendId: currentLegend.id,
      floor:    state.activeFloor,
      x, y,
      description: "",
    };
    state.locations.push(loc);
    state.selectedPinId  = loc.id;
    state.activeSection  = "pins";
    state.edit = { kind: "pin", isNew: true, draft: { ...loc } };
    renderTabs(); renderControlPanel(); renderMap();
  });

  // ---------- Render helpers ----------
  function renderTabs() {
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("active", t.dataset.section === state.activeSection);
    });
  }

  function renderAll() {
    renderTabs();
    renderControlPanel();
    renderMap();
  }

  function renderControlPanel() {
    const body = $("#cpBody");
    if (state.edit) {
      body.innerHTML = renderForm();
      wireForm();
      if (state.edit.kind === "floor") {
        const previewSrc = state.edit.draft.image || floorImageSrc(state.edit.draft.id);
        updateFloorImagePreview(previewSrc);
      } else {
        updateFloorImagePreview("");
      }
    } else {
      updateFloorImagePreview("");
      if      (state.activeSection === "floors")  body.innerHTML = renderFloorsList();
      else if (state.activeSection === "pins")    body.innerHTML = renderPinsList();
      else                                        body.innerHTML = renderLegendsList();
      wireList();
    }
  }

  // ---------- LIST VIEWS ----------

  function renderFloorsList() {
    const items = state.floors.map(f => `
      <div class="row ${state.activeFloor === f.id ? "selected" : ""}" data-floor-id="${f.id}">
        <span class="row-tag">${escapeHtml(f.label || "1F")}</span>
        <div class="row-info">
          <div class="row-name">${escapeHtml(f.name || "Ground Floor")}</div>
          <div class="row-sub">${state.images[f.id] || f.id === 1 ? "Image attached" : "No image"}</div>
        </div>
        <button class="icon-btn" data-edit-floor="${f.id}" title="Edit">${ICONS_SM.pencil}</button>
        <button class="icon-btn danger" data-delete-floor="${f.id}" title="Delete">${ICONS_SM.trash}</button>
      </div>
    `).join("");
    return `
      <div class="section">
        <div class="section-head">
          <h2>Floors <span class="count">${state.floors.length}</span></h2>
          <button class="btn btn-primary" data-action="add-floor">${ICONS_SM.plus} Add Floor</button>
        </div>
        <div class="list">${items || `<p class="hint">No floors yet — add one to begin.</p>`}</div>
      </div>
    `;
  }

  function renderPinsList() {
    const q        = state.search.trim().toLowerCase();
    const filtered = q
      ? state.locations.filter(l =>
          l.name.toLowerCase().includes(q) ||
          labelForPin(l).toLowerCase().includes(q)
        )
      : state.locations;

    const items = filtered.map(loc => {
      const lg = legendById(loc.legendId);
      return `
        <div class="row ${state.selectedPinId === loc.id ? "selected" : ""}" data-pin-id="${loc.id}">
          <span class="row-swatch" style="background:${colorForPin(loc)}">${iconForPin(loc)}</span>
          <div class="row-info">
            <div class="row-name">${escapeHtml(loc.name)}</div>
            <div class="row-sub">${escapeHtml(lg?.label || "—")} · Floor ${loc.floor}</div>
          </div>
          <button class="icon-btn" data-edit-pin="${loc.id}">${ICONS_SM.pencil}</button>
          <button class="icon-btn danger" data-delete-pin="${loc.id}">${ICONS_SM.trash}</button>
        </div>
      `;
    }).join("");

    return `
      <div class="section">
        <div class="section-head">
          <h2>Pins <span class="count">${state.locations.length}</span></h2>
          <button class="btn btn-primary ${state.mode === "add-pin" ? "on" : ""}" data-action="toggle-add-pin">
            ${ICONS_SM.plus} ${state.mode === "add-pin" ? "Cancel Place Pins" : "Place Pins"}
          </button>
        </div>
        <div class="search">${ICONS_SM.search}<input type="text" id="pinSearch" placeholder="Search pins..." value="${escapeHtml(state.search)}"/></div>
        <div class="list scroll">${items || `<p class="hint">No pins found.</p>`}</div>
        <p class="hint">${state.mode === "add-pin" ? `${ICONS_SM.plus} Add pins by clicking on the map, or press the button to cancel.` : `${ICONS_SM.plus} Switch to Place Pins mode in the Pins tab to place pins.`}</p>
      </div>
    `;
  }

  function renderLegendsList() {
    const items = state.legends.map(lg => `
      <div class="row ${lg.id === state.activeLegendId ? "selected" : ""}" data-legend-id="${lg.id}">
        <span class="legend-color" style="background:${lg.color}"></span>
        <span class="row-swatch" style="background:#fff;color:#2d2d2d">${ICONS[lg.icon] || ICONS.MapPin}</span>
        <div class="row-info">
          <div class="row-name">${escapeHtml(lg.label)}</div>
          <div class="row-sub">${state.locations.filter(l => l.legendId === lg.id).length} pin(s)</div>
        </div>
        <button class="icon-btn" data-edit-legend="${lg.id}">${ICONS_SM.pencil}</button>
        <button class="icon-btn danger" data-delete-legend="${lg.id}">${ICONS_SM.trash}</button>
      </div>
    `).join("");

    return `
      <div class="section">
        <div class="section-head">
          <h2>Legends <span class="count">${state.legends.length}</span></h2>
          <button class="btn btn-primary" data-action="add-legend">${ICONS_SM.plus} Add Legend</button>
        </div>
        <div class="list">${items || `<p class="hint">No legends yet.</p>`}</div>
        <p class="hint">Click a legend row to make it the active category for new pins.</p>
      </div>
    `;
  }

  // ---------- FORM VIEW ----------

  function renderForm() {
    const e     = state.edit;
    const title = (e.isNew ? "Add " : "Edit ") + cap(e.kind);

    const head = `
      <div class="form-head">
        <button class="icon-btn" data-action="cancel" title="Back">${ICONS_SM.arrowLeft}</button>
        <h2>${title}</h2>
      </div>`;

    const foot = `
      <div class="form-foot">
        ${!e.isNew ? `<button class="btn btn-danger" data-action="delete">${ICONS_SM.trash} Delete</button>` : ""}
        <div class="spacer"></div>
        <button class="btn btn-ghost" data-action="cancel">Cancel</button>
        <button class="btn btn-primary" data-action="save">${ICONS_SM.check} Save</button>
      </div>`;

    let body = "";

    if (e.kind === "floor") {
      const previewImage = escapeHtml(e.draft.image || floorImageSrc(e.draft.id) || "");
      body = `
        <div class="field"><label>Floor Name</label><input type="text" id="fName" value="${escapeHtml(e.draft.name)}" placeholder="Ground Floor"/></div>
        <div class="field"><label>Level / Label</label><input type="text" id="fLabel" value="${escapeHtml(e.draft.label)}" placeholder="1F"/></div>
        <div class="field">
          <label>Floor Map Image</label>
          <button type="button" class="upload-box" data-action="pick-floor-image">${ICONS_SM.upload}<span>Click to upload PNG, JPG, or SVG</span></button>
          <input type="file" id="fImageFile" accept="image/png,image/jpeg,image/svg+xml" hidden/>
          <div class="hint" style="margin-top:10px;">Recommended size: 1080 × 1920 for best quality. Crop image before upload for cleaner map display.</div>
          ${previewImage ? `<img class="floor-preview" src="${previewImage}" alt="Floor preview"/>` : ""}
          ${previewImage ? `<button type="button" class="btn btn-primary" data-action="show-floor-preview" style="margin-top:12px;">Preview Image</button>` : ""}
        </div>
      `;
    } else if (e.kind === "pin") {
      // Build legend options
      const legendOptions = state.legends.map(lg =>
        `<option value="${lg.id}" ${lg.id === e.draft.legendId ? "selected" : ""}>${escapeHtml(lg.label)}</option>`
      ).join("");

      // Floor options
      const floorOptions = state.floors.map(f =>
        `<option value="${f.id}" ${f.id === e.draft.floor ? "selected" : ""}>${escapeHtml(f.name)}</option>`
      ).join("");

      // Current legend preview
      const curLg = legendById(e.draft.legendId);

      body = `
        <div class="map-hint">${ICONS_SM.move} Click on the map to place · drag the pin to move it</div>
        <div class="field"><label>Name</label><input type="text" id="pName" value="${escapeHtml(e.draft.name)}" placeholder="Room 101"/></div>
        <div class="field"><label>Description</label><textarea id="pDesc" rows="2">${escapeHtml(e.draft.description || "")}</textarea></div>
        <div class="grid-2">
          <div class="field"><label>Floor</label>
            <select id="pFloor">${floorOptions}</select>
          </div>
          <div class="field"><label>Legend Category</label>
            <select id="pLegend">${legendOptions}</select>
          </div>
        </div>
        <div class="field"><label>Position</label>
          <div class="icon-preview">
            <span class="row-swatch" style="background:${colorForPin(e.draft)}">${iconForPin(e.draft)}</span>
            <span class="muted" id="posLabel">x: ${e.draft.x.toFixed(1)}% · y: ${e.draft.y.toFixed(1)}%</span>
          </div>
        </div>
      `;

    } else if (e.kind === "legend") {
      body = `
        <div class="field"><label>Legend Name</label><input type="text" id="lLabel" value="${escapeHtml(e.draft.label)}" placeholder="Classrooms"/></div>
        <div class="field"><label>Color</label><input type="color" id="lColor" value="${e.draft.color}"/></div>
        <div class="field">
          <label>Icon — choose from library</label>
          <div class="icon-grid" id="iconGrid">
            ${ICON_NAMES.map(n => `<button type="button" class="icon-cell ${n === e.draft.icon ? "active" : ""}" data-icon="${n}" title="${n}">${ICONS[n]}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>…or upload an icon</label>
          <button type="button" class="upload-box small" data-action="pick-legend-icon">${ICONS_SM.upload}<span>Upload PNG or SVG</span></button>
          <input type="file" id="lIconFile" accept="image/png,image/svg+xml" hidden/>
        </div>
        <div class="field">
          <label>…or paste an image URL</label>
          <div class="url-row">${ICONS_SM.link}<input type="text" id="lIconUrl" value="${escapeHtml(e.draft.iconUrl || "")}" placeholder="https://..."/></div>
        </div>
        <div class="icon-preview" id="legendPreview">
          <span class="legend-color" style="background:${e.draft.color}"></span>
          ${e.draft.iconUrl
            ? `<img src="${e.draft.iconUrl}" style="width:24px;height:24px;object-fit:contain"/>`
            : (ICONS[e.draft.icon] || ICONS.MapPin)}
          <span class="muted">${escapeHtml(e.draft.label || "Preview")}</span>
        </div>
      `;
    }

    return `<div class="form-shell">${head}<div class="form-body">${body}</div>${foot}</div>`;
  }

  // ---------- WIRE INTERACTIONS ----------

  function wireList() {
    const body = $("#cpBody");

    // Floors — click row to activate, edit / delete
    body.querySelectorAll("[data-floor-id]").forEach(el => {
      el.addEventListener("click", () => { state.activeFloor = +el.dataset.floorId; renderAll(); });
    });
    body.querySelectorAll("[data-edit-floor]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const f = state.floors.find(x => x.id === +el.dataset.editFloor);
        if (!f) return;
        state.edit = { kind: "floor", isNew: false, draft: { ...f, image: state.images[f.id] || "" } };
        renderControlPanel();
      });
    });
    body.querySelectorAll("[data-delete-floor]").forEach(el => {
      el.addEventListener("click", (e) => { e.stopPropagation(); deleteFloor(+el.dataset.deleteFloor); });
    });

    // Pins
    body.querySelectorAll("[data-pin-id]").forEach(el => {
      el.addEventListener("click", () => {
        const p = state.locations.find(l => l.id === el.dataset.pinId);
        if (!p) return;
        state.selectedPinId = p.id;
        state.mode = "default";
        if (p.floor !== state.activeFloor) state.activeFloor = p.floor;
        renderAll();
      });
    });
    body.querySelectorAll("[data-edit-pin]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const p = state.locations.find(l => l.id === el.dataset.editPin);
        if (!p) return;
        state.mode = "default";
        state.edit = { kind: "pin", isNew: false, draft: { ...p } };
        renderControlPanel();
      });
    });
    body.querySelectorAll("[data-delete-pin]").forEach(el => {
      el.addEventListener("click", (e) => { e.stopPropagation(); state.mode = "default"; deletePin(el.dataset.deletePin); });
    });

    // Legends — click row to edit, edit / delete buttons
    body.querySelectorAll("[data-legend-id]").forEach(el => {
      el.addEventListener("click", () => {
        const lg = state.legends.find(x => x.id === el.dataset.legendId);
        if (!lg) return;
        state.mode = "default";
        state.activeLegendId = lg.id;
        renderControlPanel();
      });
    });
    body.querySelectorAll("[data-edit-legend]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const lg = state.legends.find(x => x.id === el.dataset.editLegend);
        if (!lg) return;
        state.mode = "default";
        state.edit = { kind: "legend", isNew: false, draft: { ...lg, iconUrl: "" } };
        renderControlPanel();
      });
    });
    body.querySelectorAll("[data-delete-legend]").forEach(el => {
      el.addEventListener("click", (e) => { e.stopPropagation(); deleteLegend(el.dataset.deleteLegend); });
    });

    // "Add" action buttons
    const addFloor = body.querySelector('[data-action="add-floor"]');
    if (addFloor) addFloor.addEventListener("click", () => {
      const id = Math.max(0, ...state.floors.map(f => f.id)) + 1;
      state.edit = { kind: "floor", isNew: true, draft: { id, name: "", label: "F" + id, image: "" } };
      renderControlPanel();
    });

    const togglePinMode = body.querySelector('[data-action="toggle-add-pin"]');
    if (togglePinMode) togglePinMode.addEventListener("click", () => {
      if (state.activeFloor == null) { showToast("Add a floor first"); return; }
      state.mode = state.mode === "add-pin" ? "default" : "add-pin";
      renderAll();
    });

    const legendSelect = body.querySelector('#activeLegendSelect');
    if (legendSelect) {
      legendSelect.addEventListener('change', (e) => {
        state.activeLegendId = e.target.value;
        renderControlPanel();
      });
    }

    const addLegend = body.querySelector('[data-action="add-legend"]');
    if (addLegend) addLegend.addEventListener("click", () => {
      state.edit = { kind: "legend", isNew: true, draft: { id: "lg-" + Date.now(), label: "", color: "#ff4d4d", icon: "MapPin", iconUrl: "" } };
      renderControlPanel();
    });

    // Pin search
    const search = body.querySelector("#pinSearch");
    if (search) search.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderControlPanel();
      const s2 = $("#pinSearch");
      if (s2) { s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }
    });
  }

  function wireForm() {
    const body = $("#cpBody");

    body.querySelector('[data-action="cancel"]')?.addEventListener("click", () => {
      if (state.edit?.kind === "pin" && state.edit.isNew) {
        state.locations = state.locations.filter(p => p.id !== state.edit.draft.id);
      }
      state.edit = null; renderAll();
    });

    body.querySelector('[data-action="save"]')?.addEventListener("click", saveEdit);

    body.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
      const e = state.edit;
      if      (e.kind === "floor")  deleteFloor(e.draft.id);
      else if (e.kind === "pin")    deletePin(e.draft.id);
      else if (e.kind === "legend") deleteLegend(e.draft.id);
    });

    // ---- Floor form ----
    if (state.edit.kind === "floor") {
      body.querySelector("#fName")?.addEventListener("input",  e => state.edit.draft.name  = e.target.value);
      body.querySelector("#fLabel")?.addEventListener("input", e => state.edit.draft.label = e.target.value);
      body.querySelector('[data-action="pick-floor-image"]')?.addEventListener("click", () =>
        body.querySelector("#fImageFile").click()
      );
      body.querySelector('[data-action="show-floor-preview"]')?.addEventListener("click", () => {
        state.showFloorPreview = true;
        const previewSrc = state.edit.draft.image || floorImageSrc(state.edit.draft.id);
        updateFloorImagePreview(previewSrc);
      });
      body.querySelector("#fImageFile")?.addEventListener("change", (ev) => {
        const file = ev.target.files?.[0]; if (!file) return;
        const r = new FileReader();
        r.onload = (e) => { state.edit.draft.image = String(e.target.result || ""); renderControlPanel(); };
        r.readAsDataURL(file);
      });
    }

    // ---- Pin form ----
    if (state.edit.kind === "pin") {
      body.querySelector("#pName")?.addEventListener("input",  e => state.edit.draft.name        = e.target.value);
      body.querySelector("#pDesc")?.addEventListener("input",  e => state.edit.draft.description = e.target.value);
      body.querySelector("#pFloor")?.addEventListener("change", e => { state.edit.draft.floor    = +e.target.value; });
      body.querySelector("#pLegend")?.addEventListener("change", e => {
        state.edit.draft.legendId = e.target.value;
        renderControlPanel();   // refresh icon/color preview
        renderMap();            // update pin preview style immediately
      });
    }

    // ---- Legend form ----
    if (state.edit.kind === "legend") {
      body.querySelector("#lLabel")?.addEventListener("input", e => { state.edit.draft.label = e.target.value; refreshLegendPreview(); });
      body.querySelector("#lColor")?.addEventListener("input", e => { state.edit.draft.color = e.target.value; refreshLegendPreview(); });

      body.querySelectorAll("#iconGrid .icon-cell").forEach(cell => {
        cell.addEventListener("click", () => {
          state.edit.draft.icon    = cell.dataset.icon;
          state.edit.draft.iconUrl = "";
          renderControlPanel();
        });
      });

      body.querySelector('[data-action="pick-legend-icon"]')?.addEventListener("click", () =>
        body.querySelector("#lIconFile").click()
      );
      body.querySelector("#lIconFile")?.addEventListener("change", (ev) => {
        const file = ev.target.files?.[0]; if (!file) return;
        const r = new FileReader();
        r.onload = (e) => { state.edit.draft.iconUrl = String(e.target.result || ""); renderControlPanel(); };
        r.readAsDataURL(file);
      });
      body.querySelector("#lIconUrl")?.addEventListener("input", e => {
        state.edit.draft.iconUrl = e.target.value; refreshLegendPreview();
      });
    }
  }

  function refreshLegendPreview() {
    const e    = state.edit;
    const prev = $("#legendPreview");
    if (!prev) return;
    prev.innerHTML = `
      <span class="legend-color" style="background:${e.draft.color}"></span>
      ${e.draft.iconUrl
        ? `<img src="${e.draft.iconUrl}" style="width:24px;height:24px;object-fit:contain"/>`
        : (ICONS[e.draft.icon] || ICONS.MapPin)}
      <span class="muted">${escapeHtml(e.draft.label || "Preview")}</span>
    `;
  }

  // ---------- SAVE EDIT ----------
  function saveEdit() {
    const e = state.edit;

    if (e.kind === "floor") {
      const d     = e.draft;
      const draft = {
        id:    d.id,
        name:  (d.name  || "").trim() || "Untitled",
        label: (d.label || "").trim() || "F" + d.id,
      };
      if (e.isNew) state.floors.push(draft);
      else         state.floors = state.floors.map(f => f.id === draft.id ? draft : f);

      if (d.image) state.images[d.id] = d.image;
      else if (d.id === 1) state.images[d.id] = "../images/map-ground-floor.png";
      else         delete state.images[d.id];

      if (state.activeFloor == null) state.activeFloor = draft.id;
      showToast(e.isNew ? "Floor added" : "Floor updated");

    } else if (e.kind === "pin") {
      const d     = e.draft;
      const draft = {
        ...d,
        name: (d.name || "").trim() || "Untitled",
        x:    clamp(d.x, 0, 100),
        y:    clamp(d.y, 0, 100),
      };
      const exists = state.locations.find(p => p.id === draft.id);
      if (e.isNew && !exists) state.locations.push(draft);
      else                    state.locations = state.locations.map(p => p.id === draft.id ? draft : p);
      state.selectedPinId = draft.id;
      showToast(e.isNew ? "Pin added" : "Pin updated");

    } else if (e.kind === "legend") {
      const d     = e.draft;
      const draft = {
        id:    d.id,
        label: (d.label || "").trim() || "Untitled",
        color: d.color,
        icon:  (d.icon || "").trim() || "MapPin",
      };
      const exists = state.legends.find(l => l.id === draft.id);
      if (e.isNew && !exists) state.legends.push(draft);
      else                    state.legends = state.legends.map(l => l.id === draft.id ? draft : l);
      showToast(e.isNew ? "Legend added" : "Legend updated");
    }

    state.edit = null; renderAll();
  }

  // ---------- DELETE ----------
  function deleteFloor(id) {
    if (state.floors.length <= 1) { showToast("Keep at least one floor"); return; }
    if (!confirm("Delete this floor and its pins?")) return;
    state.floors    = state.floors.filter(f => f.id !== id);
    state.locations = state.locations.filter(l => l.floor !== id);
    delete state.images[id];
    if (state.activeFloor === id) state.activeFloor = state.floors[0]?.id ?? null;
    state.edit = null;
    renderAll();
    showToast("Floor deleted");
  }

  function deletePin(id) {
    if (!confirm("Delete this pin?")) return;
    state.locations = state.locations.filter(l => l.id !== id);
    if (state.selectedPinId === id) state.selectedPinId = null;
    state.edit = null;
    renderAll();
    showToast("Pin deleted");
  }

  function deleteLegend(id) {
    const usedBy = state.locations.filter(l => l.legendId === id).length;
    if (usedBy > 0 && !confirm(`This legend is used by ${usedBy} pin(s). Delete anyway?`)) return;
    else if (usedBy === 0 && !confirm("Delete this legend?")) return;
    state.legends = state.legends.filter(l => l.id !== id);
    if (state.activeLegendId === id) {
      state.activeLegendId = state.legends[0]?.id || null;
    }
    // Pins that referenced this legend lose their legendId
    state.locations = state.locations.map(l =>
      l.legendId === id ? { ...l, legendId: state.legends[0]?.id || "" } : l
    );
    state.edit = null;
    renderAll();
    showToast("Legend deleted");
  }

  // ---------- MAP RENDER ----------
  function renderMap() {
    const f = state.floors.find(x => x.id === state.activeFloor) || state.floors[0] || DEFAULTS.floors[0];
    $("#floorTag").textContent  = f.label || "1F";
    $("#floorName").textContent = f.name  || "Ground Floor";

    // Floor switch chips
    const sw = $("#floorSwitch");
    sw.innerHTML = state.floors.map(fl =>
      `<button class="floor-chip ${fl.id === state.activeFloor ? "active" : ""}" data-fl="${fl.id}">${escapeHtml(fl.label)}</button>`
    ).join("");
    sw.querySelectorAll("[data-fl]").forEach(b => b.addEventListener("click", () => {
      state.activeFloor = +b.dataset.fl; renderAll();
    }));

    // Apply zoom/pan transform (keeps existing pan offset)
    applyTransform(true);
    mapCanvas.classList.toggle("add-pin-mode", state.mode === "add-pin" && state.activeSection === "pins");
    mapCanvas.classList.toggle("grid-on", state.showGrid);

    // Grid & legend toggle visual state
    $("#gridBtn").classList.toggle("on",   state.showGrid);
    $("#legendBtn").classList.toggle("on", state.showLegend);
    $("#gridOverlay").hidden = !state.showGrid;

    // Floor image — use Map-ground-floor.png for floor id 1 if no custom image uploaded
    const img   = $("#floorImage");
    const empty = $("#emptyState");
    let src = state.activeFloor != null ? floorImageSrc(state.activeFloor) : "";

    if (src) {
      img.src    = src;
      img.hidden = false;
      empty.hidden = true;
    } else {
      img.removeAttribute("src");
      img.hidden   = true;
      empty.hidden = false;
    }

    // Pins
    const layer = $("#pinsLayer");
    layer.innerHTML = "";
    if (state.activeFloor != null) {
      state.locations
        .filter(l => l.floor === state.activeFloor)
        .forEach(loc => renderPin(loc, layer));
    }

    // Legend overlay panel
    const lo = $("#legendOverlay");
    if (state.showLegend) {
      lo.hidden  = false;
      lo.innerHTML = `<div class="lo-title">Legend</div>` +
        state.legends.map(lg =>
          `<div class="lo-row"><span class="lo-color" style="background:${lg.color}"></span><span>${escapeHtml(lg.label)}</span></div>`
        ).join("");
    } else {
      lo.hidden    = true;
      lo.innerHTML = "";
    }
  }

  function renderPin(loc, layer) {
    const pinData = state.edit?.draft?.id === loc.id ? state.edit.draft : loc;
    const el  = document.createElement("div");
    const sel = state.selectedPinId === loc.id || state.edit?.draft?.id === loc.id;
    el.className = "pin draggable" + (sel ? " selected" : "");
    el.style.left       = pinData.x + "%";
    el.style.top        = pinData.y + "%";
    el.style.background = colorForPin(pinData);
    el.innerHTML        = iconForPin(pinData);
    el.dataset.id       = loc.id;

    // Drag
    el.addEventListener("mousedown", (e) => startDrag(e, loc));

    // Double-click → open edit form
    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      state.activeSection = "pins";
      state.edit = { kind: "pin", isNew: false, draft: { ...loc } };
      renderTabs(); renderControlPanel();
    });

    // Tooltip on hover
    el.addEventListener("mouseenter", () => {
      const r  = el.getBoundingClientRect();
      const s  = $("#mapStage").getBoundingClientRect();
      const tt = $("#pinTooltip");
      tt.innerHTML = `<strong>${escapeHtml(loc.name)}</strong><span>${escapeHtml(labelForPin(loc))}</span>`;
      tt.style.left = (r.left + r.width / 2 - s.left) + "px";
      tt.style.top  = (r.top - s.top) + "px";
      tt.classList.add("show");
    });
    el.addEventListener("mouseleave", () => $("#pinTooltip").classList.remove("show"));

    layer.appendChild(el);
  }

  // ---------- PIN DRAG ----------
  function startDrag(e, loc) {
    e.stopPropagation();
    const canvas = $("#mapCanvas");
    const rect   = canvas.getBoundingClientRect();
    let moved    = false;
    let dragging = false;
    const sx = e.clientX, sy = e.clientY;

    const onClickSuppress = (evt) => {
      if (dragging) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    };

    const onMove = (ev) => {
      if (!dragging && (Math.abs(ev.clientX - sx) > 3 || Math.abs(ev.clientY - sy) > 3)) {
        dragging = true;
        isDraggingPin = true;
        const pinEl = document.querySelector(`.pin[data-id="${loc.id}"]`);
        if (pinEl) pinEl.classList.add("dragging");
      }

      if (!dragging) return;
      document.body.style.cursor = "grabbing";

      const r = canvas.getBoundingClientRect();
      const x = clamp(((ev.clientX - r.left)  / r.width)  * 100, 0, 100);
      const y = clamp(((ev.clientY - r.top)   / r.height) * 100, 0, 100);

      const p = state.locations.find(l => l.id === loc.id);
      if (p) { p.x = x; p.y = y; }

      if (state.edit?.draft?.id === loc.id) {
        state.edit.draft.x = x;
        state.edit.draft.y = y;
        const lbl = $("#posLabel");
        if (lbl) lbl.textContent = `x: ${x.toFixed(1)}% · y: ${y.toFixed(1)}%`;
      }

      renderMap();
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.removeEventListener("click", onClickSuppress, true);
      const pinEl = document.querySelector(`.pin[data-id="${loc.id}"]`);
      if (pinEl) pinEl.classList.remove("dragging");
      document.body.style.cursor = "default";
      if (!dragging) { state.selectedPinId = loc.id; renderAll(); }
      setTimeout(() => { isDraggingPin = false; }, 0);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    document.addEventListener("click", onClickSuppress, true);
  }

  // ---------- Utility ----------
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  // ---------- Init ----------
  wirePreviewPanel();
  renderAll();
})();