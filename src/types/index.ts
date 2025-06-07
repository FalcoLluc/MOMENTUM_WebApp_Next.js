import { AppointmentServiceType, AppointmentState, LocationServiceType, LocationSchedule, ChatUserType } from '@/types/enums';
import { LatLngExpression } from 'leaflet';

// Els ObjectID de Mongo els posem com strings

export interface LoginRequestBody {
  name_or_mail: string;
  password: string;
}

export interface NewBusinessRequestBody {
  name: string;
  age: number;
  mail: string;
  password: string;
  businessName: string;
}

export enum WorkerRole {
    WORKER = 'worker',
    ADMIN = 'admin',
}

export interface User {
  _id?: string;
  name: string;
  age: number;
  mail: string;
  password: string;
  isDeleted?: boolean;
}

export interface Worker {
  _id?: string;
  name: string;
  age: number;
  mail: string;
  role: WorkerRole;
  location: string[];
  businessAdministrated?: string;
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
  calendarId?: string;
  inTime: Date;
  outTime: Date;
  title: string;
  description?: string;
  location?: string;
  serviceType: AppointmentServiceType;
  appointmentState?: AppointmentState;
  colour?: string;
  customAddress?: string; // e.g. "123 Main St, Apt 4B, New York"
  customUbicacion?: GeoJSONPoint
  isDeleted: boolean;
}

// Tipus Location de Mongo
export interface ILocation {
  _id: string;
  nombre: string;
  address: string;
  phone: string;
  rating: number;
  ubicacion: GeoJSONPoint;
  serviceType: LocationServiceType[];
  schedule: {
    day: LocationSchedule;
    open: string;  // HH:mm
    close: string; // HH:mm
  }[];
  business: string
  workers: string[];
  isDeleted: boolean;
}

export interface NewBusinessRequestBody {
  name: string;
  age: number;
  mail: string;
  password: string;
  businessName: string;
}

// Això és el tipus Location de leaflet (ho mapejem a aquí)
// INTERFIACES PER A MARKERS DE MAP
export interface AppointmentMarker {
  id: string;
  name: string;
  position: LatLngExpression;
  address?: string;
  serviceType: string;
}

export interface  LocationMarker{
  id: string;
  name: string;
  position: LatLngExpression;
  address: string;
  serviceTypes: string;
  rating: number;
  phone: string;
  business: string;
}

export interface IBusiness {
  _id: string;
  name: string;
  location: ILocation[]; // populate desde el backend
  isDeleted: boolean;
}

export interface FilterOptions {
  serviceTypes?: LocationServiceType[]; // múltiple selección
  cities?: string[]; // nombres de ciudad
  openAt?: string; // string con hora en formato ISO o HH:mm
  minRating?: number; // por ejemplo: 4
  maxDistanceKm?: number; // por ejemplo: 10
}
export interface IMessage {
  from: string;
  text: string;
  timestamp: Date;
}

export interface IChat{
  user1: User;
  user2: User;
  messages: IMessage[];
  _id?: string;
}

export type ChatListItem = [
  chatName: string,
  userId: string,
  userType: ChatUserType,
  selfId: string,
]

export interface AppointmentMarkerMapbox {
  id: string;
  name: string;
  position: [number, number];
  address?: string;
  serviceType: string;
}
export interface PlannedAppointment {
  calendarId?: string;
  inTime: Date;
  outTime: Date;
  title: string;
  description?: string;
  colour?: string;
  customAddress?: string;
  customUbicacion?: GeoJSONPoint;
}

export interface AppointmentPlanningResponse {
  response: string,
  appointments: PlannedAppointment[],
}