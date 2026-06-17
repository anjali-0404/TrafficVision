/* ============================================================
   violations.js — Mock Violation Records (500+ entries)
   TrafficVision AI
   ============================================================ */

const VIOLATION_TYPES = [
  { id: 'helmet',   label: 'Helmet Non-Compliance', icon: '🪖', color: '#ef4444', severity: 'high' },
  { id: 'seatbelt', label: 'Seatbelt Violation',    icon: '🔒', color: '#f59e0b', severity: 'medium' },
  { id: 'triple',   label: 'Triple Riding',          icon: '🏍️', color: '#8b5cf6', severity: 'high' },
  { id: 'wrongside',label: 'Wrong Side Driving',     icon: '⬅️', color: '#ec4899', severity: 'high' },
  { id: 'redlight', label: 'Red Light Jumping',      icon: '🚦', color: '#ef4444', severity: 'high' },
  { id: 'parking',  label: 'Illegal Parking',        icon: '🅿️', color: '#3b82f6', severity: 'low' },
  { id: 'stopline', label: 'Stop Line Violation',    icon: '🛑', color: '#f97316', severity: 'medium' },
];

const LOCATIONS = [
  { name: 'SG Highway Junction',       lat: 23.0469, lng: 72.5293, risk: 95 },
  { name: 'Sardar Bridge Approach',    lat: 23.0225, lng: 72.5714, risk: 87 },
  { name: 'Satellite Road Crossing',   lat: 23.0303, lng: 72.5173, risk: 78 },
  { name: 'Nehru Bridge North',        lat: 23.0196, lng: 72.5855, risk: 72 },
  { name: 'Drive-in Road Junction',    lat: 23.0505, lng: 72.5340, risk: 91 },
  { name: 'Paldi Intersection',        lat: 23.0015, lng: 72.5668, risk: 65 },
  { name: 'Maninagar Crossroads',      lat: 22.9884, lng: 72.6057, risk: 70 },
  { name: 'Vasna Bridge',              lat: 23.0015, lng: 72.5442, risk: 58 },
  { name: 'Naranpura Circle',          lat: 23.0614, lng: 72.5468, risk: 82 },
  { name: 'Bopal Chokdi',              lat: 23.0311, lng: 72.4674, risk: 74 },
  { name: 'Thaltej Crossroads',        lat: 23.0603, lng: 72.5113, risk: 89 },
  { name: 'Chandkheda Junction',       lat: 23.1119, lng: 72.5718, risk: 62 },
  { name: 'ISCON Temple Road',         lat: 23.0226, lng: 72.5069, risk: 76 },
  { name: 'Ambawadi Circle',           lat: 23.0259, lng: 72.5479, risk: 68 },
  { name: 'Science City Road',         lat: 23.0781, lng: 72.5370, risk: 80 },
  { name: 'Prahlad Nagar Junction',    lat: 23.0170, lng: 72.5060, risk: 85 },
  { name: 'Gota Interchange',          lat: 23.0988, lng: 72.5432, risk: 73 },
  { name: 'Nikol Road',                lat: 23.0474, lng: 72.6277, risk: 66 },
  { name: 'Vastral Flyover',           lat: 23.0254, lng: 72.6513, risk: 59 },
  { name: 'Naroda Industrial Area',    lat: 23.0830, lng: 72.6355, risk: 55 },
];

const VEHICLES = [
  'GJ01AB1234', 'GJ01CD5678', 'GJ05EF9012', 'GJ18GH3456', 'GJ01IJ7890',
  'GJ06KL1122', 'GJ01MN3344', 'GJ09OP5566', 'GJ12QR7788', 'GJ01ST9900',
  'MH12UV2211', 'MH04WX4433', 'RJ14YZ6655', 'DL07AA8877', 'KA05BB0099',
  'GJ01CC1357', 'GJ17DD2468', 'GJ01EE9753', 'GJ03FF8642', 'GJ21GG7531',
  'GJ01HH4680', 'GJ08II3579', 'GJ11JJ2468', 'GJ01KK1357', 'GJ15LL8642',
  'GJ01MM7531', 'GJ22NN6420', 'GJ01OO5319', 'GJ07PP4208', 'GJ01QQ3197',
];

const CAMERAS = [
  'CAM-SG-001', 'CAM-SG-002', 'CAM-SAT-001', 'CAM-NEH-001',
  'CAM-DRV-001', 'CAM-PAL-001', 'CAM-MAN-001', 'CAM-VAS-001',
  'CAM-NAR-001', 'CAM-BOP-001', 'CAM-THA-001', 'CAM-CHA-001',
];

function randInt(min, max)  { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, d=1) { return +(Math.random() * (max - min) + min).toFixed(d); }
function pick(arr)          { return arr[Math.floor(Math.random() * arr.length)]; }

