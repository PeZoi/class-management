export interface StudentClassResponse {
  id: string;
  name: string;
  joinAt: string;
}

export interface StudentType {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fullNameParent: string;
  phoneNumberParent: string;
  class: StudentClassResponse;
}

export interface StudentRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fullNameParent: string;
  phoneNumberParent: string;
  classId: string;
}