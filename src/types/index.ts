import { LatLngExpression } from 'leaflet';

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
    place: string;
    title: string;
    colour?: string,
    isDeleted: boolean;
}

export interface Location {
  id: string;
  name: string;
  position: LatLngExpression;
  address?: string;
}