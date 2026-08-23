import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import Lander from "./pages/Lander";
import About from "./pages/About";
import Community from "./pages/Community";
import NotFound from "./components/common/NotFound";
import ProtectedRoute from "./components/common/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/map" element={
        <ProtectedRoute>
          <MapView />
        </ProtectedRoute>
      } />
      <Route path="/track/:vehicleId" element={
        <ProtectedRoute>
          <Lander />
        </ProtectedRoute>
      } />
      <Route path="/about" element={<About />} />
      <Route path="/community" element={<Community />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
