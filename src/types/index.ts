// ประเภทข้อมูลผู้ใช้ระบบ
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
  academicPosition?: string | null; // สำหรับอาจารย์
  studentId?: string | null; // สำหรับนักศึกษา
  title?: string | null; // คำนำหน้าชื่อ (ดร., ผศ., รศ., ศ.)
  position?: string | null; // ตำแหน่งทางวิชาการ
  office?: string | null; // ห้องทำงาน
  advisorId?: string | null; // ID ของอาจารย์ที่ปรึกษา (สำหรับนักศึกษา)
}

// ประเภทข้อมูลความสัมพันธ์ระหว่างอาจารย์ที่ปรึกษาและนักศึกษา
export interface AdvisorStudentRelation {
  id: string;
  advisorId: string;
  studentId: string;
  createdAt: Date;
}

// ประเภทข้อมูลความคิดเห็น
export interface Comment {
  id: string;
  advisorId: string;
  studentId: string;
  content: string;
  createdAt: Date;
  isAdvisorComment: boolean;
}

// ประเภทข้อมูลประกาศ
export interface Announcement {
  id: string;
  advisorId: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: Date;
}

// ประเภทข้อมูลการนัดหมาย
export interface Appointment {
  id: string;
  advisorId: string;
  studentId: string;
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime: Date | string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'cancelled';
  location?: string | null; // สถานที่นัดพบ
  note?: string | null; // บันทึกเพิ่มเติม
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // ฟิลด์เดิมที่อาจยังใช้ในโค้ดเก่า (จะถูกลบในอนาคต)
  requestDate?: Date | string;
  preferredDate?: Date | string | null; // วันที่นักศึกษาต้องการนัดหมาย (รองรับทั้ง Date และ string)
  preferredTime?: string | null; // ช่วงเวลาที่นักศึกษาสะดวก (morning, afternoon, evening)
  appointmentDate?: Date | string | null;
  topic?: string;
}
