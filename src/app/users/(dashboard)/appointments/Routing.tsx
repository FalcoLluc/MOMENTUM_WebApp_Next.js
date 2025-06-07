import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import "@/styles/routingStyles.css";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

export default function Routing({ waypoints }: { waypoints: L.LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false, // Disable dragging of the route
      addWaypoints: false, // Disable adding new waypoints by clicking
      show: false, // Hide the routing UI
      lineOptions: {
        styles: [
          {
            color: "blue", // Customize the line color
            weight: 4, // Customize the line thickness
            opacity: 0.7, // Customize the line opacity
          },
        ],
        extendToWaypoints: true, // Ensure the line extends to all waypoints
        missingRouteTolerance: 10, // Tolerance for missing routes in meters
      },
    }).addTo(map);

    // return () => map.removeControl(routingControl);
  }, [map, waypoints]);

  return null;
}