function generateTimestamp(daysAgo = 0, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(randInt(0, 59));
  d.setSeconds(randInt(0, 59));
  return d;
}

function generateViolation(id, daysAgo = 0) {
  const vtype = pick(VIOLATION_TYPES);
  const loc   = pick(LOCATIONS);
  const plate = pick(VEHICLES);
  const ts    = generateTimestamp(daysAgo, randInt(0, 23));
  const conf  = randFloat(85, 99.8, 1);

  return {
    id: `VIO-${String(id).padStart(6, '0')}`,
    type: vtype.id,
    typeLabel: vtype.label,
    typeIcon: vtype.icon,
    typeColor: vtype.color,
    severity: vtype.severity,
    plate,
    location: loc.name,
    lat: loc.lat + randFloat(-0.002, 0.002, 4),
    lng: loc.lng + randFloat(-0.002, 0.002, 4),
    timestamp: ts,
    timeStr: ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    dateStr: ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    confidence: conf,
    camera: pick(CAMERAS),
    evidenceId: `EVD-${String(id).padStart(5, '0')}`,
    fineAmount: vtype.severity === 'high' ? randInt(1000, 2000) : vtype.severity === 'medium' ? randInt(500, 1000) : randInt(200, 500),
    status: pick(['Pending', 'Pending', 'Pending', 'Challan Issued', 'Paid', 'Under Review']),
    repeatOffender: Math.random() < 0.15,
  };
}

// Generate 600 violations spanning last 30 days
const VIOLATIONS_DB = [];
let vidx = 1;
for (let day = 0; day < 30; day++) {
  const count = randInt(15, 35);
  for (let i = 0; i < count; i++) {
    VIOLATIONS_DB.push(generateViolation(vidx++, day));
  }
}

// Sort by timestamp descending
VIOLATIONS_DB.sort((a, b) => b.timestamp - a.timestamp);

// ─── Aggregates ───────────────────────────────────────────
function getViolationsByType() {
  const map = {};
  VIOLATION_TYPES.forEach(v => { map[v.id] = 0; });
  VIOLATIONS_DB.forEach(v => { if (map[v.type] !== undefined) map[v.type]++; });
  return map;
}

function getTodayViolations() {
  const today = new Date().toDateString();
  return VIOLATIONS_DB.filter(v => v.timestamp.toDateString() === today);
}

function getViolationsLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      count: VIOLATIONS_DB.filter(v => v.timestamp.toDateString() === ds).length,
      date: d,
    });
  }
  return days;
}

function getViolationsLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    days.push({
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      count: VIOLATIONS_DB.filter(v => v.timestamp.toDateString() === ds).length,
    });
  }
  return days;
}

function getHourlyDistribution() {
  const hours = new Array(24).fill(0);
  VIOLATIONS_DB.forEach(v => {
    hours[v.timestamp.getHours()]++;
  });
  return hours;
}

function getPeakHoursGrid() {
  // Returns [day][hour] matrix
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const matrix = days.map(() => new Array(24).fill(0));
  VIOLATIONS_DB.forEach(v => {
    const d = (v.timestamp.getDay() + 6) % 7; // Mon=0
    const h = v.timestamp.getHours();
    matrix[d][h]++;
  });
  return { days, matrix };
}

function getRepeatOffenders() {
  const plateCounts = {};
  VIOLATIONS_DB.forEach(v => {
    if (!plateCounts[v.plate]) plateCounts[v.plate] = { plate: v.plate, count: 0, violations: [], lastSeen: v.timestamp };
    plateCounts[v.plate].count++;
    plateCounts[v.plate].violations.push(v.type);
    if (v.timestamp > plateCounts[v.plate].lastSeen) plateCounts[v.plate].lastSeen = v.timestamp;
  });
  return Object.values(plateCounts)
    .filter(p => p.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

function getLocationRiskScores() {
  const locCounts = {};
  VIOLATIONS_DB.forEach(v => {
    if (!locCounts[v.location]) locCounts[v.location] = { name: v.location, count: 0 };
    locCounts[v.location].count++;
  });
  return Object.values(locCounts).sort((a, b) => b.count - a.count);
}

// Export
window.TrafficData = {
  VIOLATIONS_DB,
  VIOLATION_TYPES,
  LOCATIONS,
  VEHICLES,
  CAMERAS,
  getViolationsByType,
  getTodayViolations,
  getViolationsLast7Days,
  getViolationsLast30Days,
  getHourlyDistribution,
  getPeakHoursGrid,
  getRepeatOffenders,
  getLocationRiskScores,
  randInt, randFloat, pick,
  generateViolation,
};
