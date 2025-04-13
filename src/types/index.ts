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