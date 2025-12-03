import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { useEffect, useState } from "react";

const Lander = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const [vehicle, setVehicle] = useState(null);
  const api = "YOUR_BACKEND_URL"; // change this

  useEffect(() => {
    if (!vehicleId) return;

    axios.get(`${api}/vehicles/single/${vehicleId}`)
      .then(res => setVehicle(res.data))
      .catch(err => console.error(err));
  }, [vehicleId]);

  if (!vehicle) return <p>Loading vehicle...</p>;

  return (
    <MapContainer
      center={[vehicle.lat, vehicle.lng]}
      zoom={15}
      className="w-full h-screen"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[vehicle.lat, vehicle.lng]}>
        <Popup>{vehicle.name}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Lander;
