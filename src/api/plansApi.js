// API layer for STEMMate Namibia (Role 3).
// Components never touch localStorage or fetch directly: they call these functions.
//
// Two modes:
//  - No VITE_API_BASE_URL set  -> device-only mode (localStorage is the "database").
//  - VITE_API_BASE_URL set     -> offline-first: save on device first, then sync to the REST API.
//
// ASSUMED endpoints (change to match the real backend contract):
//   GET   /activities        -> [{ id, title, subject, duration, materials }]
//   POST  /plans             -> body: plan object, returns saved plan
//   PATCH /plans/:id         -> body: { notes }, returns saved plan

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const STORAGE_KEY = 'stemmate_plans';
const BACKUP_KEY = 'stemmate_plans_backup';

export const HAS_BACKEND = Boolean(BASE_URL);
export const STATUS = {
  DEVICE: 'Saved on device',
  PENDING: 'Sync pending',
  SYNCED: 'Synced',
};

const FALLBACK_ACTIVITIES = [
  { id: 'act-1', title: 'DIY Water Filter', duration: '45 mins', materials: ['Plastic Bottles', 'Sand', 'Charcoal'], subject: 'Science' },
  { id: 'act-2', title: 'Simple Circuits', duration: '30 mins', materials: ['Batteries', 'Wire', 'Bulb'], subject: 'Physics' },
];

export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}

// ---------- HTTP helper ----------
async function http(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (cause) {
    throw new ApiError('Could not reach the server.', { cause });
  }
  if (!res.ok) throw new ApiError(`The server returned an error (${res.status}).`, { status: res.status });
  return res.status === 204 ? null : res.json();
}

// ---------- Local storage helpers ----------
function readLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { plans: [], recovered: false };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return { plans: parsed, recovered: false };
  } catch {
    // Recovery: keep a copy of the damaged data, then start clean.
    try {
      localStorage.setItem(BACKUP_KEY, raw);
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore, we still return an empty list */ }
    return { plans: [], recovered: true };
  }
}

function writeLocal(plans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (cause) {
    throw new ApiError('Could not save on this device (storage is full or blocked).', { cause });
  }
}

// ---------- Public API ----------
export async function getActivities() {
  if (!HAS_BACKEND) return FALLBACK_ACTIVITIES;
  try {
    return await http('/activities');
  } catch {
    // Offline or server down: fall back to the built-in catalogue so the app still works.
    return FALLBACK_ACTIVITIES;
  }
}

export async function listPlans() {
  return readLocal();
}

export async function createPlan({ activity, notes }, { online }) {
  const plan = {
    id: Date.now().toString(),
    title: `Plan for ${activity}`,
    activity,
    notes,
    date: new Date().toISOString(),
    status: HAS_BACKEND ? STATUS.PENDING : STATUS.DEVICE,
  };
  const { plans } = readLocal();
  writeLocal([...plans, plan]);

  if (HAS_BACKEND && online) {
    try {
      await http('/plans', { method: 'POST', body: JSON.stringify(plan) });
      return markSynced(plan.id);
    } catch { /* stays "Sync pending"; saved locally */ }
  }
  return plan;
}

export async function updatePlan(id, notes, { online }) {
  const { plans } = readLocal();
  if (!plans.some((p) => p.id === id)) throw new ApiError('That plan no longer exists.');
  const next = plans.map((p) =>
    p.id === id ? { ...p, notes, status: HAS_BACKEND ? STATUS.PENDING : STATUS.DEVICE } : p,
  );
  writeLocal(next);

  if (HAS_BACKEND && online) {
    try {
      await http(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify({ notes }) });
      return markSynced(id);
    } catch { /* stays pending */ }
  }
  return next.find((p) => p.id === id);
}

// Push everything marked "Sync pending". Returns the full updated list.
export async function syncPending() {
  const { plans } = readLocal();
  if (!HAS_BACKEND) return plans;
  for (const plan of plans.filter((p) => p.status === STATUS.PENDING)) {
    try {
      await http('/plans', { method: 'POST', body: JSON.stringify(plan) });
      markSynced(plan.id);
    } catch {
      break; // still offline or server down; try again next time
    }
  }
  return readLocal().plans;
}

function markSynced(id) {
  const { plans } = readLocal();
  const next = plans.map((p) => (p.id === id ? { ...p, status: STATUS.SYNCED } : p));
  writeLocal(next);
  return next.find((p) => p.id === id);
}
