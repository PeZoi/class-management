import { ClassType } from "./class-type";

export interface TeacherRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  dob: string;
  avatar: string;
  gender: string;
}

export interface TeacherType {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  dob: string;
  avatar: string;
  gender: string;
  classList: ClassType[];
  createdAt: string;
  updatedAt: string;
}