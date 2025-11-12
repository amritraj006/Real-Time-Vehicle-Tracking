
import MapView from './components/MapView';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Add from './components/map/Add';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path='/home' element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path='/mapp' element={<Add />} />
      </Routes>
    </>
  );
};

export default App;
