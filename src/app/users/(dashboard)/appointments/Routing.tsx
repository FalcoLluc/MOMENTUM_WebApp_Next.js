import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";
import "@/styles/routingStyles.css";

interface RoutingControlOptions extends L.Routing.RoutingControlOptions {
  createMarker?: (i: number, waypoint: L.Routing.Waypoint, n: number) => L.Marker | false;
}

function Routing({
  waypoints,
  onRouteSummary,
}: {
  waypoints: L.LatLng[];
  onRouteSummary?: (summary: { distance: number; time: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
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
    } as RoutingControlOptions).addTo(map);
    routingControl.on("routesfound", (e: { routes: { summary: { totalDistance: number; totalTime: number } }[] }) => {
      const route = e.routes[0];
      const summary = route.summary;
      onRouteSummary?.({
        distance: summary.totalDistance,
        time: summary.totalTime,
      });
    });

    return () => {
      map.removeControl(routingControl); // Safer: always remove the control
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, waypoints]); // ✅ only rerun if map or waypoints actually change


  return null;
}

export default React.memo(Routing);