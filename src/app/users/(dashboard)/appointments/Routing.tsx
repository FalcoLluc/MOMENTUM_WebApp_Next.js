import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import "@/styles/routingStyles.css";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

export default function Routing() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(9.3803, 80.377), L.latLng(6.1395, 80.1063)],
      routeWhileDragging: false,
      show: false,
    }).addTo(map);

    // return () => map.removeControl(routingControl);
  }, [map]);

  return null;
}