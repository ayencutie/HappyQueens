// Admin panel — shared behavior (front-end demo only, reads from admin-data.js)

function formatPeso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH');
}

function statusBadge(status) {
  const label = ADMIN_STATUS_LABELS[status] || status;
  return '<span class="status-badge status-' + status + '">' + label + '</span>';
}

function payBadge(payment) {
  const cls = 'pay-' + payment.replace(/\s+/g, '-').split('-')[0];
  return '<span class="pay-badge ' + cls + '">' + payment + '</span>';
}

function initials(name) {
  return name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
}

/* ---------------------------------------------------------------------
   Mock persistence (localStorage) — there's no real backend/database
   here. This just saves what the admin adds in the browser itself, so
   services/choices/templates survive a page refresh instead of resetting
   to the hardcoded sample data every time.
--------------------------------------------------------------------- */
const HQ_STORAGE_KEYS = {
  services: 'hqAdminServices',
  templates: 'hqAdminTemplates'
};

function hqLoadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function hqSaveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage unavailable (private browsing, quota, etc.) — the app still
    // works, it just won't persist between reloads.
  }
}

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------------
     Sidebar toggle (mobile)
  --------------------------------------------------------------------- */
  const sidebar = document.getElementById('adminSidebar');
  const sidebarToggle = document.getElementById('adminSidebarToggle');
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-open');
    });
    sidebar.addEventListener('click', function (e) {
      if (e.target === sidebar) sidebar.classList.remove('is-open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sidebar.classList.remove('is-open');
    });
  }

  /* ---------------------------------------------------------------------
     Restore mock-saved data (localStorage) before anything renders
  --------------------------------------------------------------------- */
  if (typeof ADMIN_SAMPLE_SERVICES !== 'undefined') {
    try {
      const savedServices = hqLoadJSON(HQ_STORAGE_KEYS.services, null);
      if (Array.isArray(savedServices)) {
        savedServices.forEach(function (saved) {
          if (!saved || !saved.slug) return;
          const existing = ADMIN_SAMPLE_SERVICES.find(function (s) { return s.slug === saved.slug; });
          if (existing) {
            // Original sample service — reapply the bits the admin can change.
            existing.active = saved.active;
            existing.needsTemplate = saved.needsTemplate;
            existing.choices = Array.isArray(saved.choices) ? saved.choices : [];
          } else {
            // A service the admin created in a past session — bring it back.
            ADMIN_SAMPLE_SERVICES.push(saved);
          }
        });
      }

      if (typeof addTemplateToService === 'function' && typeof getServiceTemplates === 'function') {
        const savedTemplates = hqLoadJSON(HQ_STORAGE_KEYS.templates, null);
        if (savedTemplates && typeof savedTemplates === 'object') {
          Object.keys(savedTemplates).forEach(function (slug) {
            const names = savedTemplates[slug];
            if (!Array.isArray(names)) return;
            const existingNames = getServiceTemplates(slug);
            names.forEach(function (name) {
              if (existingNames.indexOf(name) === -1) addTemplateToService(slug, name);
            });
          });
        }
      }
    } catch (e) {
      // Never let bad/corrupted localStorage data break the rest of the
      // admin panel — worst case, saved data just doesn't restore.
      console.error('Could not restore saved admin data from localStorage:', e);
    }
  }

  function hqPersistServices() {
    if (typeof ADMIN_SAMPLE_SERVICES === 'undefined') return;
    hqSaveJSON(HQ_STORAGE_KEYS.services, ADMIN_SAMPLE_SERVICES);
  }

  function hqPersistTemplates() {
    if (typeof ADMIN_SAMPLE_SERVICES === 'undefined' || typeof getServiceTemplates !== 'function') return;
    const map = {};
    ADMIN_SAMPLE_SERVICES.forEach(function (s) { map[s.slug] = getServiceTemplates(s.slug); });
    hqSaveJSON(HQ_STORAGE_KEYS.templates, map);
  }

  /* ---------------------------------------------------------------------
     Dashboard
  --------------------------------------------------------------------- */
  const dashboardStats = document.getElementById('dashboardStats');
  if (dashboardStats && typeof ADMIN_SAMPLE_ORDERS !== 'undefined') {
    const orders = ADMIN_SAMPLE_ORDERS;
    const totalOrders = orders.length;
    const pendingCount = orders.filter(function (o) { return o.status === 'pending'; }).length;
    const completedCount = orders.filter(function (o) { return o.status === 'completed'; }).length;
    const revenue = orders
      .filter(function (o) { return o.status !== 'cancelled'; })
      .reduce(function (sum, o) { return sum + o.total; }, 0);

    dashboardStats.innerHTML =
      '<div class="admin-stat-card">' +
        '<div class="admin-stat-icon tone-primary"><i class="fa-solid fa-receipt"></i></div>' +
        '<div class="admin-stat-body">' +
          '<div class="admin-stat-value">' + totalOrders + '</div>' +
          '<div class="admin-stat-label">Total Orders</div>' +
          '<div class="admin-stat-trend up"><i class="fa-solid fa-arrow-up"></i> 12% this week</div>' +
        '</div>' +
      '</div>' +
      '<div class="admin-stat-card">' +
        '<div class="admin-stat-icon tone-warn"><i class="fa-solid fa-hourglass-half"></i></div>' +
        '<div class="admin-stat-body">' +
          '<div class="admin-stat-value">' + pendingCount + '</div>' +
          '<div class="admin-stat-label">Pending Orders</div>' +
          '<div class="admin-stat-trend down"><i class="fa-solid fa-arrow-down"></i> 3% this week</div>' +
        '</div>' +
      '</div>' +
      '<div class="admin-stat-card">' +
        '<div class="admin-stat-icon tone-accent"><i class="fa-solid fa-circle-check"></i></div>' +
        '<div class="admin-stat-body">' +
          '<div class="admin-stat-value">' + completedCount + '</div>' +
          '<div class="admin-stat-label">Completed Orders</div>' +
          '<div class="admin-stat-trend up"><i class="fa-solid fa-arrow-up"></i> 8% this week</div>' +
        '</div>' +
      '</div>' +
      '<div class="admin-stat-card">' +
        '<div class="admin-stat-icon tone-danger"><i class="fa-solid fa-peso-sign"></i></div>' +
        '<div class="admin-stat-body">' +
          '<div class="admin-stat-value">' + formatPeso(revenue) + '</div>' +
          '<div class="admin-stat-label">Total Revenue</div>' +
          '<div class="admin-stat-trend up"><i class="fa-solid fa-arrow-up"></i> 19% this week</div>' +
        '</div>' +
      '</div>';
  }

  // Simple CSS bar chart: revenue by day (derived from sample order dates)
  const dashboardBars = document.getElementById('dashboardBars');
  if (dashboardBars && typeof ADMIN_SAMPLE_ORDERS !== 'undefined') {
    const totals = {};
    ADMIN_SAMPLE_ORDERS.forEach(function (o) {
      if (o.status === 'cancelled') return;
      totals[o.date] = (totals[o.date] || 0) + o.total;
    });
    const days = Object.keys(totals).sort();
    const max = Math.max.apply(null, Object.values(totals));

    dashboardBars.innerHTML = days.map(function (day) {
      const value = totals[day];
      const heightPct = max ? Math.round((value / max) * 100) : 0;
      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return '<div class="admin-bar-col">' +
        '<div class="admin-bar" style="height:' + Math.max(heightPct, 6) + '%;" title="' + formatPeso(value) + '"></div>' +
        '<span class="admin-bar-label">' + label + '</span>' +
      '</div>';
    }).join('');
  }

  // Status breakdown list
  const statusBreakdown = document.getElementById('statusBreakdown');
  if (statusBreakdown && typeof ADMIN_SAMPLE_ORDERS !== 'undefined') {
    const colors = {
      'pending': '#D99A2B', 'in-design': '#5A3FC0', 'printing': '#1D6FA5',
      'packing': '#1E7A8C', 'out-for-delivery': '#B5590C', 'completed': '#22803F', 'cancelled': '#B23434',
    };
    const counts = {};
    ADMIN_SAMPLE_ORDERS.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });

    statusBreakdown.innerHTML = Object.keys(ADMIN_STATUS_LABELS).map(function (key) {
      const count = counts[key] || 0;
      return '<div class="admin-status-row">' +
        '<span class="admin-status-dot" style="background-color:' + colors[key] + ';"></span>' +
        '<span class="admin-status-row-name">' + ADMIN_STATUS_LABELS[key] + '</span>' +
        '<span class="admin-status-row-count">' + count + '</span>' +
      '</div>';
    }).join('');
  }

  // Recent orders (top 5) on the dashboard
  const recentOrdersBody = document.getElementById('recentOrdersBody');
  if (recentOrdersBody && typeof ADMIN_SAMPLE_ORDERS !== 'undefined') {
    const recent = ADMIN_SAMPLE_ORDERS.slice(-5).reverse();
    recentOrdersBody.innerHTML = recent.map(function (o) {
      return '<tr>' +
        '<td class="admin-cell-strong">' + o.id + '</td>' +
        '<td>' + o.customer + '</td>' +
        '<td>' + o.service + '</td>' +
        '<td>' + formatPeso(o.total) + '</td>' +
        '<td>' + statusBadge(o.status) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ---------------------------------------------------------------------
     Orders page (table + filters + search + detail modal)
  --------------------------------------------------------------------- */
  const ordersTableBody = document.getElementById('ordersTableBody');
  if (ordersTableBody && typeof ADMIN_SAMPLE_ORDERS !== 'undefined') {
    const searchInput = document.getElementById('ordersSearch');
    const statusTabs = document.getElementById('ordersStatusTabs');
    const modal = document.getElementById('orderModal');
    const modalClose = document.getElementById('orderModalClose');
    const modalBody = document.getElementById('orderModalBody');

    // Default view is "Pending" — that's where newly placed orders land,
    // so admin sees incoming orders that need attention first.
    let currentStatus = 'pending';

    function updateTabCounts() {
      const counts = { all: ADMIN_SAMPLE_ORDERS.length };
      ADMIN_SAMPLE_ORDERS.forEach(function (o) { counts[o.status] = (counts[o.status] || 0) + 1; });
      Object.keys(counts).forEach(function (key) {
        const el = document.getElementById('tabCount-' + key);
        if (el) el.textContent = counts[key];
      });
    }

    function renderOrders() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

      const filtered = ADMIN_SAMPLE_ORDERS.filter(function (o) {
        const matchesStatus = currentStatus === 'all' || o.status === currentStatus;
        const matchesQuery = !query ||
          o.id.toLowerCase().includes(query) ||
          o.customer.toLowerCase().includes(query) ||
          o.service.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
      });

      if (filtered.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="7" class="admin-table-empty">No orders match your search/filter.</td></tr>';
        updateTabCounts();
        return;
      }

      ordersTableBody.innerHTML = filtered.map(function (o) {
        return '<tr data-order-id="' + o.id + '">' +
          '<td class="admin-cell-strong">' + o.id + '</td>' +
          '<td>' + o.customer + '</td>' +
          '<td>' + o.service + '<span class="admin-cell-sub">Qty: ' + o.qty + '</span></td>' +
          '<td>' + formatPeso(o.total) + '</td>' +
          '<td>' + payBadge(o.payment) + '</td>' +
          '<td>' + statusBadge(o.status) + '</td>' +
          '<td><button type="button" class="admin-row-action view-order-btn" data-order-id="' + o.id + '" aria-label="View order"><i class="fa-solid fa-eye"></i></button></td>' +
        '</tr>';
      }).join('');

      ordersTableBody.querySelectorAll('.view-order-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { openOrderModal(btn.dataset.orderId); });
      });

      updateTabCounts();
    }

    function openOrderModal(orderId) {
      const order = ADMIN_SAMPLE_ORDERS.find(function (o) { return o.id === orderId; });
      if (!order || !modal || !modalBody) return;

      const isLocked = order.status === 'cancelled' || order.status === 'completed';

      const statusField = isLocked
        ? '<div class="admin-modal-field">' +
            '<label>Status</label>' +
            statusBadge(order.status) +
            '<p class="admin-modal-hint">' +
              (order.status === 'cancelled'
                ? 'This order was cancelled by the customer. Admin cannot change or undo a cancellation.'
                : 'This order is marked completed and is now locked. Status can no longer be changed.') +
            '</p>' +
          '</div>'
        : '<div class="admin-modal-field">' +
            '<label for="orderStatusSelect">Update Status</label>' +
            '<select id="orderStatusSelect">' +
              Object.keys(ADMIN_STATUS_LABELS).filter(function (key) { return key !== 'cancelled'; }).map(function (key) {
                const selected = key === order.status ? ' selected' : '';
                return '<option value="' + key + '"' + selected + '>' + ADMIN_STATUS_LABELS[key] + '</option>';
              }).join('') +
            '</select>' +
            '<p class="admin-modal-hint">Only the customer can cancel an order — cancelling isn\'t available here.</p>' +
          '</div>';

      modalBody.innerHTML =
        '<h3>' + order.id + '</h3>' +
        '<p class="admin-modal-sub">Placed on ' + new Date(order.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '</p>' +
        '<div class="admin-modal-row"><span>Customer</span><span>' + order.customer + '</span></div>' +
        '<div class="admin-modal-row"><span>Service</span><span>' + order.service + '</span></div>' +
        '<div class="admin-modal-row"><span>Quantity</span><span>' + order.qty + '</span></div>' +
        '<div class="admin-modal-row"><span>Total</span><span>' + formatPeso(order.total) + '</span></div>' +
        '<div class="admin-modal-row"><span>Payment</span><span>' + payBadge(order.payment) + '</span></div>' +
        statusField +
        '<div class="admin-modal-actions">' +
          '<button type="button" class="btn btn-outline" id="orderModalCancel">Close</button>' +
          '<button type="button" class="btn btn-filled" id="orderModalPrint"><i class="fa-solid fa-print"></i> Print Order</button>' +
        '</div>';

      modal.classList.add('is-open');

      document.getElementById('orderModalPrint').addEventListener('click', function () { printOrder(order); });
      const statusSelect = document.getElementById('orderStatusSelect');
      if (statusSelect) {
        statusSelect.addEventListener('change', function () {
          order.status = this.value;
          renderOrders();
        });
      }
      document.getElementById('orderModalCancel').addEventListener('click', closeOrderModal);
    }

    function closeOrderModal() {
      if (modal) modal.classList.remove('is-open');
    }

    // Builds a clean, printable order slip (order details + the ordered
    // design/artwork, e.g. an invitation card layout) and opens the browser
    // print dialog. Admin can print it directly, or choose "Save as PDF" in
    // the print dialog if they want a downloadable file instead.
    function printOrder(order) {
      const printSlip = document.getElementById('printOrderSlip');
      if (!printSlip) return;

      const designUrl = order.design || order.artwork || order.designUrl || order.file || null;

      const designBlock = designUrl
        ? '<div class="po-slip-design"><img src="' + designUrl + '" alt="Order design"></div>'
        : '<div class="po-slip-design"><div class="po-slip-design-empty">' +
            '<i class="fa-regular fa-image" style="font-size:22px; display:block; margin-bottom:8px;"></i>' +
            'No design file attached to this order yet.' +
          '</div></div>';

      printSlip.innerHTML =
        '<div class="po-slip-header">' +
          '<div class="po-slip-brand">' +
            '<strong>Happy Queen\'s Crafty House</strong>' +
          '</div>' +
          '<div class="po-slip-meta">' +
            '<strong>' + order.id + '</strong>' +
            'Printed ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          '</div>' +
        '</div>' +

        '<div class="po-slip-section-title">Order Details</div>' +
        '<div class="po-slip-row"><span>Customer</span><span>' + order.customer + '</span></div>' +
        '<div class="po-slip-row"><span>Service</span><span>' + order.service + '</span></div>' +
        '<div class="po-slip-row"><span>Quantity</span><span>' + order.qty + '</span></div>' +
        '<div class="po-slip-row"><span>Total</span><span>' + formatPeso(order.total) + '</span></div>' +
        '<div class="po-slip-row"><span>Payment</span><span>' + order.payment + '</span></div>' +
        '<div class="po-slip-row"><span>Status</span><span>' + (ADMIN_STATUS_LABELS[order.status] || order.status) + '</span></div>' +
        '<div class="po-slip-row"><span>Date Placed</span><span>' + new Date(order.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '</span></div>' +

        '<div class="po-slip-section-title">Design / Artwork to Print</div>' +
        designBlock +

        '<div class="po-slip-footer">Happy Queen\'s Crafty House &mdash; Order Slip &mdash; Internal use for production/printing</div>';

      window.print();
    }

    if (modalClose) modalClose.addEventListener('click', closeOrderModal);
    if (modal) {
      modal.addEventListener('click', function (e) { if (e.target === modal) closeOrderModal(); });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOrderModal(); });

    if (searchInput) searchInput.addEventListener('input', renderOrders);

    if (statusTabs) {
      statusTabs.querySelectorAll('.admin-status-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          currentStatus = tab.dataset.status;
          statusTabs.querySelectorAll('.admin-status-tab').forEach(function (t) { t.classList.remove('is-active'); });
          tab.classList.add('is-active');
          renderOrders();
        });
      });
    }

    renderOrders();
  }

  /* ---------------------------------------------------------------------
     Customers page
  --------------------------------------------------------------------- */
  const customersTableBody = document.getElementById('customersTableBody');
  if (customersTableBody && typeof ADMIN_SAMPLE_CUSTOMERS !== 'undefined') {
    const searchInput = document.getElementById('customersSearch');

    function renderCustomers() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const filtered = ADMIN_SAMPLE_CUSTOMERS.filter(function (c) {
        return !query || c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
      });

      if (filtered.length === 0) {
        customersTableBody.innerHTML = '<tr><td colspan="5" class="admin-table-empty">No customers match your search.</td></tr>';
        return;
      }

      customersTableBody.innerHTML = filtered.map(function (c) {
        return '<tr>' +
          '<td><div style="display:flex; align-items:center; gap:10px;">' +
            '<span class="admin-avatar">' + initials(c.name) + '</span>' +
            '<div><span class="admin-cell-strong">' + c.name + '</span><span class="admin-cell-sub">' + c.id + '</span></div>' +
          '</div></td>' +
          '<td>' + c.email + '</td>' +
          '<td>' + c.phone + '</td>' +
          '<td>' + c.orders + '</td>' +
          '<td>' + new Date(c.joined + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</td>' +
        '</tr>';
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', renderCustomers);
    renderCustomers();
  }

  /* ---------------------------------------------------------------------
     Services page (card grid)
  --------------------------------------------------------------------- */
  const servicesCardGrid = document.getElementById('servicesCardGrid');
  if (servicesCardGrid && typeof ADMIN_SAMPLE_SERVICES !== 'undefined') {
    function renderServices() {
      servicesCardGrid.innerHTML = ADMIN_SAMPLE_SERVICES.map(function (s, index) {
        const templateCount = typeof getServiceTemplates === 'function' ? getServiceTemplates(s.slug).length : 0;
        const choices = s.choices || [];
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
        infoBadges.push('<span class="admin-service-template-count"><i class="fa-solid fa-tags"></i> ' + choices.length + ' choice' + (choices.length === 1 ? '' : 's') + '</span>');

        return '<div class="admin-service-card">' +
          '<a href="admin-templates-' + s.slug + '.html" class="admin-service-card-link">' +
            '<div class="admin-service-card-image" style="background-image:url(\'https://picsum.photos/seed/hq-' + s.slug + '/400/300\');">' +
              '<span class="admin-service-status ' + statusClass + '">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="admin-service-card-body">' +
              '<span class="admin-service-card-category">' + s.category + '</span>' +
              '<h3>' + s.name + '</h3>' +
              '<div class="admin-service-card-price">' + formatPeso(s.basePrice) + ' <span>' + s.unit + '</span></div>' +
            '</div>' +
          '</a>' +
          '<div class="admin-service-card-footer">' +
            '<div style="display:flex; flex-direction:column; gap:4px;">' + infoBadges.join('') + '</div>' +
            '<div class="admin-service-card-actions">' +
              '<label class="admin-switch" title="Toggle active/inactive">' +
                '<input type="checkbox" data-service-index="' + index + '"' + (s.active ? ' checked' : '') + '>' +
                '<span class="admin-switch-track"></span>' +
              '</label>' +
              '<button type="button" class="admin-row-action" data-choices-index="' + index + '" aria-label="Manage choices" title="Manage choices"><i class="fa-solid fa-tags"></i></button>' +
              '<button type="button" class="admin-row-action" aria-label="Edit service" title="Edit service"><i class="fa-solid fa-pen"></i></button>' +
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

      servicesCardGrid.querySelectorAll('[data-choices-index]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openChoicesModal(Number(btn.dataset.choicesIndex));
        });
      });
    }

    /* ---------------------------------------------------------------------
       Manage Choices modal — simple text options per service (e.g. sizes:
       A4, Short, Long) for services that don't need a visual template.
    --------------------------------------------------------------------- */
    const choicesModal = document.getElementById('choicesModal');
    const choicesChipList = document.getElementById('choicesChipList');
    const choicesModalSub = document.getElementById('choicesModalSub');
    const newChoiceInput = document.getElementById('newChoiceInput');
    let activeChoicesIndex = null;

    function renderChoicesChips() {
      if (activeChoicesIndex === null) return;
      const service = ADMIN_SAMPLE_SERVICES[activeChoicesIndex];
      const choices = service.choices || [];

      choicesChipList.innerHTML = choices.length
        ? choices.map(function (choice, i) {
            return '<span class="admin-chip">' + choice +
              '<button type="button" class="admin-chip-remove" data-choice-remove="' + i + '" aria-label="Remove ' + choice + '">&times;</button>' +
            '</span>';
          }).join('')
        : '<span class="admin-chip-empty">No choices yet — add one below (e.g. A4, Short, Long).</span>';

      choicesChipList.querySelectorAll('[data-choice-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const i = Number(btn.dataset.choiceRemove);
          service.choices.splice(i, 1);
          hqPersistServices();
          renderChoicesChips();
        });
      });
    }

    function openChoicesModal(index) {
      activeChoicesIndex = index;
      const service = ADMIN_SAMPLE_SERVICES[index];
      if (!service.choices) service.choices = [];
      choicesModalSub.textContent = 'Text options customers can pick for "' + service.name + '", e.g. A4, Short, Long.';
      newChoiceInput.value = '';
      renderChoicesChips();
      choicesModal.classList.add('is-open');
    }

    function closeChoicesModal() {
      choicesModal.classList.remove('is-open');
      activeChoicesIndex = null;
      renderServices();
    }

    if (choicesModal) {
      document.getElementById('choicesModalClose').addEventListener('click', closeChoicesModal);
      document.getElementById('choicesModalDone').addEventListener('click', closeChoicesModal);
      choicesModal.addEventListener('click', function (e) { if (e.target === choicesModal) closeChoicesModal(); });

      const addChoice = function () {
        if (activeChoicesIndex === null) return;
        const service = ADMIN_SAMPLE_SERVICES[activeChoicesIndex];
        const value = newChoiceInput.value.trim();
        if (!value) return;
        if (!service.choices) service.choices = [];
        const exists = service.choices.some(function (c) { return c.toLowerCase() === value.toLowerCase(); });
        if (exists) {
          alert('"' + value + '" is already a choice for this service.');
          return;
        }
        service.choices.push(value);
        hqPersistServices();
        newChoiceInput.value = '';
        renderChoicesChips();
        newChoiceInput.focus();
      };

      document.getElementById('addChoiceBtn').addEventListener('click', addChoice);
      newChoiceInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addChoice(); }
      });
    }

    renderServices();

    // Add Service modal — a service must have at least one design/template
    // before it can be added, since that's what makes it show up on the
    // Templates page.
    const addServiceBtn = document.getElementById('addServiceBtn');
    const addServiceModal = document.getElementById('addServiceModal');
    if (addServiceBtn && addServiceModal) {
      const closeAddServiceModal = function () { addServiceModal.classList.remove('is-open'); };

      const needsTemplateCheckbox = document.getElementById('newServiceNeedsTemplate');
      const templateFieldWrapper = document.getElementById('newServiceTemplateFieldWrapper');

      // Toggling "needs a design/template" shows or hides the required
      // template-name field — services like text-only options (sizes,
      // etc.) don't need a design, so the field isn't required for them.
      function syncTemplateFieldVisibility() {
        if (!needsTemplateCheckbox || !templateFieldWrapper) return;
        templateFieldWrapper.style.display = needsTemplateCheckbox.checked ? '' : 'none';
      }
      if (needsTemplateCheckbox) needsTemplateCheckbox.addEventListener('change', syncTemplateFieldVisibility);

      addServiceBtn.addEventListener('click', function () {
        if (needsTemplateCheckbox) needsTemplateCheckbox.checked = true;
        syncTemplateFieldVisibility();
        addServiceModal.classList.add('is-open');
      });
      document.getElementById('addServiceModalClose').addEventListener('click', closeAddServiceModal);
      document.getElementById('addServiceCancel').addEventListener('click', closeAddServiceModal);
      addServiceModal.addEventListener('click', function (e) { if (e.target === addServiceModal) closeAddServiceModal(); });

      document.getElementById('addServiceSubmit').addEventListener('click', function () {
        const nameInput = document.getElementById('newServiceName');
        const categoryInput = document.getElementById('newServiceCategory');
        const priceInput = document.getElementById('newServicePrice');
        const unitInput = document.getElementById('newServiceUnit');
        const templateInput = document.getElementById('newServiceTemplateName');
        const needsTemplate = needsTemplateCheckbox ? needsTemplateCheckbox.checked : true;

        const name = nameInput.value.trim();
        const category = categoryInput.value.trim();
        const price = Number(priceInput.value);
        const unit = unitInput.value.trim();
        const templateName = templateInput.value.trim();

        if (!name || !category || !price || !unit || (needsTemplate && !templateName)) {
          alert(needsTemplate
            ? 'Please fill in all fields. A first design/template name is required — a service needs at least one design before it can be added.'
            : 'Please fill in all fields.');
          return;
        }

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'service-' + Date.now();

        // needsTemplate is what connects a service to the Templates page:
        // when true, the service shows up there right away (even with zero
        // designs yet); when false, it's a choices-only service instead.
        ADMIN_SAMPLE_SERVICES.push({ slug: slug, name: name, category: category, basePrice: price, unit: unit, active: true, needsTemplate: needsTemplate, choices: [] });
        if (needsTemplate && templateName && typeof addTemplateToService === 'function') addTemplateToService(slug, templateName);
        hqPersistServices();
        hqPersistTemplates();

        [nameInput, categoryInput, priceInput, unitInput, templateInput].forEach(function (el) { el.value = ''; });
        if (needsTemplateCheckbox) needsTemplateCheckbox.checked = true;
        syncTemplateFieldVisibility();

        closeAddServiceModal();
        renderServices();
      });
    }
  }

  /* ---------------------------------------------------------------------
     Templates page (all templates across services, card grid)
  --------------------------------------------------------------------- */
  const templatesCardGrid = document.getElementById('templatesCardGrid');
  if (templatesCardGrid && typeof ADMIN_SAMPLE_SERVICES !== 'undefined') {
    const searchInput = document.getElementById('templatesSearch');
    const serviceFilter = document.getElementById('templatesServiceFilter');
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    const addTemplateModal = document.getElementById('addTemplateModal');
    const newTemplateServiceSelect = document.getElementById('newTemplateService');

    function serviceHasTemplates(s) {
      return typeof getServiceTemplates === 'function' && getServiceTemplates(s.slug).length > 0;
    }

    // undefined (legacy services) counts as needing a template, matching
    // the old behavior before this flag existed.
    function serviceNeedsTemplate(s) {
      return s.needsTemplate !== false;
    }

    // A service shows up here as soon as it's flagged "needs a
    // design/template" — even with zero designs yet — or once it already
    // has at least one design (covers older services saved without the
    // flag). Choices-only services (needsTemplate === false) stay off
    // this page entirely.
    function populateServiceFilterOptions() {
      if (!serviceFilter) return;
      const currentValue = serviceFilter.value;
      serviceFilter.innerHTML = '<option value="all">All Services</option>';
      ADMIN_SAMPLE_SERVICES.filter(function (s) { return serviceNeedsTemplate(s) || serviceHasTemplates(s); }).forEach(function (s) {
        const opt = document.createElement('option');
        opt.value = s.slug;
        opt.textContent = s.name;
        serviceFilter.appendChild(opt);
      });
      serviceFilter.value = Array.from(serviceFilter.options).some(function (o) { return o.value === currentValue; })
        ? currentValue
        : 'all';
    }

    // The "Add Template" service picker only lists services that actually
    // need a design — choices-only services (sizes, etc.) don't belong
    // here since they don't use visual templates.
    function populateNewTemplateServiceOptions() {
      if (!newTemplateServiceSelect) return;
      newTemplateServiceSelect.innerHTML = ADMIN_SAMPLE_SERVICES.filter(serviceNeedsTemplate).map(function (s) {
        return '<option value="' + s.slug + '">' + s.name + '</option>';
      }).join('');
    }

    // Flatten every service's templates into one list, each tagged with
    // its parent service, so they can all be browsed/filtered together.
    function buildTemplateList() {
      const list = [];
      ADMIN_SAMPLE_SERVICES.forEach(function (s) {
        const names = typeof getServiceTemplates === 'function' ? getServiceTemplates(s.slug) : [];
        names.forEach(function (name) {
          list.push({ name: name, serviceName: s.name, serviceSlug: s.slug });
        });
      });
      return list;
    }

    function renderTemplates() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const serviceSlug = serviceFilter ? serviceFilter.value : 'all';

      const filtered = buildTemplateList().filter(function (t) {
        const matchesService = serviceSlug === 'all' || t.serviceSlug === serviceSlug;
        const matchesQuery = !query || t.name.toLowerCase().includes(query);
        return matchesService && matchesQuery;
      });

      if (filtered.length === 0) {
        templatesCardGrid.innerHTML = '<div class="admin-table-empty">No templates match your search/filter. Add a design to a service to get started.</div>';
        return;
      }

      templatesCardGrid.innerHTML = filtered.map(function (t, index) {
        return '<div class="admin-service-card">' +
          '<div class="admin-service-card-image" style="background-image:url(\'https://picsum.photos/seed/tpl-' + t.serviceSlug + '-' + index + '/400/300\');"></div>' +
          '<div class="admin-service-card-body">' +
            '<span class="admin-service-card-category">' + t.serviceName + '</span>' +
            '<h3>' + t.name + '</h3>' +
          '</div>' +
          '<div class="admin-service-card-footer">' +
            '<span class="admin-service-template-count"><i class="fa-solid fa-boxes-stacked"></i> ' + t.serviceName + '</span>' +
            '<div class="admin-service-card-actions">' +
              '<button type="button" class="admin-row-action" aria-label="Edit template"><i class="fa-solid fa-pen"></i></button>' +
              '<button type="button" class="admin-row-action" aria-label="Delete template"><i class="fa-solid fa-trash"></i></button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    if (searchInput) searchInput.addEventListener('input', renderTemplates);
    if (serviceFilter) serviceFilter.addEventListener('change', renderTemplates);

    if (addTemplateBtn && addTemplateModal) {
      const closeAddTemplateModal = function () { addTemplateModal.classList.remove('is-open'); };

      addTemplateBtn.addEventListener('click', function () {
        populateNewTemplateServiceOptions();
        addTemplateModal.classList.add('is-open');
      });
      document.getElementById('addTemplateModalClose').addEventListener('click', closeAddTemplateModal);
      document.getElementById('addTemplateCancel').addEventListener('click', closeAddTemplateModal);
      addTemplateModal.addEventListener('click', function (e) { if (e.target === addTemplateModal) closeAddTemplateModal(); });

      document.getElementById('addTemplateSubmit').addEventListener('click', function () {
        const slug = newTemplateServiceSelect.value;
        const nameInput = document.getElementById('newTemplateName');
        const templateName = nameInput.value.trim();

        if (!slug || !templateName) {
          alert('Please choose a service and enter a template name.');
          return;
        }

        if (typeof addTemplateToService === 'function') addTemplateToService(slug, templateName);
        hqPersistTemplates();

        nameInput.value = '';
        closeAddTemplateModal();
        populateServiceFilterOptions();
        renderTemplates();
      });
    }

    populateServiceFilterOptions();
    renderTemplates();
  }

});
