// Admin panel — per-service Template Manager (real file uploads).
// Each page using this script must set a global TEMPLATE_MANAGER_SLUG
// (inline <script> in the HTML, BEFORE this file loads) telling it which
// service it's managing.
// Requires: admin-data.js, template-store.js, admin-common.js loaded first.
//
// This renders with the SAME classes/markup as the Templates tab inside
// a service's Manage view on the Services page (admin-services.js):
// admin-detail-panel-header, admin-occasion-tabs/admin-occasion-tab,
// admin-dropzone, admin-detail-template-grid/admin-detail-template-item.
// Both pages also read/write the exact same shared store
// (HQ_TEMPLATE_FILES_KEY, via admin-common.js), so a design uploaded,
// renamed, re-tagged, or deleted on either page shows up identically on
// the other — same look, same data.
//
// Uploaded files are read as base64 data URLs (FileReader) and kept in
// memory only (see admin-common.js) — no server and no localStorage
// needed for this demo, but that also means uploaded designs are lost
// on a full page refresh.

document.addEventListener('DOMContentLoaded', function () {
  if (typeof TEMPLATE_MANAGER_SLUG === 'undefined' || typeof ADMIN_SAMPLE_SERVICES === 'undefined') return;

  const service = ADMIN_SAMPLE_SERVICES.find(function (s) { return s.slug === TEMPLATE_MANAGER_SLUG; });

  const titleEl = document.getElementById('tmServiceTitle');
  const countEl = document.getElementById('tmTemplateCount');
  const gridEl = document.getElementById('tmTemplateGrid');
  const emptyEl = document.getElementById('tmEmptyState');
  const tabsEl = document.getElementById('tmOccasionTabs');
  const dropZone = document.getElementById('tmDropZone');
  const fileInput = document.getElementById('tmFileInput');
  const browseBtn = document.getElementById('tmBrowseBtn');
  const uploadBtn = document.getElementById('tmUploadBtn');
  const reviewModal = document.getElementById('tmReviewModal');
  const reviewList = document.getElementById('tmReviewList');
  const reviewSave = document.getElementById('tmReviewSave');
  const reviewCancel = document.getElementById('tmReviewCancel');
  const manageOccasionsBtn = document.getElementById('tmManageOccasionsBtn');

  if (!service) {
    if (titleEl) titleEl.textContent = 'Service not found';
    if (gridEl) gridEl.innerHTML = '';
    if (emptyEl) { emptyEl.style.display = ''; emptyEl.textContent = 'No service matches "' + TEMPLATE_MANAGER_SLUG + '". Check the slug or add the service first on the Services page.'; }
    if (manageOccasionsBtn) manageOccasionsBtn.style.display = 'none';
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (dropZone) dropZone.style.display = 'none';
    return;
  }

  if (titleEl) titleEl.textContent = service.name;
  document.title = service.name + ' Templates — Admin — Happy Queen\'s Crafty House';

  let currentOccasion = 'all';
  let pendingFiles = []; // staged in the review modal before saving

  function escapeAttr(str) {
    return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  // Always read this service's occasion list fresh (not cached), since
  // it can change via the Occasions modal below and both pages must
  // reflect an edit immediately.
  function serviceOccasions() {
    return hqServiceOccasions(service);
  }

  function getTemplates() {
    const map = hqLoadTemplateFiles();
    return Array.isArray(map[service.slug]) ? map[service.slug] : [];
  }

  function saveTemplates(list) {
    const map = hqLoadTemplateFiles();
    map[service.slug] = list;
    hqSaveTemplateFiles(map);

    // Backward-compat only: mirror new design names into the older
    // simple name-list in template-store.js, in case anything else on
    // the site (e.g. the customer-facing store) still reads from it.
    if (typeof getServiceTemplates === 'function' && typeof addTemplateToService === 'function') {
      const existingNames = getServiceTemplates(service.slug);
      list.forEach(function (t) {
        if (existingNames.indexOf(t.name) === -1) addTemplateToService(service.slug, t.name);
      });
      if (typeof hqPersistTemplates === 'function') hqPersistTemplates();
    }
  }

  /* --- Occasion tabs + template grid (same markup as the Services page) */
  function renderTabs() {
    if (!tabsEl) return;
    const all = ['all'].concat(serviceOccasions());
    tabsEl.innerHTML = all.map(function (o) {
      const label = o === 'all' ? 'All' : o;
      const active = o === currentOccasion ? ' is-active' : '';
      return '<button type="button" class="admin-occasion-tab' + active + '" data-occasion-tab="' + escapeAttr(o) + '">' + label + '</button>';
    }).join('');
    tabsEl.querySelectorAll('[data-occasion-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentOccasion = btn.dataset.occasionTab;
        renderTabs();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const all = getTemplates();
    const filtered = currentOccasion === 'all' ? all : all.filter(function (t) { return t.occasion === currentOccasion; });

    if (countEl) countEl.textContent = all.length + ' template' + (all.length === 1 ? '' : 's');

    if (filtered.length === 0) {
      gridEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.style.display = '';
        emptyEl.textContent = all.length === 0 ? 'No templates uploaded yet' : 'No designs match this occasion.';
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    gridEl.innerHTML = filtered.map(function (t) {
      const preview = t.type === 'application/pdf'
        ? '<div class="admin-detail-template-thumb admin-detail-template-thumb-pdf"><i class="fa-solid fa-file-pdf"></i></div>'
        : '<div class="admin-detail-template-thumb" style="background-image:url(\'' + t.dataUrl + '\');"></div>';
      return '<div class="admin-detail-template-item">' +
        preview +
        '<div class="admin-detail-template-body">' +
          '<span class="admin-detail-template-occasion">' + t.occasion + '</span>' +
          '<h4 class="admin-detail-template-name">' + t.name + '</h4>' +
        '</div>' +
        '<div class="admin-detail-template-footer">' +
          '<button type="button" class="admin-row-action" data-template-delete="' + t.id + '" aria-label="Delete ' + t.name + '" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>';
    }).join('');

    gridEl.querySelectorAll('[data-template-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('Delete this design?')) return;
        const id = btn.dataset.templateDelete;
        saveTemplates(getTemplates().filter(function (t) { return t.id !== id; }));
        renderGrid();
      });
    });
  }

  /* ---------------------------------------------------------------------
     Upload flow: pick/drop files -> review (name + occasion per file) ->
     read as base64 -> save to the shared store.
  --------------------------------------------------------------------- */
  function humanFileName(file) {
    return file.name.replace(/\.[^/.]+$/, '');
  }

  function openReviewModal(files) {
    const validFiles = [];
    const rejected = [];
    files.forEach(function (file) {
      if (HQ_TEMPLATE_ACCEPTED_TYPES.indexOf(file.type) === -1) { rejected.push(file.name + ' — unsupported type'); return; }
      if (file.size > HQ_TEMPLATE_MAX_SIZE) { rejected.push(file.name + ' — over 20MB'); return; }
      validFiles.push(file);
    });
    if (rejected.length) alert('Some files were skipped:\n' + rejected.join('\n'));
    if (!validFiles.length) return;

    const occasions = serviceOccasions();
    const defaultOccasion = hqDefaultOccasionFor(occasions);
    pendingFiles = validFiles.map(function (file) {
      return { file: file, name: humanFileName(file), occasion: defaultOccasion };
    });
    renderReviewList();
    if (reviewModal) reviewModal.classList.add('is-open');
  }

  function renderReviewList() {
    if (!reviewList) return;
    const occasions = serviceOccasions();
    reviewList.innerHTML = pendingFiles.map(function (p, i) {
      const occasionOptions = occasions.map(function (o) {
        return '<option value="' + escapeAttr(o) + '"' + (o === p.occasion ? ' selected' : '') + '>' + o + '</option>';
      }).join('');
      return '<div class="tm-review-row">' +
        '<span class="tm-review-filename" title="' + escapeAttr(p.file.name) + '">' + p.file.name + '</span>' +
        '<input type="text" class="admin-modal-input" data-review-name="' + i + '" value="' + escapeAttr(p.name) + '" placeholder="Design name">' +
        '<select class="admin-modal-input" data-review-occasion="' + i + '">' + occasionOptions + '</select>' +
      '</div>';
    }).join('');

    reviewList.querySelectorAll('[data-review-name]').forEach(function (input) {
      input.addEventListener('input', function () { pendingFiles[Number(input.dataset.reviewName)].name = input.value; });
    });
    reviewList.querySelectorAll('[data-review-occasion]').forEach(function (select) {
      select.addEventListener('change', function () { pendingFiles[Number(select.dataset.reviewOccasion)].occasion = select.value; });
    });
  }

  function closeReviewModal() {
    if (reviewModal) reviewModal.classList.remove('is-open');
    pendingFiles = [];
    if (fileInput) fileInput.value = '';
  }

  function saveReviewedFiles() {
    if (!pendingFiles.length) { closeReviewModal(); return; }
    Promise.all(pendingFiles.map(function (p) {
      return hqReadFileAsDataUrl(p.file).then(function (dataUrl) {
        return {
          id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          name: p.name.trim() || humanFileName(p.file),
          occasion: p.occasion,
          type: p.file.type,
          dataUrl: dataUrl,
          uploadedAt: new Date().toISOString()
        };
      });
    })).then(function (newTemplates) {
      saveTemplates(getTemplates().concat(newTemplates));
      closeReviewModal();
      renderGrid();
    }).catch(function (e) {
      console.error('Could not read one or more files:', e);
      alert('Something went wrong reading a file. Try a smaller file or removing an old design first.');
    });
  }

  if (browseBtn && fileInput) browseBtn.addEventListener('click', function () { fileInput.click(); });
  if (uploadBtn && fileInput) uploadBtn.addEventListener('click', function () { fileInput.click(); });
  if (fileInput) fileInput.addEventListener('change', function () { openReviewModal(Array.from(fileInput.files)); });

  if (dropZone) {
    ['dragenter', 'dragover'].forEach(function (evt) {
      dropZone.addEventListener(evt, function (e) { e.preventDefault(); dropZone.classList.add('is-dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropZone.addEventListener(evt, function (e) { e.preventDefault(); dropZone.classList.remove('is-dragover'); });
    });
    dropZone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) openReviewModal(Array.from(e.dataTransfer.files));
    });
  }

  if (reviewSave) reviewSave.addEventListener('click', saveReviewedFiles);
  if (reviewCancel) reviewCancel.addEventListener('click', closeReviewModal);
  if (reviewModal) reviewModal.addEventListener('click', function (e) { if (e.target === reviewModal) closeReviewModal(); });

  /* ---------------------------------------------------------------------
     Manage Occasions modal — identical behavior to the one on the
     Services page: edits service.occasions directly and persists it, so
     the same list shows up in both places right away.
  --------------------------------------------------------------------- */
  const occasionsModal = document.getElementById('tmOccasionsModal');
  const occasionsChipList = document.getElementById('tmOccasionsChipList');
  const occasionsModalSub = document.getElementById('tmOccasionsModalSub');
  const newOccasionInput = document.getElementById('tmNewOccasionInput');

  function renderOccasionsChips() {
    if (!occasionsChipList) return;
    const occasions = service.occasions || [];
    occasionsChipList.innerHTML = occasions.length
      ? occasions.map(function (occasion, i) {
          return '<span class="admin-chip">' + occasion +
            '<button type="button" class="admin-chip-remove" data-occasion-remove="' + i + '" aria-label="Remove ' + occasion + '">&times;</button>' +
          '</span>';
        }).join('')
      : '<span class="admin-chip-empty">Using the default set (Wedding, Birthday, Debut, Christening, Anniversary, Corporate, Other). Add one below to switch to a custom list.</span>';

    occasionsChipList.querySelectorAll('[data-occasion-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = Number(btn.dataset.occasionRemove);
        service.occasions.splice(i, 1);
        hqPersistServices();
        renderOccasionsChips();
        renderTabs();
        renderGrid();
      });
    });
  }

  function openOccasionsModal() {
    if (!service.occasions) service.occasions = [];
    if (occasionsModalSub) occasionsModalSub.textContent = 'What kind of designs customers can choose from for "' + service.name + '", e.g. Wedding, Birthday, Corporate.';
    if (newOccasionInput) newOccasionInput.value = '';
    renderOccasionsChips();
    if (occasionsModal) occasionsModal.classList.add('is-open');
  }

  function closeOccasionsModal() {
    if (occasionsModal) occasionsModal.classList.remove('is-open');
  }

  if (manageOccasionsBtn) manageOccasionsBtn.addEventListener('click', openOccasionsModal);

  if (occasionsModal) {
    const closeBtn = document.getElementById('tmOccasionsModalClose');
    const doneBtn = document.getElementById('tmOccasionsModalDone');
    if (closeBtn) closeBtn.addEventListener('click', closeOccasionsModal);
    if (doneBtn) doneBtn.addEventListener('click', closeOccasionsModal);
    occasionsModal.addEventListener('click', function (e) { if (e.target === occasionsModal) closeOccasionsModal(); });

    const addOccasion = function () {
      if (!newOccasionInput) return;
      const value = newOccasionInput.value.trim();
      if (!value) return;
      if (!service.occasions) service.occasions = [];
      const exists = service.occasions.some(function (o) { return o.toLowerCase() === value.toLowerCase(); });
      if (exists) {
        alert('"' + value + '" is already an occasion for this service.');
        return;
      }
      service.occasions.push(value);
      hqPersistServices();
      newOccasionInput.value = '';
      renderOccasionsChips();
      renderTabs();
      renderGrid();
      newOccasionInput.focus();
    };

    const addBtn = document.getElementById('tmAddOccasionBtn');
    if (addBtn) addBtn.addEventListener('click', addOccasion);
    if (newOccasionInput) {
      newOccasionInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addOccasion(); }
      });
    }
  }

  renderTabs();
  renderGrid();
});
