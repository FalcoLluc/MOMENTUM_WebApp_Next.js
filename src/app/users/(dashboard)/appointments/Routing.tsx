import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import "@/styles/routingStyles.css";

interface RoutingControlOptions extends L.Routing.RoutingControlOptions {
  createMarker?: (i: number, waypoint: L.Routing.Waypoint, n: number) => L.Marker | false;
}

export default function Routing({ waypoints }: { waypoints: L.LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      lineOptions: {
        styles: [
          { color: "blue", weight: 5, opacity: 0.8 },
          { color: "cyan", weight: 3, opacity: 0.6 },
          { color: "lightblue", weight: 1.5, opacity: 0.4 },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      },
      createMarker: () => false,
      showAlternatives: false,
      fitSelectedRoutes: false,
    } as RoutingControlOptions).addTo(map);

    return () => {
      if (routingControl && map.hasLayer(routingControl.getPlan())) {
        map.removeControl(routingControl);
      }
    };
  }, [map, waypoints]);

  return null;
}