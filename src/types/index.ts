export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'advisor' | 'student';
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  department: string | null;
  email?: string | null;
  phone?: string | null;
  academicPosition?: string | null;
  studentId?: string | null;
  title?: string | null;
  position?: string | null;
  office?: string | null; 
  advisorId?: string | null;
}

export interface AdvisorStudentRelation {
  id: string;
  advisorId: string;
  studentId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  advisorId: string;
  studentId: string;
  content: string;
  createdAt: Date;
  isAdvisorComment: boolean;
}

export interface Announcement {
  id: string;
  advisorId: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  advisorId: string;
  studentId: string;
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime: Date | string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'cancelled';
  location?: string | null;
  note?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;

  requestDate?: Date | string;
  preferredDate?: Date | string | null;
  preferredTime?: string | null;
  appointmentDate?: Date | string | null;
  topic?: string;
}
