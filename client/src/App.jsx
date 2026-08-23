import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import MapView from "./pages/MapView";
import Lander from "./pages/Lander";
import About from "./pages/About";
import Community from "./pages/Community";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./components/common/NotFound";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/track/:vehicleId" element={<Lander />} />
      <Route path="/about" element={<About />} />
      <Route path="/community" element={<Community />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
