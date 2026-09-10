// Admin panel — Services page only.
// Requires admin-data.js, template-store.js, and admin-common.js loaded first.
//
// NOTE: this file adds an in-page "Manage" view (Templates / Choices /
// Settings tabs) that opens when a service card is clicked. It's a styled
// copy for the Services page only — it does NOT touch the structure of
// each service's own template webpage (admin-templates-<slug>.html) or
// the general Templates page (admin-templates.html), which stay exactly
// as they were.

document.addEventListener('DOMContentLoaded', function () {

  const servicesCardGrid = document.getElementById('servicesCardGrid');
  if (!servicesCardGrid || typeof ADMIN_SAMPLE_SERVICES === 'undefined') return;

  const servicesListPanel = document.getElementById('servicesListPanel');
  const serviceDetailView = document.getElementById('serviceDetailView');
  const adminPageTitleEl = document.getElementById('adminPageTitle');
  const adminPageSubtitleEl = document.getElementById('adminPageSubtitle');
  const defaultPageTitle = adminPageTitleEl ? adminPageTitleEl.textContent : 'Services';
  const defaultPageSubtitle = adminPageSubtitleEl ? adminPageSubtitleEl.textContent : '';

  function renderServices() {
    servicesCardGrid.innerHTML = ADMIN_SAMPLE_SERVICES.map(function (s, index) {
      const templateCount = hqTemplateFilesFor(s.slug).length;
      const optionGroups = s.optionGroups || [];
      const optionCount = optionGroups.reduce(function (sum, g) { return sum + (g.options ? g.options.length : 0); }, 0);
      const needsTemplate = s.needsTemplate !== false; // undefined = legacy service, treat as needing one
      const statusClass = s.active ? 'is-active' : 'is-inactive';
      const statusLabel = s.active ? 'Active' : 'Inactive';

      // Info badges: template count only matters for services that use
      // designs; choices count always shows so it's easy to spot
      // services that rely on text options (e.g. sizes) instead.
      const infoBadges = [];
      if (needsTemplate) {
        infoBadges.push('<span class="admin-service-template-count"><i class="fa-solid fa-images"></i> ' + templateCount + ' template' + (templateCount === 1 ? '' : 's') + '</span>');
      }
      infoBadges.push('<span class="admin-service-template-count"><i class="fa-solid fa-tags"></i> ' + optionCount + ' choice' + (optionCount === 1 ? '' : 's') + '</span>');

      const imageStyle = s.image ? ' style="background-image:url(\'' + s.image.replace(/'/g, "\\'") + '\');"' : '';
      const imageInner = s.image ? '' : '<i class="fa-solid fa-image admin-service-card-image-noimg"></i>';

      return '<div class="admin-service-card">' +
        '<a href="#" class="admin-service-card-link" data-manage-index="' + index + '">' +
          '<div class="admin-service-card-image"' + imageStyle + '>' +
            imageInner +
            '<span class="admin-service-status ' + statusClass + '">' + statusLabel + '</span>' +
          '</div>' +
          '<div class="admin-service-card-body">' +
            '<span class="admin-service-card-category">' + (s.category || '') + '</span>' +
            '<h3>' + s.name + '</h3>' +
            '<div class="admin-service-card-price">' + formatPeso(s.basePrice) + (s.unit ? ' <span>' + s.unit + '</span>' : '') + '</div>' +
          '</div>' +
        '</a>' +
        '<div class="admin-service-card-footer" style="flex-direction:column; align-items:stretch; gap:10px;">' +
          '<div style="display:flex; flex-direction:column; gap:4px;">' + infoBadges.join('') + '</div>' +
          '<div class="admin-service-card-actions" style="width:100%; justify-content:space-between; align-items:center;">' +
            '<label class="admin-switch" title="Toggle active/inactive">' +
              '<input type="checkbox" data-service-index="' + index + '"' + (s.active ? ' checked' : '') + '>' +
              '<span class="admin-switch-track"></span>' +
            '</label>' +
            '<a href="#" class="admin-panel-link" data-manage-index="' + index + '">Manage &rarr;</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    servicesCardGrid.querySelectorAll('input[type="checkbox"][data-service-index]').forEach(function (input) {
      input.addEventListener('change', function () {
        const idx = Number(input.dataset.serviceIndex);
        ADMIN_SAMPLE_SERVICES[idx].active = input.checked;
        hqPersistServices();
        renderServices();
      });
    });

    servicesCardGrid.querySelectorAll('[data-manage-index]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openServiceDetail(Number(el.dataset.manageIndex));
      });
    });
  }

  /* =======================================================================
     Service Manage view — opens in place of the card grid when a service's
     card or its "Manage" link is clicked. Templates / Choices / Settings
     tabs, matching the requested design. This lives entirely on the
     Services page; it doesn't read from or write to the separate
     admin-templates-<slug>.html pages.
  ========================================================================= */
  let currentServiceIndex = null;
  let currentDetailTab = 'templates';
  let currentTemplatesOccasionFilter = 'all';

  const detailBackLink = document.getElementById('detailBackLink');
  const detailServiceName = document.getElementById('detailServiceName');
  const detailServiceCategory = document.getElementById('detailServiceCategory');
  const detailServicePrice = document.getElementById('detailServicePrice');
  const detailTabs = document.getElementById('detailTabs');
  const detailTabBtnTemplates = document.getElementById('detailTabBtnTemplates');
  const detailTabBtnChoices = document.getElementById('detailTabBtnChoices');
  const detailTabTemplatesCount = document.getElementById('detailTabTemplatesCount');
  const detailTabChoicesCount = document.getElementById('detailTabChoicesCount');
  const detailPanelTemplates = document.getElementById('detailPanelTemplates');
  const detailPanelChoices = document.getElementById('detailPanelChoices');
  const detailPanelSettings = document.getElementById('detailPanelSettings');
  const detailTemplateGrid = document.getElementById('detailTemplateGrid');
  const detailOccasionTabs = document.getElementById('detailOccasionTabs');
  const detailDropzone = document.getElementById('detailDropzone');
  const detailFileInput = document.getElementById('detailFileInput');
  const optionGroupsList = document.getElementById('optionGroupsList');

  function currentService() {
    return currentServiceIndex === null ? null : ADMIN_SAMPLE_SERVICES[currentServiceIndex];
  }

  // Older services (or ones saved before this feature) only have a flat
  // "choices" list of strings. The first time a service like that is
  // opened here, fold that list into a single option group so nothing
  // gets lost.
  function ensureOptionGroups(service) {
    if (!Array.isArray(service.optionGroups)) {
      if (Array.isArray(service.choices) && service.choices.length) {
        service.optionGroups = [{
          name: 'Options',
          required: true,
          options: service.choices.map(function (c) { return { name: c, priceDelta: 0 }; })
        }];
      } else {
        service.optionGroups = [];
      }
    }
  }

  function openServiceDetail(index) {
    currentServiceIndex = index;
    const service = ADMIN_SAMPLE_SERVICES[index];
    ensureOptionGroups(service);
    currentTemplatesOccasionFilter = 'all';

    servicesListPanel.style.display = 'none';
    serviceDetailView.style.display = '';

    const needsTemplate = service.needsTemplate !== false;
    detailTabBtnTemplates.style.display = needsTemplate ? '' : 'none';
    currentDetailTab = needsTemplate ? 'templates' : 'choices';

    renderDetailHeader();
    switchDetailTab(currentDetailTab);
    renderTemplatesTab();
    renderChoicesTab();
    renderSettingsTab();
  }

  function closeServiceDetail() {
    currentServiceIndex = null;
    serviceDetailView.style.display = 'none';
    servicesListPanel.style.display = '';
    if (adminPageTitleEl) adminPageTitleEl.textContent = defaultPageTitle;
    if (adminPageSubtitleEl) adminPageSubtitleEl.textContent = defaultPageSubtitle;
    renderServices();
  }

  if (detailBackLink) {
    detailBackLink.addEventListener('click', function (e) {
      e.preventDefault();
      closeServiceDetail();
    });
  }

  function renderDetailHeader() {
    const service = currentService();
    if (!service) return;
    detailServiceName.textContent = service.name;
    detailServiceCategory.textContent = service.category || '';
    detailServicePrice.textContent = formatPeso(service.basePrice) + (service.unit ? ' / ' + service.unit : '');
    if (adminPageTitleEl) adminPageTitleEl.textContent = service.name;
    if (adminPageSubtitleEl) adminPageSubtitleEl.textContent = 'Service management';
  }

  function switchDetailTab(tab) {
    currentDetailTab = tab;
    [detailTabBtnTemplates, detailTabBtnChoices, document.getElementById('detailTabBtnSettings')].forEach(function (btn) {
      if (btn) btn.classList.toggle('is-active', btn.dataset.detailTab === tab);
    });
    detailPanelTemplates.style.display = tab === 'templates' ? '' : 'none';
    detailPanelChoices.style.display = tab === 'choices' ? '' : 'none';
    detailPanelSettings.style.display = tab === 'settings' ? '' : 'none';
  }

  if (detailTabs) {
    detailTabs.querySelectorAll('[data-detail-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () { switchDetailTab(btn.dataset.detailTab); });
    });
  }

  /* --- Templates tab ---------------------------------------------------- */
  function renderOccasionTabs(service, allTemplates) {
    if (!detailOccasionTabs) return;
    const occasions = hqServiceOccasions(service);
    const tabs = ['all'].concat(occasions);

    detailOccasionTabs.innerHTML = tabs.map(function (o) {
      const label = o === 'all' ? 'All' : o;
      const active = o === currentTemplatesOccasionFilter ? ' is-active' : '';
      return '<button type="button" class="admin-occasion-tab' + active + '" data-occasion-tab="' + escapeAttr(o) + '">' + label + '</button>';
    }).join('');

    detailOccasionTabs.querySelectorAll('[data-occasion-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentTemplatesOccasionFilter = btn.dataset.occasionTab;
        renderTemplatesTab();
      });
    });
  }

  function renderTemplatesTab() {
    const service = currentService();
    if (!service) return;
    const allTemplates = hqTemplateFilesFor(service.slug);
    const templates = currentTemplatesOccasionFilter === 'all'
      ? allTemplates
      : allTemplates.filter(function (t) { return t.occasion === currentTemplatesOccasionFilter; });

    detailTabTemplatesCount.textContent = '(' + allTemplates.length + ')';
    renderOccasionTabs(service, allTemplates);

    detailTemplateGrid.innerHTML = templates.length
      ? templates.map(function (t) {
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
              '<button type="button" class="admin-row-action" data-remove-template="' + t.id + '" aria-label="Delete ' + t.name + '" title="Delete"><i class="fa-solid fa-trash"></i></button>' +
            '</div>' +
          '</div>';
        }).join('')
      : '<div class="admin-option-groups-empty">' + (allTemplates.length ? 'No designs match this occasion.' : 'No designs uploaded yet.') + '</div>';

    // Delete a design — removes it from the shared store, so it
    // disappears from this service's Template Manager page too.
    detailTemplateGrid.querySelectorAll('[data-remove-template]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('Delete this design?')) return;
        const id = btn.dataset.removeTemplate;
        const map = hqLoadTemplateFiles();
        map[service.slug] = (map[service.slug] || []).filter(function (t) { return t.id !== id; });
        hqSaveTemplateFiles(map);
        renderTemplatesTab();
        renderServices();
      });
    });
  }

  // Reads dropped/picked files, validates them, and adds them straight
  // to the shared design store (same one the Template Manager page
  // uses) so they immediately show up — with a real thumbnail and an
  // occasion tag — in both places.
  function handleIncomingFiles(fileList) {
    const service = currentService();
    if (!service) return;

    const occasions = hqServiceOccasions(service);
    const defaultOccasion = hqDefaultOccasionFor(occasions);

    const validFiles = [];
    const rejected = [];
    Array.from(fileList).forEach(function (file) {
      if (HQ_TEMPLATE_ACCEPTED_TYPES.indexOf(file.type) === -1) { rejected.push(file.name + ' — unsupported type'); return; }
      if (file.size > HQ_TEMPLATE_MAX_SIZE) { rejected.push(file.name + ' — over 20MB'); return; }
      validFiles.push(file);
    });
    if (rejected.length) alert('Some files were skipped:\n' + rejected.join('\n'));
    if (!validFiles.length) return;

    Promise.all(validFiles.map(function (file) {
      return hqReadFileAsDataUrl(file).then(function (dataUrl) {
        return {
          id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          name: file.name.replace(/\.[^/.]+$/, ''),
          occasion: defaultOccasion,
          type: file.type,
          dataUrl: dataUrl,
          uploadedAt: new Date().toISOString()
        };
      });
    })).then(function (newTemplates) {
      const map = hqLoadTemplateFiles();
      map[service.slug] = (map[service.slug] || []).concat(newTemplates);
      hqSaveTemplateFiles(map);
      renderTemplatesTab();
      renderServices();
    }).catch(function (e) {
      console.error('Could not read one or more files:', e);
      alert('Something went wrong reading a file. Try a smaller file or removing an old design first.');
    });
  }

  const detailUploadDesignsBtn = document.getElementById('detailUploadDesignsBtn');
  const detailBrowseFilesBtn = document.getElementById('detailBrowseFilesBtn');
  if (detailFileInput) {
    if (detailUploadDesignsBtn) detailUploadDesignsBtn.addEventListener('click', function () { detailFileInput.click(); });
    if (detailBrowseFilesBtn) detailBrowseFilesBtn.addEventListener('click', function () { detailFileInput.click(); });
    detailFileInput.addEventListener('change', function () {
      if (detailFileInput.files && detailFileInput.files.length) handleIncomingFiles(detailFileInput.files);
      detailFileInput.value = '';
    });
  }

  if (detailDropzone) {
    ['dragenter', 'dragover'].forEach(function (evt) {
      detailDropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        detailDropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      detailDropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        detailDropzone.classList.remove('is-dragover');
      });
    });
    detailDropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) handleIncomingFiles(e.dataTransfer.files);
    });
  }

  const detailManageOccasionsBtn = document.getElementById('detailManageOccasionsBtn');
  if (detailManageOccasionsBtn) {
    detailManageOccasionsBtn.addEventListener('click', function () {
      if (currentServiceIndex !== null) openOccasionsModal(currentServiceIndex);
    });
  }

  /* --- Choices tab (Option Groups) --------------------------------------- */
  function renderChoicesTab() {
    const service = currentService();
    if (!service) return;
    const groups = service.optionGroups || [];

    detailTabChoicesCount.textContent = '(' + groups.reduce(function (sum, g) { return sum + (g.options ? g.options.length : 0); }, 0) + ')';

    if (!groups.length) {
      optionGroupsList.innerHTML = '<div class="admin-option-groups-empty">No option groups yet — click "Add Option Group" to define variants like size or finish.</div>';
      return;
    }

    optionGroupsList.innerHTML = groups.map(function (group, gi) {
      const options = group.options || [];
      const rows = options.map(function (opt, oi) {
        return '<div class="admin-option-row">' +
          '<span class="admin-option-dot"></span>' +
          '<input type="text" class="admin-option-name-input" value="' + escapeAttr(opt.name) + '" data-option-name-group="' + gi + '" data-option-name-index="' + oi + '">' +
          '<div class="admin-option-price">' +
            '<span>+&#8369;</span>' +
            '<input type="number" min="0" step="1" value="' + (Number(opt.priceDelta) || 0) + '" data-option-price-group="' + gi + '" data-option-price-index="' + oi + '">' +
          '</div>' +
          '<button type="button" class="admin-chip-remove" data-remove-option-group="' + gi + '" data-remove-option-index="' + oi + '" aria-label="Remove option">&times;</button>' +
        '</div>';
      }).join('');

      return '<div class="admin-option-group">' +
        '<div class="admin-option-group-header">' +
          '<input type="text" class="admin-option-group-name" value="' + escapeAttr(group.name) + '" data-group-name-index="' + gi + '">' +
          '<div class="admin-option-group-header-actions">' +
            '<label class="admin-required-toggle">Required' +
              '<label class="admin-switch">' +
                '<input type="checkbox" data-group-required-index="' + gi + '"' + (group.required ? ' checked' : '') + '>' +
                '<span class="admin-switch-track"></span>' +
              '</label>' +
            '</label>' +
            '<button type="button" class="admin-link-btn is-danger" data-remove-group-index="' + gi + '">Remove Group</button>' +
          '</div>' +
        '</div>' +
        '<div class="admin-option-rows">' + rows + '</div>' +
        '<button type="button" class="admin-link-btn" data-add-option-index="' + gi + '">+ Add Option</button>' +
      '</div>';
    }).join('');

    // Group name
    optionGroupsList.querySelectorAll('[data-group-name-index]').forEach(function (input) {
      input.addEventListener('input', function () {
        service.optionGroups[Number(input.dataset.groupNameIndex)].name = input.value;
        hqPersistServices();
      });
    });

    // Required toggle
    optionGroupsList.querySelectorAll('[data-group-required-index]').forEach(function (input) {
      input.addEventListener('change', function () {
        service.optionGroups[Number(input.dataset.groupRequiredIndex)].required = input.checked;
        hqPersistServices();
      });
    });

    // Remove group
    optionGroupsList.querySelectorAll('[data-remove-group-index]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        service.optionGroups.splice(Number(btn.dataset.removeGroupIndex), 1);
        hqPersistServices();
        renderChoicesTab();
        renderServices();
      });
    });

    // Add option
    optionGroupsList.querySelectorAll('[data-add-option-index]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const gi = Number(btn.dataset.addOptionIndex);
        service.optionGroups[gi].options.push({ name: '', priceDelta: 0 });
        hqPersistServices();
        renderChoicesTab();
        renderServices();
      });
    });

    // Option name
    optionGroupsList.querySelectorAll('[data-option-name-group]').forEach(function (input) {
      input.addEventListener('input', function () {
        const gi = Number(input.dataset.optionNameGroup);
        const oi = Number(input.dataset.optionNameIndex);
        service.optionGroups[gi].options[oi].name = input.value;
        hqPersistServices();
      });
    });

    // Option price
    optionGroupsList.querySelectorAll('[data-option-price-group]').forEach(function (input) {
      input.addEventListener('input', function () {
        const gi = Number(input.dataset.optionPriceGroup);
        const oi = Number(input.dataset.optionPriceIndex);
        service.optionGroups[gi].options[oi].priceDelta = Number(input.value) || 0;
        hqPersistServices();
      });
    });

    // Remove option
    optionGroupsList.querySelectorAll('[data-remove-option-group]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const gi = Number(btn.dataset.removeOptionGroup);
        const oi = Number(btn.dataset.removeOptionIndex);
        service.optionGroups[gi].options.splice(oi, 1);
        hqPersistServices();
        renderChoicesTab();
        renderServices();
      });
    });
  }

  function escapeAttr(str) {
    return String(str == null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  const addOptionGroupBtn = document.getElementById('addOptionGroupBtn');
  if (addOptionGroupBtn) {
    addOptionGroupBtn.addEventListener('click', function () {
      const service = currentService();
      if (!service) return;
      if (!service.optionGroups) service.optionGroups = [];
      service.optionGroups.push({ name: 'New Option Group', required: true, options: [] });
      hqPersistServices();
      renderChoicesTab();
      renderServices();
    });
  }

  /* --- Settings tab -------------------------------------------------------- */
  const detailSettingsName = document.getElementById('detailSettingsName');
  const detailSettingsPrice = document.getElementById('detailSettingsPrice');
  const detailSettingsNeedsTemplate = document.getElementById('detailSettingsNeedsTemplate');
  const detailSettingsSaveBtn = document.getElementById('detailSettingsSaveBtn');
  const detailDeleteServiceBtn = document.getElementById('detailDeleteServiceBtn');
  const detailSettingsImageBtn = document.getElementById('detailSettingsImageBtn');
  const detailSettingsImageInput = document.getElementById('detailSettingsImageInput');
  const detailSettingsImagePreview = document.getElementById('detailSettingsImagePreview');
  let pendingSettingsImage = null; // set only if the admin picks a new photo in this session

  function renderSettingsImagePreview(dataUrl) {
    if (!detailSettingsImagePreview) return;
    detailSettingsImagePreview.innerHTML = dataUrl
      ? '<img src="' + dataUrl + '" alt="">'
      : '<i class="fa-solid fa-image"></i>';
  }

  if (detailSettingsImageBtn && detailSettingsImageInput) {
    detailSettingsImageBtn.addEventListener('click', function () { detailSettingsImageInput.click(); });
    detailSettingsImageInput.addEventListener('change', function () {
      const file = detailSettingsImageInput.files && detailSettingsImageInput.files[0];
      if (!file) return;
      if (['image/png', 'image/jpeg'].indexOf(file.type) === -1) { alert('Please choose a PNG or JPG image.'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Image is too large — please choose one under 5MB.'); return; }
      hqReadFileAsDataUrl(file).then(function (dataUrl) {
        pendingSettingsImage = dataUrl;
        renderSettingsImagePreview(dataUrl);
      }).catch(function () {
        alert('Something went wrong reading that image. Please try another file.');
      });
    });
  }

  function renderSettingsTab() {
    const service = currentService();
    if (!service) return;
    detailSettingsName.value = service.name;
    detailSettingsPrice.value = service.basePrice;
    detailSettingsNeedsTemplate.checked = service.needsTemplate !== false;
    pendingSettingsImage = null;
    renderSettingsImagePreview(service.image || null);
  }

  if (detailSettingsSaveBtn) {
    detailSettingsSaveBtn.addEventListener('click', function () {
      const service = currentService();
      if (!service) return;

      const name = detailSettingsName.value.trim();
      const price = detailSettingsPrice.value.trim();
      const needsTemplate = detailSettingsNeedsTemplate.checked;
      const didNotNeedTemplateBefore = service.needsTemplate === false;

      const priceIsValid = /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(price) || /^\d+(\.\d+)?$/.test(price);

      if (!name || !priceIsValid) {
        alert(!priceIsValid && name
          ? 'Base Price must be a number (e.g. 150) or a range (e.g. 150-200).'
          : 'Please fill in all fields.');
        return;
      }

      service.name = name;
      service.basePrice = price;
      service.needsTemplate = needsTemplate;
      if (pendingSettingsImage) service.image = pendingSettingsImage;
      hqPersistServices();

      // Same server step used elsewhere: create this service's dedicated
      // template-manager page if it just started needing one. This only
      // creates the file — it never edits the existing per-service pages.
      if (needsTemplate && didNotNeedTemplateBefore) {
        fetch('create-template-page.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: service.slug, name: service.name })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (!data.success) {
              console.error('create-template-page.php error:', data.message);
              alert('Service updated, but the template page could not be auto-created: ' + data.message + '\n\nYou can still copy admin-templates-STARTER.html manually and rename it to admin-templates-' + service.slug + '.html.');
            }
          })
          .catch(function (err) {
            console.error('Could not reach create-template-page.php:', err);
            alert('Service updated, but the template page could not be auto-created (server not reachable).\n\nYou can still copy admin-templates-STARTER.html manually and rename it to admin-templates-' + service.slug + '.html.');
          });
      }

      const needsTemplateNow = service.needsTemplate !== false;
      detailTabBtnTemplates.style.display = needsTemplateNow ? '' : 'none';
      if (!needsTemplateNow && currentDetailTab === 'templates') switchDetailTab('choices');

      renderDetailHeader();
      renderServices();
    });
  }

  if (detailDeleteServiceBtn) {
    detailDeleteServiceBtn.addEventListener('click', function () {
      const service = currentService();
      if (!service) return;
      if (!confirm('Delete "' + service.name + '"? This cannot be undone.')) return;
      ADMIN_SAMPLE_SERVICES.splice(currentServiceIndex, 1);
      hqPersistServices();
      closeServiceDetail();
    });
  }

  renderServices();

  /* ---------------------------------------------------------------------
     Manage Occasions modal — the occasion tags used for this service's
     Template Manager (e.g. Wedding, Birthday, Corporate). Falls back to
     ADMIN_DEFAULT_OCCASIONS (see template-store.js) until the admin sets
     a custom list. Opened from the Templates tab of the Manage view above.
  --------------------------------------------------------------------- */
  const occasionsModal = document.getElementById('occasionsModal');
  const occasionsChipList = document.getElementById('occasionsChipList');
  const occasionsModalSub = document.getElementById('occasionsModalSub');
  const newOccasionInput = document.getElementById('newOccasionInput');
  let activeOccasionsIndex = null;

  function renderOccasionsChips() {
    if (activeOccasionsIndex === null) return;
    const service = ADMIN_SAMPLE_SERVICES[activeOccasionsIndex];
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
      });
    });
  }

  function openOccasionsModal(index) {
    activeOccasionsIndex = index;
    const service = ADMIN_SAMPLE_SERVICES[index];
    if (!service.occasions) service.occasions = [];
    occasionsModalSub.textContent = 'What kind of designs customers can choose from for "' + service.name + '", e.g. Wedding, Birthday, Corporate.';
    newOccasionInput.value = '';
    renderOccasionsChips();
    occasionsModal.classList.add('is-open');
  }

  function closeOccasionsModal() {
    occasionsModal.classList.remove('is-open');
    activeOccasionsIndex = null;
  }

  if (occasionsModal) {
    document.getElementById('occasionsModalClose').addEventListener('click', closeOccasionsModal);
    document.getElementById('occasionsModalDone').addEventListener('click', closeOccasionsModal);
    occasionsModal.addEventListener('click', function (e) { if (e.target === occasionsModal) closeOccasionsModal(); });

    const addOccasion = function () {
      if (activeOccasionsIndex === null) return;
      const service = ADMIN_SAMPLE_SERVICES[activeOccasionsIndex];
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
      newOccasionInput.focus();
    };

    document.getElementById('addOccasionBtn').addEventListener('click', addOccasion);
    newOccasionInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addOccasion(); }
    });
  }

  /* ---------------------------------------------------------------------
     Add Service modal — a service must have at least one design/template
     before it can be added, since that's what makes it show up on the
     Templates page.
  --------------------------------------------------------------------- */
  const addServiceBtn = document.getElementById('addServiceBtn');
  const addServiceModal = document.getElementById('addServiceModal');
  if (addServiceBtn && addServiceModal) {
    const closeAddServiceModal = function () { addServiceModal.classList.remove('is-open'); };

    const needsTemplateCheckbox = document.getElementById('newServiceNeedsTemplate');
    const occasionsWrapper = document.getElementById('newServiceOccasionsWrapper');
    const occasionsChipListEl = document.getElementById('newServiceOccasionsChipList');
    const newOccasionInputEl = document.getElementById('newServiceOccasionInput');
    const newServiceImageBtn = document.getElementById('newServiceImageBtn');
    const newServiceImageInput = document.getElementById('newServiceImageInput');
    const newServiceImagePreview = document.getElementById('newServiceImagePreview');
    let newServiceOccasions = [];
    let newServiceImage = null; // required — admin must pick a photo before saving

    function renderNewServiceImagePreview() {
      if (!newServiceImagePreview) return;
      newServiceImagePreview.innerHTML = newServiceImage
        ? '<img src="' + newServiceImage + '" alt="">'
        : '<i class="fa-solid fa-image"></i>';
    }

    if (newServiceImageBtn && newServiceImageInput) {
      newServiceImageBtn.addEventListener('click', function () { newServiceImageInput.click(); });
      newServiceImageInput.addEventListener('change', function () {
        const file = newServiceImageInput.files && newServiceImageInput.files[0];
        if (!file) return;
        if (['image/png', 'image/jpeg'].indexOf(file.type) === -1) { alert('Please choose a PNG or JPG image.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Image is too large — please choose one under 5MB.'); return; }
        hqReadFileAsDataUrl(file).then(function (dataUrl) {
          newServiceImage = dataUrl;
          renderNewServiceImagePreview();
        }).catch(function () {
          alert('Something went wrong reading that image. Please try another file.');
        });
      });
    }

    // Toggling "needs a design/template" shows or hides the occasions
    // list that goes with it — services like text-only options (sizes,
    // etc.) don't need a design, so the occasions field doesn't apply.
    function syncTemplateFieldVisibility() {
      if (!needsTemplateCheckbox || !occasionsWrapper) return;
      occasionsWrapper.style.display = needsTemplateCheckbox.checked ? '' : 'none';
    }
    if (needsTemplateCheckbox) needsTemplateCheckbox.addEventListener('change', syncTemplateFieldVisibility);

    function renderNewServiceOccasionChips() {
      if (!occasionsChipListEl) return;
      occasionsChipListEl.innerHTML = newServiceOccasions.length
        ? newServiceOccasions.map(function (occasion, i) {
            return '<span class="admin-chip">' + occasion +
              '<button type="button" class="admin-chip-remove" data-new-occasion-remove="' + i + '" aria-label="Remove ' + occasion + '">&times;</button>' +
            '</span>';
          }).join('')
        : '<span class="admin-chip-empty">Using the default set (Wedding, Birthday, Debut, Christening, Anniversary, Corporate, Other). Add one below to switch to a custom list.</span>';

      occasionsChipListEl.querySelectorAll('[data-new-occasion-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          newServiceOccasions.splice(Number(btn.dataset.newOccasionRemove), 1);
          renderNewServiceOccasionChips();
        });
      });
    }

    if (newOccasionInputEl) {
      const addNewServiceOccasion = function () {
        const value = newOccasionInputEl.value.trim();
        if (!value) return;
        const exists = newServiceOccasions.some(function (o) { return o.toLowerCase() === value.toLowerCase(); });
        if (exists) { alert('"' + value + '" is already in the list.'); return; }
        newServiceOccasions.push(value);
        newOccasionInputEl.value = '';
        renderNewServiceOccasionChips();
        newOccasionInputEl.focus();
      };
      const addBtn = document.getElementById('addNewServiceOccasionBtn');
      if (addBtn) addBtn.addEventListener('click', addNewServiceOccasion);
      newOccasionInputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addNewServiceOccasion(); }
      });
    }

    addServiceBtn.addEventListener('click', function () {
      if (needsTemplateCheckbox) needsTemplateCheckbox.checked = true;
      newServiceOccasions = [];
      newServiceImage = null;
      if (newServiceImageInput) newServiceImageInput.value = '';
      renderNewServiceImagePreview();
      renderNewServiceOccasionChips();
      syncTemplateFieldVisibility();
      addServiceModal.classList.add('is-open');
    });
    document.getElementById('addServiceModalClose').addEventListener('click', closeAddServiceModal);
    document.getElementById('addServiceCancel').addEventListener('click', closeAddServiceModal);
    addServiceModal.addEventListener('click', function (e) { if (e.target === addServiceModal) closeAddServiceModal(); });

    document.getElementById('addServiceSubmit').addEventListener('click', function () {
      const nameInput = document.getElementById('newServiceName');
      const priceInput = document.getElementById('newServicePrice');
      const needsTemplate = needsTemplateCheckbox ? needsTemplateCheckbox.checked : true;

      const name = nameInput.value.trim();
      const price = priceInput.value.trim(); // plain number ("150") or a range ("150-200")

      // Accepts "150" or "150-200" (spaces around the dash are fine too).
      const priceIsValid = /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(price) || /^\d+(\.\d+)?$/.test(price);

      if (!name || !priceIsValid) {
        alert(!priceIsValid && name
          ? 'Base Price must be a number (e.g. 150) or a range (e.g. 150-200).'
          : 'Please fill in all fields.');
        return;
      }

      if (!newServiceImage) {
        alert('Please choose a photo for this service.');
        return;
      }

      const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'service-' + Date.now();

      // needsTemplate is what connects a service to the Templates page:
      // when true, the service shows up there right away (even with zero
      // designs yet — the admin uploads them afterward via the Template
      // Manager); when false, it's a choices-only service instead.
      ADMIN_SAMPLE_SERVICES.push({ slug: slug, name: name, basePrice: price, image: newServiceImage, active: true, needsTemplate: needsTemplate, choices: [], optionGroups: [], occasions: needsTemplate ? newServiceOccasions.slice() : [] });
      hqPersistServices();
      hqPersistTemplates();

      // Ask the server to create this service's dedicated template-manager
      // page (admin-templates-<slug>.html) by copying the STARTER file.
      // Browsers can't write new files themselves, so this one step goes
      // through create-template-page.php instead of staying purely client-side.
      if (needsTemplate) {
        fetch('create-template-page.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slug, name: name })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (!data.success) {
              console.error('create-template-page.php error:', data.message);
              alert('Service saved, but the template page could not be auto-created: ' + data.message + '\n\nYou can still copy admin-templates-STARTER.html manually and rename it to admin-templates-' + slug + '.html.');
            }
          })
          .catch(function (err) {
            console.error('Could not reach create-template-page.php:', err);
            alert('Service saved, but the template page could not be auto-created (server not reachable). Make sure you\'re opening this via http://localhost/... and not double-clicking the file.\n\nYou can still copy admin-templates-STARTER.html manually and rename it to admin-templates-' + slug + '.html.');
          });
      }

      [nameInput, priceInput].forEach(function (el) { el.value = ''; });
      if (needsTemplateCheckbox) needsTemplateCheckbox.checked = true;
      newServiceOccasions = [];
      newServiceImage = null;
      if (newServiceImageInput) newServiceImageInput.value = '';
      renderNewServiceImagePreview();
      renderNewServiceOccasionChips();
      syncTemplateFieldVisibility();

      closeAddServiceModal();
      renderServices();
    });
  }

});
