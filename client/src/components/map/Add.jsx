import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const Add = () => {
  const { user } = useUser();
  const [vehicleId, setVehicleId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("car");
  const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 }); // default: India center
  const [message, setMessage] = useState("");

  // custom marker
  const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
    iconSize: [32, 32],
  });

  // map click handler
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return <Marker position={position} icon={markerIcon}></Marker>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("You must be logged in to add a vehicle.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/vehicles/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          name,
          type,
          lat: position.lat,
          lng: position.lng,
          userId: user.id, // Clerk user ID
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Vehicle "${name}" added successfully!`);
        setVehicleId("");
        setName("");
      } else {
        setMessage(`⚠️ ${data.message || "Failed to add vehicle"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding vehicle.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-5">
      <h2 className="text-3xl font-bold mb-6 text-green-700">Add a New Vehicle</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white shadow-lg rounded-xl p-6 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Vehicle ID"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          required
          className="border p-2 rounded-md"
        />

        <input
          type="text"
          placeholder="Vehicle Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded-md"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="truck">Truck</option>
          <option value="bus">Bus</option>
        </select>

        <div className="text-sm text-gray-700">
          <strong>Selected Position:</strong> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
        >
          Add Vehicle
        </button>

        {message && <p className="text-center mt-2 text-gray-700">{message}</p>}
      </form>

      <div className="mt-10 w-full max-w-3xl h-[400px] rounded-xl overflow-hidden shadow-md">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
};

export default Add;
