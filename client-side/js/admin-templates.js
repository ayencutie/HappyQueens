// Admin panel — Templates hub page only (service directory).
// Requires admin-data.js, template-store.js, and admin-common.js loaded first.

document.addEventListener('DOMContentLoaded', function () {

  const templatesCardGrid = document.getElementById('templatesCardGrid');
  if (!templatesCardGrid || typeof ADMIN_SAMPLE_SERVICES === 'undefined') return;

  const searchInput = document.getElementById('templatesSearch');

  // undefined (legacy services) counts as needing a template, matching
  // the old behavior before this flag existed.
  function serviceNeedsTemplate(s) {
    return s.needsTemplate !== false;
  }

  function templateCountFor(slug) {
    return hqTemplateFilesFor(slug).length;
  }

  function renderDirectory() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    const services = ADMIN_SAMPLE_SERVICES
      .filter(serviceNeedsTemplate)
      .filter(function (s) { return !query || s.name.toLowerCase().includes(query); });

    if (services.length === 0) {
      templatesCardGrid.innerHTML = '<div class="admin-table-empty">No services match your search.</div>';
      return;
    }

    templatesCardGrid.innerHTML = services.map(function (s) {
      const count = templateCountFor(s.slug);
      const imageStyle = s.image ? ' style="background-image:url(\'' + s.image.replace(/'/g, "\\'") + '\');"' : '';
      const imageInner = s.image ? '' : '<i class="fa-solid fa-image admin-service-card-image-noimg"></i>';
      return '<a href="admin-templates-' + s.slug + '.html" class="admin-service-card admin-service-card-link" style="text-decoration:none; color:inherit;">' +
        '<div class="admin-service-card-image"' + imageStyle + '>' + imageInner + '</div>' +
        '<div class="admin-service-card-body">' +
          '<span class="admin-service-card-category">' + s.category + '</span>' +
          '<h3>' + s.name + '</h3>' +
        '</div>' +
        '<div class="admin-service-card-footer">' +
          '<span class="admin-service-template-count"><i class="fa-solid fa-images"></i> ' + count + ' template' + (count === 1 ? '' : 's') + '</span>' +
          '<span class="admin-row-action" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  if (searchInput) searchInput.addEventListener('input', renderDirectory);

  renderDirectory();

});
