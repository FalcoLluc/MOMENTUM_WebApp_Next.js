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
  followers?: string[]; // Array de IDs d'usuaris que segueixen aquest usuari
  following?: string[]; // Array de IDs d'usuaris que aquest usuari segueix
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
  accessible: boolean;
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
  startTime: Date; // Add start time
  endTime: Date;
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
  accessible: boolean;
}

export interface IBusiness {
  _id: string;
  name: string;
  location: ILocation[]; // populate desde el backend
  isDeleted: boolean;
}

export interface FilterOptions {
  serviceTypes?: string[]; // Array of service types (e.g., ['Plumbing', 'Electrician'])
  cities?: string[]; // Array of city names
  ratingMin?: number; // Minimum rating (e.g., 4)
  day?: string; // Day of the week (e.g., 'Monday')
  time?: string; // Time in HH:mm format
  lat?: number; // Latitude for location-based filtering
  lon?: number; // Longitude for location-based filtering
  maxDistance?: number; // Maximum distance in kilometers
  date1?: string; // Start date in ISO format (e.g., "2025-06-16T14:30:00.000Z")
  date2?: string; // End date in ISO format (e.g., "2025-06-16T16:30:00.000Z")
  accessible?: boolean; // Accessibility filter (e.g., wheelchair accessible)
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
  chatId: string,
]

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

export interface SocketMessage {
  receiverId: string,
  receiverType: ChatUserType,
  senderId: string,
  senderName: string,
  chatId: string,
  message: string,
}

export interface JoinRoomRequest {
  userId: string,
  rooms: string[],
}