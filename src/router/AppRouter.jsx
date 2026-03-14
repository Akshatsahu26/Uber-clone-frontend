// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import HomePage from "../pages/HomePage";
// import HelpPage from "../pages/HelpPage";
// import RideStatusPage from "../pages/RideStatusPage";
// import RideHistoryPage from "../pages/RideHistoryPage";
// import DriverDashboard from "../pages/driver/DriverDashboard";
// import DriverSetupPage from "../pages/driver/DriverSetup";
// import { DriverProvider } from "../context/DriverContext";

// function PrivateRoute({ children }) {
//   const token = localStorage.getItem("uber_token");
//   return token ? children : <Navigate to="/login" replace />;
// }
// // function PublicRoute({ children }) {
// //   const token = localStorage.getItem("uber_token");
// //   return token ? <Navigate to="/home" replace /> : children;
// // }

// function PublicRoute({ children }) {
//   const token = localStorage.getItem("uber_token");

//   if (token) {
//     const role = localStorage.getItem("uber_role");

//     if (role === "DRIVER") {
//       return <Navigate to="/driver/dashboard" replace />;
//     }

//     return <Navigate to="/home" replace />;
//   }

//   return children;
// }
// function DriverRoute({ children }) {
//   const token = localStorage.getItem("uber_token");
//   if (!token) return <Navigate to="/login" replace />;
//   return <DriverProvider>{children}</DriverProvider>;
// }

// export default function AppRouter({ LoginPage, SignupPage }) {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login"  element={<PublicRoute>{LoginPage  ? <LoginPage />  : <Placeholder name="LoginPage"  />}</PublicRoute>} />
//         <Route path="/signup" element={<PublicRoute>{SignupPage ? <SignupPage /> : <Placeholder name="SignupPage" />}</PublicRoute>} />
//         <Route path="/home"            element={<PrivateRoute><HomePage /></PrivateRoute>} />
//         <Route path="/help"            element={<PrivateRoute><HelpPage /></PrivateRoute>} />
//         <Route path="/ride/:journeyId" element={<PrivateRoute><RideStatusPage /></PrivateRoute>} />
//         <Route path="/history"         element={<PrivateRoute><RideHistoryPage /></PrivateRoute>} />
//         <Route path="/driver/setup"     element={<PrivateRoute><DriverSetupPage /></PrivateRoute>} />
//         <Route path="/driver/dashboard" element={<DriverRoute><DriverDashboard /></DriverRoute>} />
//         <Route path="*" element={<Navigate to="/home" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// function Placeholder({ name }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-zinc-50">
//       <p className="text-zinc-500 text-sm">Pass <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">{name}</code> to AppRouter.</p>
//     </div>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UberAuth from "../pages/Auth";
import HomePage from "../pages/HomePage";
import HelpPage from "../pages/HelpPage";
import RideStatusPage from "../pages/RideStatusPage";
import RideHistoryPage from "../pages/RideHistoryPage";
import DriverDashboard from "../pages/driver/DriverDashboard";
import DriverSetupPage from "../pages/driver/DriverSetup";
import { DriverProvider } from "../context/DriverContext";

// 🔒 Private route (login required)
function PrivateRoute({ children }) {
  const token = localStorage.getItem("uber_token");
  return token ? children : <Navigate to="/login" replace />;
}

// 🌐 Public route (login/signup page)
function PublicRoute({ children }) {
  const token = localStorage.getItem("uber_token");

  if (token) {
    const role = localStorage.getItem("uber_role");

    if (role === "DRIVER") {
      return <Navigate to="/driver/dashboard" replace />;
    }

    return <Navigate to="/home" replace />;
  }

  return children;
}

// 🚗 Driver route
function DriverRoute({ children }) {
  const token = localStorage.getItem("uber_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <DriverProvider>{children}</DriverProvider>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <UberAuth />
            </PublicRoute>
          }
        />

        {/* Rider pages */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/help"
          element={
            <PrivateRoute>
              <HelpPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/ride/:journeyId"
          element={
            <PrivateRoute>
              <RideStatusPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <RideHistoryPage />
            </PrivateRoute>
          }
        />

        {/* Driver pages */}
        <Route
          path="/driver/setup"
          element={
            <PrivateRoute>
              <DriverSetupPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/driver/dashboard"
          element={
            <DriverRoute>
              <DriverDashboard />
            </DriverRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

