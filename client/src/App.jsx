
import MapView from './pages/MapView';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Lander from './pages/Lander';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path='/home' element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/track/:vehicleId" element={<Lander />} />

      </Routes>
    </>
  );
};

export default App;
