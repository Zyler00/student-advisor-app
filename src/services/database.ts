import { supabase } from './supabase'
import type { User, Announcement, Appointment } from '../types'


export const userService = {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data as User[]
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) throw error
    return data as User
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data, error } = await supabase.from('users').insert([user]).select()
    if (error) throw error
    return data[0] as User
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await supabase.from('users').update(user).eq('id', id).select()
    if (error) throw error
    return data[0] as User
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  },

  async getStudentsByAdvisorId(advisorId: string): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').eq('advisorId', advisorId).eq('role', 'student')
    if (error) throw error
    return data as User[]
  }
}

export const announcementService = {
  async getAllAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*')
    if (error) throw error
    return data as Announcement[]
  },

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single()
    if (error) throw error
    return data as Announcement
  },

  async getAnnouncementsByAdvisorId(advisorId: string): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*').eq('advisorId', advisorId)
    if (error) throw error
    return data as Announcement[]
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    const { data, error } = await supabase.from('announcements').insert([announcement]).select()
    if (error) throw error
    return data[0] as Announcement
  },

  async updateAnnouncement(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    const { data, error } = await supabase.from('announcements').update(announcement).eq('id', id).select()
    if (error) throw error
    return data[0] as Announcement
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) throw error
  }
}

export const appointmentService = {
  async getAllAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*')
    if (error) throw error
    return data as Appointment[]
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single()
    if (error) throw error
    return data as Appointment
  },

  async getAppointmentsByAdvisorId(advisorId: string): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*').eq('advisorId', advisorId)
    if (error) throw error
    return data as Appointment[]
  },

  async getAppointmentsByStudentId(studentId: string): Promise<Appointment[]> {
    const { data, error } = await supabase.from('appointments').select('*').eq('studentId', studentId)
    if (error) throw error
    return data as Appointment[]
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const { data, error } = await supabase.from('appointments').insert([appointment]).select()
    if (error) throw error
    return data[0] as Appointment
  },

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase.from('appointments').update(appointment).eq('id', id).select()
    if (error) throw error
    return data[0] as Appointment
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) throw error
  }
}
