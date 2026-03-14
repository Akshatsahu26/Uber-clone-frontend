import axios from "axios";

// ── Axios instance ─────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const axiosInstance = axios.create({
  baseURL: `${BASE}/api/`,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("uber_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {

      localStorage.removeItem("uber_token");
      localStorage.removeItem("uber_user");
      localStorage.removeItem("uber_role");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(err);
  }
);
// ── Driver Profile API ─────────────────────────────────────────────────────────
export const driverApi = {
  // POST /api/driver/register
  createProfile: (data) =>
    axiosInstance.post("driver/register", data).then((r) => r.data),

  // GET /api/driver/me
  getProfile: () =>
    axiosInstance.get("driver/me").then((r) => r.data),

  // PATCH /api/driver/me
  updateProfile: (data) =>
    axiosInstance.patch("driver/me", data).then((r) => r.data),

  // PATCH /api/driver/me/status  { isOnline: true | false }
  updateStatus: (isOnline) =>
    axiosInstance.patch("driver/me/status", { isOnline }).then((r) => r.data),

  // GET /api/driver/me/completion
  getCompletion: () =>
    axiosInstance.get("driver/me/completion").then((r) => r.data),
};

// ── Journey API (Driver side) ──────────────────────────────────────────────────
export const driverJourneyApi = {
  // GET available rides (REQUESTED status)
  getAvailableRides: () =>
    axiosInstance.get("journey/available").then((r) => r.data),

  // POST /api/journey/:id/accept
  acceptRide: (journeyId) =>
    axiosInstance.post(`journey/${journeyId}/accept`).then((r) => r.data),

  // PATCH /api/journey/:id/status  { status: 'ARRIVED' | 'STARTED' }
  updateRideStatus: (journeyId, status) =>
    axiosInstance.patch(`journey/${journeyId}/status`, { status }).then((r) => r.data),

  // POST /api/journey/:id/complete
  completeRide: (journeyId, actualFare, distance, duration) =>
    axiosInstance
      .post(`journey/${journeyId}/complete`, { actualFare, distance, duration })
      .then((r) => r.data),

  // GET /api/journey/driver/history
  getHistory: (status = null) =>
    axiosInstance
      .get("journey/driver/history", { params: status ? { status } : {} })
      .then((r) => r.data),

  // GET single journey
  getById: (journeyId) =>
    axiosInstance.get(`journey/${journeyId}`).then((r) => r.data),
};