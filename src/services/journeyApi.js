import axios from "axios";

// Prefer Vite env override so frontend can point to different backend ports locally
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// ── Axios Instance ────────────────────────────────────────────────────────────
export const axiosInstance = axios.create({
  baseURL: `${BASE}/api/`,
});

// Attach JWT token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("uber_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("uber_token");
      localStorage.removeItem("uber_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Journey API ───────────────────────────────────────────────────────────────
export const journeyApi = {
  // RIDER — create a new journey
  create: (data) => axiosInstance.post("journey", data).then((r) => r.data),

  // RIDER — get journey by id
  getById: (journeyId) =>
    axiosInstance.get(`journey/${journeyId}`).then((r) => r.data),

  // RIDER — history (optionally filtered by status)
  getRiderHistory: (status) =>
    axiosInstance
      .get("journey/rider/history", { params: status ? { status } : {} })
      .then((r) => r.data),

  // RIDER — cancel
  cancel: (journeyId, reason, cancelledBy = "RIDER") =>
    axiosInstance
      .post(`journey/${journeyId}/cancel`, { reason, cancelledBy })
      .then((r) => r.data),

  // RIDER — get payment QR
  getPaymentQR: (journeyId) =>
    axiosInstance.get(`journey/${journeyId}/payment-qr`).then((r) => r.data),

  // RIDER — confirm payment
  confirmPayment: (journeyId) =>
    axiosInstance
      .post(`journey/${journeyId}/confirm-payment`)
      .then((r) => r.data),

  // DRIVER — accept journey
  accept: (journeyId) =>
    axiosInstance
      .post(`journey/${journeyId}/accept`)
      .then((r) => r.data),

  // DRIVER — update status (ARRIVED | STARTED)
  updateStatus: (journeyId, status) =>
    axiosInstance
      .patch(`journey/${journeyId}/status`, { status })
      .then((r) => r.data),

  // DRIVER — complete journey
  complete: (journeyId, actualFare, distance, duration) =>
    axiosInstance
      .post(`journey/${journeyId}/complete`, { actualFare, distance, duration })
      .then((r) => r.data),

  // DRIVER — history
  getDriverHistory: (status) =>
    axiosInstance
      .get("journey/driver/history", { params: status ? { status } : {} })
      .then((r) => r.data),

  // RIDER — clear all history
  clearRiderHistory: () =>
    axiosInstance.delete("journey/rider/history").then((r) => r.data),

  // DRIVER — clear all history
  clearDriverHistory: () =>
    axiosInstance.delete("journey/driver/history").then((r) => r.data),
};