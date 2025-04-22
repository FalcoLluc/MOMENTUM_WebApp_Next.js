// app/appointments/page.tsx
import { Map } from '@/components';
import { Location } from '@/types';

const testLocations: Location[] = [
  // Cluster test (multiple nearby locations)
  {
    id: '9',
    name: 'Trafalgar Square',
    position: [51.5080, -0.1281],
    address: 'Trafalgar Square, London WC2N 5DN, UK',
  },
  {
    id: '10',
    name: 'National Gallery',
    position: [51.5089, -0.1283],
    address: 'Trafalgar Square, London WC2N 5DN, UK',
  },
  {
    id: '11',
    name: "St Martin-in-the-Fields",
    position: [51.5094, -0.1276],
    address: 'Trafalgar Square, London WC2N 4JJ, UK',
  },
  
  // Location with HTML in name (test escaping)
  {
    id: '12',
    name: '<script>alert("XSS")</script> Cafe',
    position: [51.5139, -0.0983],
    address: '1 Park St, London SE1 9AB, UK',
  },
  
  // Location with very long name
  {
    id: '13',
    name: 'The Full Name of This Location Is Intentionally Very Long to Test How the Map Component Handles Text Overflow in Popups and Markers',
    position: [51.5007, -0.1246],
    address: 'Westminster, London SW1A 0AA, UK',
  },
  
  // Location with emoji in name
  {
    id: '15',
    name: '🍔 Burger Palace',
    position: [51.5105, -0.1340],
    address: '10 Leicester Square, London WC2H 7NA, UK',
  }
];

export default function AppointmentsPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Appointment Locations
      </h1>
      <Map locations={testLocations} />
    </div>
  );
}