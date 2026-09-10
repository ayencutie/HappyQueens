// Admin panel — shared helpers used by every admin page.
// Load order matters: admin-data.js, template-store.js, admin-common.js,
// THEN the page-specific file (admin-services.js / admin-templates.js / admin.js).

function formatPeso(amount) {
  // Base Price can be a plain number ("150") or a range ("150-200") —
  // Number() on a range string is NaN, so split and format each side.
  if (typeof amount === 'string' && amount.indexOf('-') !== -1) {
    const parts = amount.split('-').map(function (p) { return p.trim(); });
    if (parts.length === 2 && parts.every(function (p) { return p !== '' && !isNaN(Number(p)); })) {
      return parts.map(function (p) { return '₱' + Number(p).toLocaleString('en-PH'); }).join(' – ');
    }
  }
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
   In-memory only (no localStorage) — there's no real backend/database
   here. Everything the admin adds (services, choices, uploaded designs)
   lives only in memory for the current page load: it survives while
   you're using the app, but a full page refresh resets everything back
   to the hardcoded sample data. hqPersistServices()/hqPersistTemplates()
   are kept as no-ops (rather than removed) so every page that already
   calls them after an edit keeps working without changes — the actual
   source of truth is just the in-memory ADMIN_SAMPLE_SERVICES array and
   ADMIN_TEMPLATE_STORE object, which already hold the live data as soon
   as they're mutated.
--------------------------------------------------------------------- */
function hqPersistServices() {
  // No-op: ADMIN_SAMPLE_SERVICES is already the live in-memory list.
}

function hqPersistTemplates() {
  // No-op: ADMIN_TEMPLATE_STORE (template-store.js) is already the live
  // in-memory list.
}

/* ---------------------------------------------------------------------
   Shared per-service uploaded design files — the actual designs (with
   id, name, occasion, file type, and base64 image data) that customers
   pick from. This is the ONE store both the Services page's Templates
   tab and each service's own Template Manager page
   (admin-templates-<slug>.html) read from and write to, so uploading,
   renaming, re-tagging the occasion, or deleting a design in either
   place shows up the same way in both. Kept in memory only — it resets
   on page refresh, same as everything else in this demo.
--------------------------------------------------------------------- */
const HQ_TEMPLATE_MAX_SIZE = 20 * 1024 * 1024; // 20MB
const HQ_TEMPLATE_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'application/pdf', 'image/svg+xml'];
const HQ_DEFAULT_OCCASIONS = ['Wedding', 'Birthday', 'Debut', 'Christening', 'Anniversary', 'Corporate', 'Other'];

// Seeded from ADMIN_SAMPLE_TEMPLATE_FILES (admin-data.js) so the
// Templates pages show example designs right away. Still fully
// in-memory only — uploading, renaming, re-tagging, or deleting a
// design here never edits admin-data.js, and a full page refresh
// resets everything back to those same samples. Cloned (not the same
// reference) so mutating this store never touches the original sample
// data used to seed it.
let hqTemplateFilesStore = (typeof ADMIN_SAMPLE_TEMPLATE_FILES !== 'undefined')
  ? JSON.parse(JSON.stringify(ADMIN_SAMPLE_TEMPLATE_FILES))
  : {};

function hqLoadTemplateFiles() {
  return hqTemplateFilesStore;
}
function hqSaveTemplateFiles(map) {
  hqTemplateFilesStore = map;
}
function hqTemplateFilesFor(slug) {
  const map = hqLoadTemplateFiles();
  return Array.isArray(map[slug]) ? map[slug] : [];
}

// The occasion tags a service's designs can be filed under — its own
// custom list if it has one, otherwise the shared default set.
function hqServiceOccasions(service) {
  if (typeof getServiceOccasions === 'function') return getServiceOccasions(service);
  return (service && Array.isArray(service.occasions) && service.occasions.length) ? service.occasions : HQ_DEFAULT_OCCASIONS;
}

// "Other" if the list has it, otherwise just the first occasion — used
// to pre-fill new uploads before the admin picks a specific one.
function hqDefaultOccasionFor(occasions) {
  if (!Array.isArray(occasions) || !occasions.length) return 'Other';
  return occasions.indexOf('Other') !== -1 ? 'Other' : occasions[0];
}

function hqReadFileAsDataUrl(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

});
