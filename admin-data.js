// Admin panel — sample data (front-end demo only)
// Swap this file for real API/database calls later — every admin page reads
// from these arrays only, so that's the one place to change.

const ADMIN_SAMPLE_ORDERS = [
  { id: 'HQ-3001', customer: 'Maria Santos', service: 'Business Card', qty: 100, total: 850, status: 'pending', payment: 'Unpaid', date: '2026-08-01' },
  { id: 'HQ-3002', customer: 'Jino Reyes', service: 'Invitation Card', qty: 50, total: 1750, status: 'in-design', payment: 'Down payment', date: '2026-08-01' },
  { id: 'HQ-3003', customer: 'Angel Cruz', service: 'ID Photo', qty: 8, total: 240, status: 'printing', payment: 'Paid', date: '2026-08-02' },
  { id: 'HQ-3004', customer: 'Paolo Ramos', service: 'Ref Magnets', qty: 20, total: 900, status: 'packing', payment: 'Paid', date: '2026-08-02' },
  { id: 'HQ-3005', customer: 'Kim Villanueva', service: 'Sticker', qty: 200, total: 1200, status: 'out-for-delivery', payment: 'Paid', date: '2026-08-03' },
  { id: 'HQ-3006', customer: 'Rico Bautista', service: 'Photo Print', qty: 15, total: 675, status: 'completed', payment: 'Paid', date: '2026-08-03' },
  { id: 'HQ-3007', customer: 'Trisha Ong', service: 'Keychains', qty: 30, total: 1050, status: 'completed', payment: 'Paid', date: '2026-08-04' },
  { id: 'HQ-3008', customer: 'Miguel Torres', service: 'Instax Photo Cards', qty: 12, total: 480, status: 'pending', payment: 'Unpaid', date: '2026-08-04' },
  { id: 'HQ-3009', customer: 'Ella Fernandez', service: 'Photo Strips', qty: 40, total: 800, status: 'in-design', payment: 'Down payment', date: '2026-08-05' },
  { id: 'HQ-3010', customer: 'Sam Dela Cruz', service: 'Documents', qty: 25, total: 375, status: 'completed', payment: 'Paid', date: '2026-08-05' },
  { id: 'HQ-3011', customer: 'Nica Aquino', service: 'Business Card', qty: 250, total: 1875, status: 'printing', payment: 'Paid', date: '2026-08-06' },
  { id: 'HQ-3012', customer: 'Justin Lim', service: 'Invitation Card', qty: 80, total: 2400, status: 'cancelled', payment: 'Refunded', date: '2026-08-06' },
];

const ADMIN_SAMPLE_CUSTOMERS = [
  { id: 'CUST-001', name: 'Maria Santos', email: 'maria.santos@example.com', phone: '0917 123 4567', orders: 3, joined: '2026-05-12' },
  { id: 'CUST-002', name: 'Jino Reyes', email: 'jino.reyes@example.com', phone: '0918 234 5678', orders: 1, joined: '2026-05-20' },
  { id: 'CUST-003', name: 'Angel Cruz', email: 'angel.cruz@example.com', phone: '0919 345 6789', orders: 2, joined: '2026-06-02' },
  { id: 'CUST-004', name: 'Paolo Ramos', email: 'paolo.ramos@example.com', phone: '0920 456 7890', orders: 1, joined: '2026-06-14' },
  { id: 'CUST-005', name: 'Kim Villanueva', email: 'kim.villanueva@example.com', phone: '0921 567 8901', orders: 4, joined: '2026-06-19' },
  { id: 'CUST-006', name: 'Rico Bautista', email: 'rico.bautista@example.com', phone: '0922 678 9012', orders: 2, joined: '2026-07-03' },
  { id: 'CUST-007', name: 'Trisha Ong', email: 'trisha.ong@example.com', phone: '0923 789 0123', orders: 1, joined: '2026-07-11' },
  { id: 'CUST-008', name: 'Miguel Torres', email: 'miguel.torres@example.com', phone: '0924 890 1234', orders: 1, joined: '2026-07-18' },
  { id: 'CUST-009', name: 'Ella Fernandez', email: 'ella.fernandez@example.com', phone: '0925 901 2345', orders: 2, joined: '2026-07-25' },
  { id: 'CUST-010', name: 'Sam Dela Cruz', email: 'sam.delacruz@example.com', phone: '0926 012 3456', orders: 1, joined: '2026-07-29' },
];

const ADMIN_SAMPLE_SERVICES = [
  { name: 'Documents', category: 'Printing', basePrice: 15, unit: 'per page', active: true },
  { name: 'Sticker', category: 'Crafts', basePrice: 6, unit: 'per piece', active: true },
  { name: 'Ref Magnets', category: 'Crafts', basePrice: 45, unit: 'per piece', active: true },
  { name: 'Key Chains', category: 'Crafts', basePrice: 35, unit: 'per piece', active: true },
  { name: 'ID Photo', category: 'Photo', basePrice: 30, unit: 'per set', active: true },
  { name: 'Instax Photo Cards', category: 'Photo', basePrice: 40, unit: 'per piece', active: true },
  { name: 'Photo Strips', category: 'Photo', basePrice: 20, unit: 'per strip', active: true },
  { name: 'Photo Print', category: 'Photo', basePrice: 45, unit: 'per piece', active: true },
  { name: 'Business Card', category: 'Cards', basePrice: 8.5, unit: 'per piece', active: true },
  { name: 'Invitation Card', category: 'Cards', basePrice: 35, unit: 'per piece', active: false },
];

const ADMIN_STATUS_LABELS = {
  'pending': 'Pending',
  'in-design': 'In Design',
  'printing': 'Printing',
  'packing': 'Packing',
  'out-for-delivery': 'Out for Delivery',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};
