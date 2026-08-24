import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "./components/common/Loader";
import ProtectedRoute from "./components/common/ProtectedRoute";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Home = lazy(() => import("./pages/Home"));
const MapView = lazy(() => import("./pages/MapView"));
const Lander = lazy(() => import("./pages/Lander"));
const About = lazy(() => import("./pages/About"));
const Community = lazy(() => import("./pages/Community"));
const NotFound = lazy(() => import("./components/common/NotFound"));

const App = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        } />
        <Route path="/track/:vehicleId" element={
            <Lander />
        } />
        <Route path="/about" element={<About />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
