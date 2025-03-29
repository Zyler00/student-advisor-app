import { supabase } from './supabase'
import type { User, Announcement, Appointment } from '../types'

// ฟังก์ชันสำหรับผู้ใช้งาน
export const userService = {
  // ดึงข้อมูลผู้ใช้ทั้งหมด
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data as User[]
  },

  // ดึงข้อมูลผู้ใช้ตาม ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) throw error
    return data as User
  },

  // สร้างผู้ใช้ใหม่
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase.from('users').insert([user]).select()
    if (error) throw error
    return data[0] as User
  },

  // อัปเดตข้อมูลผู้ใช้
  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await supabase.from('users').update(user).eq('id', id).select()
    if (error) throw error
    return data[0] as User
  },

  // ลบผู้ใช้
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  },

  // ดึงข้อมูลนักศึกษาของอาจารย์ที่ปรึกษา
  async getStudentsByAdvisorId(advisorId: string): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').eq('advisorId', advisorId).eq('role', 'student')
    if (error) throw error
    return data as User[]
  }
}

// ฟังก์ชันสำหรับประกาศ
export const announcementService = {
  // ดึงประกาศทั้งหมด
  async getAllAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*')
    if (error) throw error
    return data as Announcement[]
  },

  // ดึงประกาศตาม ID
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single()
    if (error) throw error
    return data as Announcement
  },

  // ดึงประกาศตาม advisorId
  async getAnnouncementsByAdvisorId(advisorId: string): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').eq('advisorId', advisorId)
    if (error) throw error
    return data as Announcement[]
  },

  // สร้างประกาศใหม่
  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    const { data, error } = await supabase.from('announcements').insert([announcement]).select()
    if (error) throw error
    return data[0] as Announcement
  },

  // อัปเดตประกาศ
  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    const { data, error } = await supabase.from('announcements').update(announcement).eq('id', id).select()
    if (error) throw error
    return data[0] as Announcement
  },

  // ลบประกาศ
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) throw error
  }
}

// ฟังก์ชันสำหรับการนัดหมาย
export const appointmentService = {
  // ดึงการนัดหมายทั้งหมด
  async getAllAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*')
    if (error) throw error
    return data as Appointment[]
  },

  // ดึงการนัดหมายตาม ID
  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single()
    if (error) throw error
    return data as Appointment
  },

  // ดึงการนัดหมายตาม advisorId
  async getAppointmentsByAdvisorId(advisorId: string): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*').eq('advisorId', advisorId)
    if (error) throw error
    return data as Appointment[]
  },

  // ดึงการนัดหมายตาม studentId
  async getAppointmentsByStudentId(studentId: string): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*').eq('studentId', studentId)
    if (error) throw error
    return data as Appointment[]
  },

  // สร้างการนัดหมายใหม่
  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase.from('appointments').insert([appointment]).select()
    if (error) throw error
    return data[0] as Appointment
  },

  // อัปเดตการนัดหมาย
  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase.from('appointments').update(appointment).eq('id', id).select()
    if (error) throw error
    return data[0] as Appointment
  },

  // ลบการนัดหมาย
  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) throw error
  }
}
