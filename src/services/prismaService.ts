import prisma from './prisma'
import type { User, Announcement, Appointment } from '../types'

// ฟังก์ชันสำหรับผู้ใช้งาน
export const userService = {
  // ดึงข้อมูลผู้ใช้ทั้งหมด
  async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany()
    return users.map(user => ({
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }))
  },

  // ดึงข้อมูลผู้ใช้ตาม ID
  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    if (!user) return null
    return {
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }
  },

  // ดึงข้อมูลผู้ใช้ตามอีเมล
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) return null
    return {
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }
  },

  // ดึงข้อมูลผู้ใช้ตามรหัสนักศึกษา
  async getUserByStudentId(studentId: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { studentId }
    })
    if (!user) return null
    return {
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }
  },

  // สร้างผู้ใช้ใหม่
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: userData.password,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profileImage || null,
        department: userData.department || null,
        email: userData.email || null,
        phone: userData.phone || null,
        academicPosition: userData.academicPosition || null,
        studentId: userData.studentId || null,
        title: userData.title || null,
        position: userData.position || null,
        office: userData.office || null,
        advisorId: userData.advisorId || null
      }
    })
    
    return {
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }
  },

  // อัปเดตข้อมูลผู้ใช้
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: userData
    })
    
    return {
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }
  },

  // ลบผู้ใช้
  async deleteUser(id: string): Promise<User> {
    const user = await prisma.user.delete({
      where: { id }
    })
    
    return {
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }
  },

  // ดึงข้อมูลนักศึกษาของอาจารย์ที่ปรึกษา
  async getStudentsByAdvisorId(advisorId: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: {
        advisorId,
        role: 'student'
      }
    })
    
    return users.map(user => ({
      ...user,
      role: user.role as 'admin' | 'advisor' | 'student',
      department: user.department || null,
      profileImage: user.profileImage || null,
      email: user.email || null,
      phone: user.phone || null,
      academicPosition: user.academicPosition || null,
      studentId: user.studentId || null,
      title: user.title || null,
      position: user.position || null,
      office: user.office || null,
      advisorId: user.advisorId || null
    }))
  }
}

// ฟังก์ชันสำหรับประกาศ
export const announcementService = {
  // ดึงประกาศทั้งหมด
  async getAllAnnouncements(): Promise<Announcement[]> {
    const announcements = await prisma.announcement.findMany()
    return announcements.map(announcement => ({
      ...announcement,
      description: announcement.description || null,
      fileUrl: announcement.fileUrl || null,
      fileName: announcement.fileName || null
    }))
  },

  // ดึงประกาศตาม ID
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    })
    
    if (!announcement) return null
    
    return {
      ...announcement,
      description: announcement.description || null,
      fileUrl: announcement.fileUrl || null,
      fileName: announcement.fileName || null
    }
  },

  // ดึงประกาศตาม advisorId
  async getAnnouncementsByAdvisorId(advisorId: string): Promise<Announcement[]> {
    const announcements = await prisma.announcement.findMany({
      where: { advisorId }
    })
    
    return announcements.map(announcement => ({
      ...announcement,
      description: announcement.description || null,
      fileUrl: announcement.fileUrl || null,
      fileName: announcement.fileName || null
    }))
  },

  // สร้างประกาศใหม่
  async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    const announcement = await prisma.announcement.create({
      data: {
        title: announcementData.title,
        advisorId: announcementData.advisorId,
        description: announcementData.description || null,
        fileUrl: announcementData.fileUrl || null,
        fileName: announcementData.fileName || null
      }
    })
    
    return {
      ...announcement,
      description: announcement.description || null,
      fileUrl: announcement.fileUrl || null,
      fileName: announcement.fileName || null
    }
  },

  // อัปเดตประกาศ
  async updateAnnouncement(id: string, announcementData: Partial<Announcement>): Promise<Announcement> {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: announcementData
    })
    
    return {
      ...announcement,
      description: announcement.description || null,
      fileUrl: announcement.fileUrl || null,
      fileName: announcement.fileName || null
    }
  },

  // ลบประกาศ
  async deleteAnnouncement(id: string): Promise<Announcement> {
    const announcement = await prisma.announcement.delete({
      where: { id }
    })
    
    return {
      ...announcement,
      description: announcement.description || null,
      fileUrl: announcement.fileUrl || null,
      fileName: announcement.fileName || null
    }
  }
}

