
import MapView from './components/MapView';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Add from './components/map/Add';
import VehicleRoute from './pages/VehicleRoute';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path='/home' element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path='/mapp' element={<Add />} />
        <Route path="/vc" element={<VehicleRoute />} />
      </Routes>
    </>
  );
};

export default App;
