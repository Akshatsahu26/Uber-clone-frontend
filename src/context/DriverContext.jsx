import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { driverApi, driverJourneyApi } from "../services/driverApi";

const DriverContext = createContext(null);

export function DriverProvider({ children }) {
  const [driver, setDriver]         = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [available, setAvailable]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [isOnline, setIsOnline]     = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Ref to track if the component is still mounted — prevents state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Ref to hold latest isOnline without recreating fetchAvailable on every toggle
  const isOnlineRef = useRef(isOnline);
  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);

  const loadProfile = useCallback(async () => {
    try {
      const res = await driverApi.getProfile();
      if (!mountedRef.current) return;
      if (res.success) {
        setDriver(res.data);
        setIsOnline(res.data.status?.isOnline ?? false);
        setNeedsSetup(false);
      }
    } catch (e) {
      if (!mountedRef.current) return;
      const status = e.response?.status;
      if (status === 404 || status === 403) {
        setNeedsSetup(true);
        setError("");
      } else {
        setError(e.response?.data?.message || "Failed to load driver profile.");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const toggleStatus = useCallback(async () => {
    try {
      const res = await driverApi.updateStatus(!isOnlineRef.current);
      if (!mountedRef.current) return;
      if (res.success) {
        setIsOnline(res.data.status.isOnline);
        setDriver(res.data);
      }
    } catch (e) {
      if (mountedRef.current)
        setError(e.response?.data?.message || "Failed to update status.");
    }
  }, []);

  // fetchAvailable uses a ref for isOnline — stable function, no deps that recreate it
  const fetchAvailable = useCallback(async () => {
    if (!isOnlineRef.current) { setAvailable([]); return; }
    try {
      const res = await driverJourneyApi.getAvailableRides();
      if (mountedRef.current && res.success) setAvailable(res.data);
    } catch (err) {
      // swallow to avoid UI crash loops but log once
      console.warn("fetchAvailable failed", err?.response?.data || err?.message || err);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Only poll when profile is loaded and driver needs no setup
  useEffect(() => {
    if (loading || needsSetup) return;
    fetchAvailable();
    const id = setInterval(fetchAvailable, 6000);
    return () => clearInterval(id);
  }, [loading, needsSetup, fetchAvailable]);

  return (
    <DriverContext.Provider value={{
      driver, setDriver, loading, error,
      isOnline, toggleStatus,
      available, fetchAvailable,
      activeRide, setActiveRide,
      needsSetup, loadProfile,
    }}>
      {children}
    </DriverContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDriver = () => {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDriver must be used inside DriverProvider");
  return ctx;
};