// ฟังก์ชันสำหรับการนัดหมาย
export const appointmentService = {
  // ดึงการนัดหมายทั้งหมด
  async getAllAppointments(): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany()
    return appointments.map(appointment => ({
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }))
  },

  // ดึงการนัดหมายตาม ID
  async getAppointmentById(id: string): Promise<Appointment | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })
    
    if (!appointment) return null
    
    return {
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }
  },

  // ดึงการนัดหมายตาม advisorId
  async getAppointmentsByAdvisorId(advisorId: string): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: { advisorId }
    })
    
    return appointments.map(appointment => ({
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }))
  },

  // ดึงการนัดหมายตาม studentId
  async getAppointmentsByStudentId(studentId: string): Promise<Appointment[]> {
    const appointments = await prisma.appointment.findMany({
      where: { studentId }
    })
    
    return appointments.map(appointment => ({
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }))
  },

  // สร้างการนัดหมายใหม่
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const appointment = await prisma.appointment.create({
      data: {
        advisorId: appointmentData.advisorId,
        studentId: appointmentData.studentId,
        title: appointmentData.title || appointmentData.topic || '',
        description: appointmentData.description || null,
        status: appointmentData.status,
        location: appointmentData.location || null,
        note: appointmentData.note || null,
        startTime: appointmentData.appointmentDate || new Date(),
        endTime: appointmentData.appointmentDate 
          ? new Date(typeof appointmentData.appointmentDate === 'string' 
              ? new Date(appointmentData.appointmentDate).getTime() + 60 * 60 * 1000
              : appointmentData.appointmentDate.getTime() + 60 * 60 * 1000) 
          : new Date(new Date().getTime() + 60 * 60 * 1000)
      }
    })
    
    return {
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }
  },

  // อัปเดตการนัดหมาย
  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    // แปลงข้อมูลให้ตรงกับ schema ของ Prisma
    const prismaAppointmentData: any = {}
    
    if (appointmentData.advisorId) prismaAppointmentData.advisorId = appointmentData.advisorId
    if (appointmentData.studentId) prismaAppointmentData.studentId = appointmentData.studentId
    if (appointmentData.title) prismaAppointmentData.title = appointmentData.title
    if (appointmentData.topic) prismaAppointmentData.title = appointmentData.topic
    if (appointmentData.description !== undefined) prismaAppointmentData.description = appointmentData.description || null
    if (appointmentData.status) prismaAppointmentData.status = appointmentData.status
    if (appointmentData.location !== undefined) prismaAppointmentData.location = appointmentData.location || null
    if (appointmentData.note !== undefined) prismaAppointmentData.note = appointmentData.note || null
    
    if (appointmentData.appointmentDate) {
      prismaAppointmentData.startTime = appointmentData.appointmentDate
      if (typeof appointmentData.appointmentDate === 'string') {
        prismaAppointmentData.endTime = new Date(new Date(appointmentData.appointmentDate).getTime() + 60 * 60 * 1000)
      } else if (appointmentData.appointmentDate instanceof Date) {
        prismaAppointmentData.endTime = new Date(appointmentData.appointmentDate.getTime() + 60 * 60 * 1000)
      } else {
        throw new Error('appointmentDate must be a string or a Date object')
      }
    }
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: prismaAppointmentData
    })
    
    return {
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }
  },

  // ลบการนัดหมาย
  async deleteAppointment(id: string): Promise<Appointment> {
    const appointment = await prisma.appointment.delete({
      where: { id }
    })
    
    return {
      id: appointment.id,
      advisorId: appointment.advisorId,
      studentId: appointment.studentId,
      requestDate: appointment.createdAt,
      appointmentDate: appointment.startTime || null,
      topic: appointment.title,
      description: appointment.description || null,
      status: appointment.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: appointment.location || null,
      note: appointment.note || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }
  }
}
