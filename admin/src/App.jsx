import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useAppContext } from "./contexts/AppContext";

function App() {
  const { isAdmin } = useAppContext();

  return (
    <BrowserRouter>
      <Routes>
        {/* Catch ALL routes */}
        <Route
          path="*"
          element={isAdmin ? <AdminDashboard /> : <AdminLogin />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
