// @ts-ignore
import { supabase, supabaseAdmin } from '../services/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, Announcement, Appointment, Comment } from '../types'

export const useStudentStore = defineStore('student', () => {
  const advisor = ref<User | null>(null)
  const announcements = ref<Announcement[]>([])
  const appointments = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetchAdvisorById = async (advisorId: string) => {
    try {
      loading.value = true
      error.value = null

      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', advisorId)
        .single()
      
      if (err) {
        throw err
      }
      
      return data as User
    } catch (err) {
      console.error('Error fetching advisor by ID:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchAnnouncementsFromAdvisor = async (advisorId: string) => {
    try {
      loading.value = true
      error.value = null
  
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('Announcement')
        .select('*')
        .eq('advisorId', advisorId)
        .order('createdAt', { ascending: false })
      
      if (err) {
        throw err
      }
      
      announcements.value = data as Announcement[]
      return data as Announcement[]
    } catch (err) {
      console.error('Error fetching announcements from advisor:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchStudentAppointments = async (studentId: string) => {
    try {
      loading.value = true
      error.value = null
 
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('Appointment')
        .select('*')
        .eq('studentId', studentId)
        .order('startTime', { ascending: true })
      
      if (err) {
        throw err
      }
      
      appointments.value = data as Appointment[]
      return data as Appointment[]
    } catch (err) {
      console.error('Error fetching student appointments:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchStudentComments = async (studentId: string) => {
    try {
      loading.value = true
      error.value = null

      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }

      const { data, error: err } = await supabaseAdmin
        .from('Comment')
        .select('*')
        .eq('studentId', studentId)
        .order('createdAt', { ascending: true })
      
      if (err) {
        throw err
      }
      
      return data as Comment[]
    } catch (err) {
      console.error('Error fetching student comments:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }
      return []
    } finally {
      loading.value = false
    }
  }

  const addStudentComment = async (commentData: { 
    studentId: string, 
    advisorId: string, 
    content: string, 
    isAdvisorComment: boolean 
  }) => {
    try {
      loading.value = true
      error.value = null

      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }

      const commentId = crypto.randomUUID()

      console.log('ข้อมูลที่จะส่ง:', {
        id: commentId,
        advisorId: commentData.advisorId,
        studentId: commentData.studentId,
        content: commentData.content,
        isAdvisorComment: commentData.isAdvisorComment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      const { data, error: err } = await supabaseAdmin
        .from('Comment')
        .insert([
          {
            id: commentId,
            advisorId: commentData.advisorId,
            studentId: commentData.studentId,
            content: commentData.content,
            isAdvisorComment: commentData.isAdvisorComment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select()
      
      if (err) {
        console.error('Supabase error:', err)
        console.error('Error code:', err.code)
        console.error('Error message:', err.message)
        console.error('Error details:', err.details)
        throw new Error(`ไม่สามารถเพิ่มข้อความได้: ${err.message}`)
      }
      
      if (!data || data.length === 0) {
        console.error('ไม่มีข้อมูลที่ถูกส่งกลับมา')
        throw new Error('ไม่สามารถเพิ่มข้อความได้: ไม่มีข้อมูลที่ถูกส่งกลับมา')
      }
      
      console.log('เพิ่มข้อความสำเร็จ:', data[0])
      return data[0] as Comment
    } catch (err) {
      console.error('Error adding student comment:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    advisor,
    announcements,
    appointments,
    loading,
    error,
    fetchAdvisorById,
    fetchAnnouncementsFromAdvisor,
    fetchStudentAppointments,
    fetchStudentComments,
    addStudentComment
  }
})
