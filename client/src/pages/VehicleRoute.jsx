import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

const VehicleRoute = () => {
  const mapRef = useRef(null);
  const routingRef = useRef(null);
  const markerRef = useRef(null);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [speed, setSpeed] = useState(100);

  // Initialize map
  useEffect(() => {
    const map = L.map("map").setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    return () => map.remove();
  }, []);

  // Fetch location suggestions from Nominatim
  const fetchSuggestions = async (query, setter) => {
    if (!query || query.length < 3) return setter([]);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await response.json();
    setter(data.slice(0, 5)); // limit 5 suggestions
  };

  // Handle start/dest selection
  const selectSuggestion = (place, setter, inputSetter) => {
    inputSetter(place.display_name);
    setter([]);
  };

  // Geocode location name → coordinates
  const geocode = async (place) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );
    const data = await response.json();
    if (data.length > 0)
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  };

  // Calculate & display route
  const calculateRoute = async () => {
    if (!start || !end) return alert("Enter both start and destination!");

    const startCoords = await geocode(start);
    const endCoords = await geocode(end);
    if (!startCoords || !endCoords)
      return alert("Couldn't find one or both locations!");

    const map = mapRef.current;
    if (routingRef.current) {
      map.removeControl(routingRef.current);
      routingRef.current = null;
    }

    const routing = L.Routing.control({
      waypoints: [L.latLng(startCoords), L.latLng(endCoords)],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      fitSelectedRoutes: true,
    })
      .on("routesfound", (e) => {
        const coords = e.routes[0].coordinates.map((c) => [c.lat, c.lng]);
        setRouteCoords(coords);
      })
      .addTo(map);

    routingRef.current = routing;
  };

  // Animate car
  useEffect(() => {
    if (routeCoords.length === 0) return;

    const map = mapRef.current;
    const carIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
      iconSize: [32, 32],
    });

    if (markerRef.current) map.removeLayer(markerRef.current);

    const marker = L.marker(routeCoords[0], { icon: carIcon }).addTo(map);
    markerRef.current = marker;

    let i = 0;
    const interval = setInterval(() => {
      if (i < routeCoords.length) {
        marker.setLatLng(routeCoords[i]);
        i++;
      } else clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [routeCoords, speed]);

  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        🚗 Fleet Management Route Simulator
      </h2>

      {/* Search Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        {/* Start Input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Start location"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              fetchSuggestions(e.target.value, setStartSuggestions);
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          {startSuggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                background: "white",
                listStyle: "none",
                padding: 0,
                margin: 0,
                width: "100%",
                border: "1px solid #ccc",
                borderTop: "none",
                zIndex: 1000,
              }}
            >
              {startSuggestions.map((place, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() =>
                    selectSuggestion(place, setStartSuggestions, setStart)
                  }
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destination Input */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Destination"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              fetchSuggestions(e.target.value, setEndSuggestions);
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          {endSuggestions.length > 0 && (
            <ul
              style={{
                position: "absolute",
                background: "white",
                listStyle: "none",
                padding: 0,
                margin: 0,
                width: "100%",
                border: "1px solid #ccc",
                borderTop: "none",
                zIndex: 1000,
              }}
            >
              {endSuggestions.map((place, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={() =>
                    selectSuggestion(place, setEndSuggestions, setEnd)
                  }
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={calculateRoute}
          style={{
            padding: "10px",
            background: "#007bff",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Show Route
        </button>

        {/* Speed Control */}
        <div>
          <label>Vehicle Speed: </label>
          <input
            type="range"
            min="10"
            max="300"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />{" "}
          {speed} ms
        </div>
      </div>

      <div id="map" style={{ height: "500px", width: "100%" }}></div>
    </div>
  );
};

export default VehicleRoute;
