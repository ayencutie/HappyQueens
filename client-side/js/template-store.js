// Admin panel — template store (front-end demo only, no real backend).
// Keeps each service's list of design/template names in memory only,
// keyed by service slug — no localStorage, so this resets on a full
// page refresh, same as the rest of the demo. admin.js calls
// getServiceTemplates() / addTemplateToService() directly against this
// in-memory shape.

const ADMIN_TEMPLATE_STORE = {
  'photo-magnet': ['Classic Round', 'Heart Shape', 'Polaroid Style'],
  'invitation-card': ['Elegant Gold', 'Floral Pastel', 'Minimalist White'],
  'tarpulin': ['Grand Opening Banner', 'Birthday Bash Backdrop', 'Debut Celebration Banner'],
  'mug-customized': ['Couple Anniversary Mug', 'Birthday Photo Mug', 'Corporate Logo Mug']
};

// Fallback occasion tags used when a service doesn't have its own custom
// list yet (e.g. older services added before this feature existed, or a
// new service left with no occasions set). Each service can define its
// own list instead — see ADMIN_SAMPLE_SERVICES[i].occasions.
const ADMIN_DEFAULT_OCCASIONS = ['Wedding', 'Birthday', 'Debut', 'Christening', 'Anniversary', 'Corporate', 'Other'];

// Returns the occasion tags to use for a given service: its own custom
// list if it has one, otherwise the shared default list.
function getServiceOccasions(service) {
  return (service && Array.isArray(service.occasions) && service.occasions.length)
    ? service.occasions
    : ADMIN_DEFAULT_OCCASIONS;
}

function getServiceTemplates(slug) {
  if (!ADMIN_TEMPLATE_STORE[slug]) ADMIN_TEMPLATE_STORE[slug] = [];
  return ADMIN_TEMPLATE_STORE[slug];
}

function addTemplateToService(slug, name) {
  if (!name) return;
  const list = getServiceTemplates(slug);
  const exists = list.some(function (t) { return t.toLowerCase() === name.toLowerCase(); });
  if (!exists) list.push(name);
  return list;
}
