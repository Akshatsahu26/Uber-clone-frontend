export const BASE_URL = "https://uber-clone-backend-t3gh.onrender.com";


const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("uber_token") || ""}`,
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) =>
    fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  login: (data) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};

// ── Journey (Rider) ───────────────────────────────────────────────────────────
export const journeyAPI = {
  // POST /api/journey
  create: (data) =>
    fetch(`${BASE_URL}/api/journey`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // GET /api/journey/:id
  getById: (journeyId) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // GET /api/journey/rider/history?status=
  getRiderHistory: (status = null) => {
    const url = status
      ? `${BASE_URL}/api/journey/rider/history?status=${status}`
      : `${BASE_URL}/api/journey/rider/history`;
    return fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());
  },

  // POST /api/journey/:id/cancel
  cancel: (journeyId, reason, cancelledBy) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason, cancelledBy }),
    }).then((r) => r.json()),

  // GET /api/journey/:id/payment-qr
  getPaymentQR: (journeyId) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}/payment-qr`, {
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // POST /api/journey/:id/confirm-payment
  confirmPayment: (journeyId) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}/confirm-payment`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).then((r) => r.json()),
};

// ── Journey (Driver) ──────────────────────────────────────────────────────────
export const driverJourneyAPI = {
  // POST /api/journey/:id/accept
  accept: (journeyId) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}/accept`, {
      method: "POST",
      headers: getAuthHeaders(),
    }).then((r) => r.json()),

  // PATCH /api/journey/:id/status  { status: 'ARRIVED' | 'STARTED' }
  updateStatus: (journeyId, status) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).then((r) => r.json()),

  // POST /api/journey/:id/complete
  complete: (journeyId, actualFare, distance, duration) =>
    fetch(`${BASE_URL}/api/journey/${journeyId}/complete`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ actualFare, distance, duration }),
    }).then((r) => r.json()),

  // GET /api/journey/driver/history?status=
  getDriverHistory: (status = null) => {
    const url = status
      ? `${BASE_URL}/api/journey/driver/history?status=${status}`
      : `${BASE_URL}/api/journey/driver/history`;
    return fetch(url, { headers: getAuthHeaders() }).then((r) => r.json());
  },
};