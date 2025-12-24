import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AllUsers from "./pages/AllUsers";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Catch ALL routes */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/all-users" element={<AllUsers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
