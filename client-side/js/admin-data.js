// Admin panel — sample/mock data (front-end demo only, no real backend).
// admin.js reads these globals directly, so they must load BEFORE admin.js.

/* Order status labels, in the order they should appear (tabs, dropdowns, etc.) */
const ADMIN_STATUS_LABELS = {
  'pending': 'Pending',
  'in-design': 'In Design',
  'printing': 'Printing',
  'packing': 'Packing',
  'out-for-delivery': 'Out for Delivery',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

/* Sample orders — shown on the Dashboard and Orders page */
const ADMIN_SAMPLE_ORDERS = [
  { id: 'HQ-1001', customer: 'Angela Reyes', service: 'Photo Magnet', qty: 12, total: 1800, payment: 'GCash', status: 'pending', date: '2026-08-24' },
  { id: 'HQ-1002', customer: 'Miguel Santos', service: 'Invitation Card', qty: 100, total: 3500, payment: 'Cash', status: 'in-design', date: '2026-08-25' },
  { id: 'HQ-1003', customer: 'Bea Fernandez', service: 'Tarpaulin', qty: 1, total: 450, payment: 'GCash', status: 'printing', date: '2026-08-25' },
  { id: 'HQ-1004', customer: 'Carlo Dizon', service: 'Photo Magnet', qty: 24, total: 3600, payment: 'Bank Transfer', status: 'packing', date: '2026-08-26' },
  { id: 'HQ-1005', customer: 'Nicole Torres', service: 'Invitation Card', qty: 50, total: 1750, payment: 'GCash', status: 'out-for-delivery', date: '2026-08-27' },
  { id: 'HQ-1006', customer: 'Ramon Cruz', service: 'Tarpaulin', qty: 2, total: 900, payment: 'Cash', status: 'completed', date: '2026-08-27' },
  { id: 'HQ-1007', customer: 'Trisha Manalo', service: 'Photo Magnet', qty: 6, total: 900, payment: 'GCash', status: 'cancelled', date: '2026-08-28' },
  { id: 'HQ-1008', customer: 'Angela Reyes', service: 'Invitation Card', qty: 150, total: 5250, payment: 'Bank Transfer', status: 'pending', date: '2026-08-29' }
];

/* Sample customers — shown on the Customers page */
const ADMIN_SAMPLE_CUSTOMERS = [
  { id: 'CUS-001', name: 'Angela Reyes', email: 'angela.reyes@example.com', phone: '0917 123 4567', orders: 2, joined: '2026-03-14' },
  { id: 'CUS-002', name: 'Miguel Santos', email: 'miguel.santos@example.com', phone: '0918 234 5678', orders: 1, joined: '2026-04-02' },
  { id: 'CUS-003', name: 'Bea Fernandez', email: 'bea.fernandez@example.com', phone: '0919 345 6789', orders: 1, joined: '2026-05-19' },
  { id: 'CUS-004', name: 'Carlo Dizon', email: 'carlo.dizon@example.com', phone: '0920 456 7890', orders: 1, joined: '2026-06-08' },
  { id: 'CUS-005', name: 'Nicole Torres', email: 'nicole.torres@example.com', phone: '0921 567 8901', orders: 1, joined: '2026-06-30' },
  { id: 'CUS-006', name: 'Ramon Cruz', email: 'ramon.cruz@example.com', phone: '0922 678 9012', orders: 1, joined: '2026-07-11' },
  { id: 'CUS-007', name: 'Trisha Manalo', email: 'trisha.manalo@example.com', phone: '0923 789 0123', orders: 1, joined: '2026-08-01' }
];

/* Sample services — shown on the Services page and linked from Templates.
   - needsTemplate: true  -> uses visual designs, appears on Templates page
   - needsTemplate: false -> "choices-only" service (e.g. sizes), no templates
   - occasions: [] means "use the default set" (Wedding, Birthday, Debut,
     Christening, Anniversary, Corporate, Other) — see template-store.js
   - optionGroups: the variants customers pick (size, color, finish, etc.)
   Slugs here match the existing per-service Template Manager pages
   (admin-templates-photo-magnet.html, admin-templates-invitation-card.html,
   admin-templates-tarpulin.html, admin-templates-mug-customized.html) and
   the service names already used in ADMIN_SAMPLE_ORDERS above.          */
const ADMIN_SAMPLE_SERVICES = [
  {
    slug: 'photo-magnet',
    name: 'Photo Magnet',
    category: 'Photo Souvenirs',
    basePrice: '150',
    unit: 'pc',
    active: true,
    needsTemplate: true,
    occasions: [],
    choices: [],
    optionGroups: [
      {
        name: 'Size',
        required: true,
        options: [
          { name: '2 x 2 in', priceDelta: 0 },
          { name: '2.5 x 3.5 in', priceDelta: 20 },
          { name: '4 x 6 in', priceDelta: 50 }
        ]
      },
      {
        name: 'Shape',
        required: true,
        options: [
          { name: 'Classic Round', priceDelta: 0 },
          { name: 'Heart', priceDelta: 10 },
          { name: 'Square', priceDelta: 0 }
        ]
      }
    ]
  },
  {
    slug: 'invitation-card',
    name: 'Invitation Card',
    category: 'Prints',
    basePrice: '150-200',
    unit: 'set of 50',
    active: true,
    needsTemplate: true,
    occasions: [],
    choices: [],
    optionGroups: [
      {
        name: 'Paper Finish',
        required: true,
        options: [
          { name: 'Matte', priceDelta: 0 },
          { name: 'Glossy', priceDelta: 0 },
          { name: 'Pearl Shimmer', priceDelta: 30 }
        ]
      },
      {
        name: 'Add-ons',
        required: false,
        options: [
          { name: 'Envelope', priceDelta: 15 },
          { name: 'Wax Seal', priceDelta: 25 }
        ]
      }
    ]
  },
  {
    slug: 'tarpulin',
    name: 'Tarpaulin',
    category: 'Signage',
    basePrice: '450',
    unit: 'pc',
    active: true,
    needsTemplate: true,
    occasions: [],
    choices: [],
    optionGroups: [
      {
        name: 'Size',
        required: true,
        options: [
          { name: '2 x 3 ft', priceDelta: 0 },
          { name: '3 x 4 ft', priceDelta: 150 },
          { name: '4 x 6 ft', priceDelta: 350 }
        ]
      },
      {
        name: 'Material',
        required: true,
        options: [
          { name: 'Standard Vinyl', priceDelta: 0 },
          { name: 'Fabric', priceDelta: 100 }
        ]
      }
    ]
  },
  {
    slug: 'mug-customized',
    name: 'Customized Mug',
    category: 'Personalized Items',
    basePrice: '180',
    unit: 'pc',
    active: true,
    needsTemplate: true,
    occasions: [],
    choices: [],
    optionGroups: [
      {
        name: 'Mug Color',
        required: true,
        options: [
          { name: 'White', priceDelta: 0 },
          { name: 'Black (Magic Mug)', priceDelta: 40 }
        ]
      },
      {
        name: 'Print Type',
        required: true,
        options: [
          { name: 'Full Wrap', priceDelta: 0 },
          { name: 'One Side Only', priceDelta: -20 }
        ]
      }
    ]
  }
];

/* Sample uploaded designs — shown in each service's Template Manager /
   Templates tab, keyed by service slug. Same shape a real upload
   produces (id, name, occasion, type, dataUrl, uploadedAt); dataUrl here
   is just a placeholder image instead of a real base64 upload. This is
   only the STARTING content of the in-memory design store in
   admin-common.js (hqTemplateFilesStore) — uploading, renaming,
   re-tagging, or deleting a design there does not edit this file, and a
   full page refresh resets everything back to these same samples.     */
const ADMIN_SAMPLE_TEMPLATE_FILES = {
  'photo-magnet': [
    { id: 'tpl-photo-magnet-1', name: 'Classic Round', occasion: 'Birthday', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-photo-magnet-1/400/300', uploadedAt: '2026-08-18T09:15:00.000Z' },
    { id: 'tpl-photo-magnet-2', name: 'Heart Shape', occasion: 'Anniversary', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-photo-magnet-2/400/300', uploadedAt: '2026-08-19T10:40:00.000Z' },
    { id: 'tpl-photo-magnet-3', name: 'Polaroid Style', occasion: 'Wedding', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-photo-magnet-3/400/300', uploadedAt: '2026-08-20T14:05:00.000Z' }
  ],
  'invitation-card': [
    { id: 'tpl-invitation-card-1', name: 'Elegant Gold', occasion: 'Wedding', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-invitation-card-1/400/300', uploadedAt: '2026-08-18T08:30:00.000Z' },
    { id: 'tpl-invitation-card-2', name: 'Floral Pastel', occasion: 'Birthday', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-invitation-card-2/400/300', uploadedAt: '2026-08-19T11:20:00.000Z' },
    { id: 'tpl-invitation-card-3', name: 'Minimalist White', occasion: 'Corporate', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-invitation-card-3/400/300', uploadedAt: '2026-08-21T16:50:00.000Z' }
  ],
  'tarpulin': [
    { id: 'tpl-tarpulin-1', name: 'Grand Opening Banner', occasion: 'Corporate', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-tarpulin-1/400/300', uploadedAt: '2026-08-17T13:10:00.000Z' },
    { id: 'tpl-tarpulin-2', name: 'Birthday Bash Backdrop', occasion: 'Birthday', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-tarpulin-2/400/300', uploadedAt: '2026-08-19T15:35:00.000Z' },
    { id: 'tpl-tarpulin-3', name: 'Debut Celebration Banner', occasion: 'Debut', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-tarpulin-3/400/300', uploadedAt: '2026-08-22T09:00:00.000Z' }
  ],
  'mug-customized': [
    { id: 'tpl-mug-customized-1', name: 'Couple Anniversary Mug', occasion: 'Anniversary', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-mug-customized-1/400/300', uploadedAt: '2026-08-18T10:05:00.000Z' },
    { id: 'tpl-mug-customized-2', name: 'Birthday Photo Mug', occasion: 'Birthday', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-mug-customized-2/400/300', uploadedAt: '2026-08-20T12:45:00.000Z' },
    { id: 'tpl-mug-customized-3', name: 'Corporate Logo Mug', occasion: 'Corporate', type: 'image/png', dataUrl: 'https://picsum.photos/seed/hq-mug-customized-3/400/300', uploadedAt: '2026-08-23T17:25:00.000Z' }
  ]
};
