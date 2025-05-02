import { appointmentServiceType, appointmentState, locationServiceType, locationSchedule } from '@/types/enums';
import { LatLngExpression } from 'leaflet';

// Els ObjectID de Mongo els posem com strings

export interface LoginRequestBody {
    name_or_mail: string;
    password: string;
  }

export interface User {
    _id?: string;
    name: string;
    age: number;
    mail: string;
    password: string;
    isDeleted?: boolean;
  }
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ICalendar {
    owner: string;
    calendarName: string;
    appointments: string[];
    invitees: string[];
    isDeleted: boolean;
    defaultColour?: string;
    _id?: string;
}

export interface IAppointment {
  _id?: string;
  inTime: Date;
  outTime: Date;
  title: string;
  description?: string;
  location?: string;
  serviceType: appointmentServiceType;
  appointmentState?: appointmentState;
  colour?: string;
  customAddress?: string; // e.g. "123 Main St, Apt 4B, New York"
  customUbicacion?: GeoJSONPoint
  isDeleted: boolean;
}

// Tipus Location de Mongo
export interface ILocation extends Document {
  _id: string;
  nombre: string;
  address: string;
  phone: string;
  rating: number;
  ubicacion: GeoJSONPoint;
  serviceType: locationServiceType[];
  schedule: {
    day: locationSchedule;
    open: string;  // HH:mm
    close: string; // HH:mm
  }[];
  business: string
  workers: string[];
  isDeleted: boolean;
}

// Això és el tipus Location de leaflet (ho mapejem a aquí)
export interface Location {
  id: string;
  name: string;
  position: LatLngExpression;
  address?: string;
}