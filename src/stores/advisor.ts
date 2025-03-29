// @ts-ignore
import { supabase, supabaseAdmin } from '../services/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, AdvisorStudentRelation, Announcement, Appointment, Comment } from '../types'

export const useAdvisorStore = defineStore('advisor', () => {
  const advisors = ref<User[]>([])
  const students = ref<User[]>([])
  const advisorStudents = ref<User[]>([]) // เพิ่มตัวแปรใหม่สำหรับเก็บนักศึกษาของอาจารย์ที่ปรึกษา
  const relations = ref<AdvisorStudentRelation[]>([])
  const announcements = ref<Announcement[]>([])
  const appointments = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ดึงข้อมูลอาจารย์ทั้งหมด
  const fetchAdvisors = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('role', 'advisor')
        .order('createdAt', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลอาจารย์ได้: ' + err.message)
      }
      
      advisors.value = data as User[]
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // สร้างอาจารย์ใหม่
  const createAdvisor = async (advisor: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      error.value = null
      
      // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('email', advisor.email)
        .maybeSingle()
      
      if (checkError) {
        throw new Error('ไม่สามารถตรวจสอบข้อมูลได้: ' + checkError.message)
      }
      
      if (existingUser) {
        throw new Error('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น')
      }
      
      // สร้าง UUID แบบง่าย
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, 
                v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const newAdvisor = {
        id: generateUUID(),
        ...advisor,
        role: 'advisor', // กำหนดค่า role เป็น 'advisor' โดยอัตโนมัติ
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .insert([newAdvisor])
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ' + err.message)
      }
      
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลนักศึกษาทั้งหมด
  const fetchStudents = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('role', 'student')
        .order('createdAt', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลนักศึกษาได้: ' + err.message)
      }
      
      students.value = data as User[]
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ค้นหานักศึกษา
  const searchStudents = async (query: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('role', 'student')
        .or(`studentId.ilike.%${query}%,firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
      
      if (err) {
        throw new Error('ไม่สามารถค้นหานักศึกษาได้: ' + err.message)
      }
      
      return data as User[]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // กำหนดอาจารย์ที่ปรึกษาให้กับนักศึกษา
  const assignAdvisorToStudent = async (advisorId: string, studentId: string) => {
    try {
      loading.value = true
      error.value = null
      
      // อัปเดตฟิลด์ advisorId ในตาราง users สำหรับนักศึกษา
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .update({ advisorId })
        .eq('id', studentId)
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถกำหนดอาจารย์ที่ปรึกษาได้: ' + err.message)
      }
      
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลนักศึกษาที่อยู่ภายใต้การดูแลของอาจารย์ที่ปรึกษา
  const fetchAdvisorStudents = async () => {
    try {
      loading.value = true
      
      // ดึงข้อมูลผู้ใช้จาก localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const user = JSON.parse(storedUser)
      
      // ตรวจสอบว่าผู้ใช้เป็นอาจารย์ที่ปรึกษาหรือไม่
      if (user.role !== 'advisor') {
        throw new Error('ผู้ใช้ไม่ใช่อาจารย์ที่ปรึกษา')
      }
      
      // ดึงข้อมูลนักศึกษาที่อยู่ภายใต้การดูแลของอาจารย์ที่ปรึกษา
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('advisorId', user.id)
        .eq('role', 'student')
      
      if (err) {
        throw err
      }
      
      // บันทึกข้อมูลนักศึกษาลงในสโตร์
      advisorStudents.value = data as User[]
      console.log('Fetched advisor students:', advisorStudents.value)
      
      return data
    } catch (err) {
      console.error('Error fetching advisor students:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ค้นหานักศึกษาของอาจารย์ที่ปรึกษา
  const searchAdvisorStudents = async (query: string) => {
    try {
      loading.value = true
      error.value = null
      
      // ใช้ ID ของผู้ใช้ที่ล็อกอินอยู่ (อาจารย์ที่ปรึกษา)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const advisorId = user.id
      
      // ดึงข้อมูลนักศึกษาจาก advisorId
      const { data: studentData, error: studentError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('advisorId', advisorId)
        .eq('role', 'student')
        .or(`studentId.ilike.%${query}%,firstName.ilike.%${query}%,lastName.ilike.%${query}%`)
      
      if (studentError) {
        throw new Error('ไม่สามารถค้นหานักศึกษาได้: ' + studentError.message)
      }
      
      return studentData as User[]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลอาจารย์ตาม ID
  const fetchAdvisorById = async (advisorId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', advisorId)
        .eq('role', 'advisor')
        .single()
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลอาจารย์ได้: ' + err.message)
      }
      
      return data as User
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // อัปโหลดไฟล์ไปยัง Supabase Storage
  const uploadFile = async (file: File, folder: string) => {
    try {
      loading.value = true
      error.value = null
      
      // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, 
                v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${generateUUID()}.${fileExt}`
      const filePath = `${folder}/${fileName}`
      
      // ใช้ bucket 'files' ที่มีอยู่แล้วใน Supabase
      const bucketName = 'files'
      
      // อัปโหลดไฟล์ไปยัง Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, file)
      
      if (uploadError) {
        throw new Error('ไม่สามารถอัปโหลดไฟล์ได้: ' + uploadError.message)
      }
      
      // สร้าง URL สำหรับเข้าถึงไฟล์
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath)
      
      return {
        fileName: file.name,
        fileUrl: publicUrl
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // สร้างประกาศใหม่
  const createAnnouncement = async (announcementData: Partial<Announcement>, file?: File | null) => {
    try {
      loading.value = true
      error.value = null
      
      // ดึงข้อมูลผู้ใช้จาก localStorage แทนการใช้ supabase.auth.getUser()
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      // แปลงข้อมูลจาก JSON string เป็น object
      const user = JSON.parse(storedUser)
      
      // สร้าง UUID แบบง่าย
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, 
                v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const id = generateUUID();
      
      // ถ้ามีไฟล์ให้อัปโหลดก่อน
      let fileInfo = {}
      if (file) {
        const uploadResult = await uploadFile(file, 'announcements')
        fileInfo = {
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl
        }
      }
      
      const newAnnouncement = {
        id,
        ...announcementData,
        ...fileInfo,
        advisorId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('Announcement')
        .insert([newAnnouncement])
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถสร้างประกาศได้: ' + err.message)
      }
      
      if (data) {
        announcements.value.unshift(data[0] as Announcement)
      }
      
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // อัปเดตประกาศ
  const updateAnnouncement = async (id: string, announcementData: Partial<Announcement>, file?: File | null) => {
    try {
      loading.value = true
      error.value = null
      
      // ถ้ามีไฟล์ใหม่ให้อัปโหลด
      let updatedData = { 
        ...announcementData,
        updatedAt: new Date().toISOString() // เพิ่ม updatedAt ทุกครั้งที่มีการอัปเดต
      }
      
      if (file) {
        // ใช้ฟังก์ชัน uploadFile เพื่อสร้างไฟล์ใหม่
        const uploadResult = await uploadFile(file, 'announcements')
        updatedData = {
          ...updatedData,
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl
        }
      }
      
      // อัปเดตข้อมูลใน Supabase
      const { data, error: err } = await supabaseAdmin
        .from('Announcement')
        .update(updatedData)
        .eq('id', id)
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถอัปเดตประกาศได้: ' + err.message)
      }
      
      // อัปเดต state
      if (data && data.length > 0) {
        const index = announcements.value.findIndex(a => a.id === id)
        if (index !== -1) {
          announcements.value[index] = data[0] as Announcement
        }
      }
      
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ลบประกาศ
  const deleteAnnouncement = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: err } = await supabaseAdmin
        .from('Announcement')
        .delete()
        .eq('id', id)
      
      if (err) {
        throw new Error('ไม่สามารถลบประกาศได้: ' + err.message)
      }
      
      // อัปเดต state
      announcements.value = announcements.value.filter(a => a.id !== id)
      
      return true
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลประกาศของอาจารย์
  const fetchAnnouncements = async () => {
    try {
      loading.value = true
      error.value = null
      
      // ดึงข้อมูลผู้ใช้จาก localStorage แทนการใช้ supabase.auth.getUser()
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      // แปลงข้อมูลจาก JSON string เป็น object
      const user = JSON.parse(storedUser)
      
      const { data, error: err } = await supabaseAdmin
        .from('Announcement')
        .select('*')
        .eq('advisorId', user.id)
        .order('createdAt', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลประกาศได้: ' + err.message)
      }
      
      announcements.value = data as Announcement[]
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลประกาศสำหรับนักศึกษา
  const fetchStudentAnnouncements = async () => {
    try {
      loading.value = true
      error.value = null
      
      // ใช้ข้อมูลผู้ใช้จาก localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const user = JSON.parse(storedUser)
      
      // ดึงข้อมูลอาจารย์ที่ปรึกษาของนักศึกษา
      const { data: advisorData, error: advisorError } = await supabaseAdmin
        .from('User')
        .select('advisorId')
        .eq('id', user.id)
        .single()
      
      if (advisorError && advisorError.code !== 'PGRST116') {
        throw new Error('ไม่สามารถดึงข้อมูลอาจารย์ที่ปรึกษาได้: ' + advisorError.message)
      }
      
      if (!advisorData) {
        return []
      }
      
      // ดึงประกาศจากอาจารย์ที่ปรึกษา
      const { data, error: err } = await supabaseAdmin
        .from('Announcement')
        .select('*')
        .eq('advisorId', advisorData.advisorId)
        .order('createdAt', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลประกาศได้: ' + err.message)
      }
      
      return data as Announcement[]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // สร้างการนัดหมายใหม่ (สำหรับนักศึกษา)
  const requestAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      console.log('Starting appointment request with data:', appointmentData)
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!appointmentData.topic) {
        throw new Error('กรุณาระบุหัวข้อการนัดหมาย')
      }
      
      if (!appointmentData.advisorId) {
        throw new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา')
      }
      
      if (!appointmentData.studentId) {
        throw new Error('ไม่พบข้อมูลนักศึกษา')
      }
      
      // ค้นหาข้อมูลอาจารย์ที่ปรึกษา
      console.log('Searching for advisor with ID:', appointmentData.advisorId)
      const { data: advisor, error: advisorError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', appointmentData.advisorId)
        .single()
      
      if (advisorError) {
        console.error('Error searching for advisor:', advisorError)
        throw new Error('ไม่สามารถค้นหาข้อมูลอาจารย์ที่ปรึกษาได้')
      }
      
      if (!advisor) {
        console.error('Advisor not found with ID:', appointmentData.advisorId)
        throw new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา')
      }
      
      console.log('Found advisor data:', advisor)
      
      // ค้นหาข้อมูลนักศึกษา
      console.log('Searching for student with ID:', appointmentData.studentId)
      const { data: student, error: studentError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', appointmentData.studentId)
        .single()
      
      if (studentError) {
        console.error('Error searching for student:', studentError)
        throw new Error('ไม่สามารถค้นหาข้อมูลนักศึกษาได้')
      }
      
      if (!student) {
        console.error('Student not found with ID:', appointmentData.studentId)
        throw new Error('ไม่พบข้อมูลนักศึกษา')
      }
      
      console.log('Found student data:', student)
      
      // สร้างข้อมูลการนัดหมายในรูปแบบ snake_case ตามที่ใช้ใน Supabase
      const newAppointment = {
        advisor_id: appointmentData.advisorId,
        student_id: appointmentData.studentId,
        topic: appointmentData.topic,
        description: appointmentData.description || null,
        request_date: new Date().toISOString(),
        preferred_date: appointmentData.preferredDate ? 
          (appointmentData.preferredDate instanceof Date ? 
            appointmentData.preferredDate.toISOString() : 
            appointmentData.preferredDate) : 
          null,
        preferred_time: appointmentData.preferredTime,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Creating new appointment with data:', newAppointment)
      
      // บันทึกข้อมูลการนัดหมายลงในฐานข้อมูล
      try {
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('appointment')
          .insert([newAppointment])
          .select()
        
        if (insertError) {
          console.error('Error inserting appointment:', insertError)
          throw new Error(`ไม่สามารถสร้างการนัดหมายได้: ${insertError.message}`)
        }
        
        console.log('Appointment created successfully:', insertData)
        return insertData ? insertData[0] : null
      } catch (error) {
        console.error('Exception when creating appointment:', error)
        throw error
      }
    } catch (error: any) {
      console.error('Error in requestAppointment:', error)
      throw error
    }
  }

  // ยืนยันการนัดหมาย (สำหรับอาจารย์)
  const confirmAppointment = async (id: string, appointmentDate: Date, location: string, note?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const updateData = {
        status: 'scheduled',
        appointment_date: appointmentDate.toISOString(),
        location,
        note,
        updated_at: new Date().toISOString()
      }
      
      const { data: appointmentResult, error: err } = await supabaseAdmin
        .from('Appointment')
        .update(updateData)
        .eq('id', id)
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถยืนยันการนัดหมายได้: ' + err.message)
      }
      
      // อัปเดต state
      if (appointmentResult && appointmentResult.length > 0) {
        const index = appointments.value.findIndex(a => a.id === id)
        if (index !== -1) {
          appointments.value[index] = appointmentResult[0] as Appointment
        }
      }
      
      return appointmentResult
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ยกเลิกการนัดหมาย (สำหรับอาจารย์)
  const cancelAppointment = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data: appointmentResult, error: err } = await supabaseAdmin
        .from('Appointment')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถยกเลิกการนัดหมายได้: ' + err.message)
      }
      
      // อัปเดต state
      if (appointmentResult && appointmentResult.length > 0) {
        const index = appointments.value.findIndex(a => a.id === id)
        if (index !== -1) {
          appointments.value[index] = appointmentResult[0] as Appointment
        }
      }
      
      return appointmentResult
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ยกเลิกการนัดหมาย (สำหรับนักศึกษา)
  const cancelStudentAppointment = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data: appointmentResult, error: err } = await supabaseAdmin
        .from('Appointment')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถยกเลิกการนัดหมายได้: ' + err.message)
      }
      
      return appointmentResult
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ยืนยันการนัดหมาย (สำหรับนักศึกษา)
  const confirmStudentAppointment = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      const updateData = {
        status: 'confirmed',
        updated_at: new Date().toISOString()
      }
      
      const { data: appointmentResult, error: err } = await supabaseAdmin
        .from('Appointment')
        .update(updateData)
        .eq('id', id)
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถยืนยันการนัดหมายได้: ' + err.message)
      }
      
      return appointmentResult
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลการนัดหมายของอาจารย์
  const fetchAppointments = async () => {
    try {
      loading.value = true
      error.value = null
      
      // ใช้ ID ของผู้ใช้ที่ล็อกอินอยู่ (อาจารย์)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('Appointment')
        .select(`
          *,
          student:student_id(id, firstName, lastName, studentId, profileImage, department)
        `)
        .eq('advisor_id', user.id)
        .order('created_at', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลการนัดหมายได้: ' + err.message)
      }
      
      appointments.value = data as Appointment[]
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลการนัดหมายของนักศึกษา
  const fetchStudentAppointments = async () => {
    try {
      loading.value = true
      error.value = null
      
      // ใช้ ID ของผู้ใช้ที่ล็อกอินอยู่ (นักศึกษา)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('Appointment')
        .select(`
          *,
          advisor:advisor_id(id, firstName, lastName, profileImage, department)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลการนัดหมายได้: ' + err.message)
      }
      
      return data as Appointment[]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลการนัดหมายทั้งหมด (สำหรับ Admin)
  const fetchAllAppointments = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabaseAdmin
        .from('Appointment')
        .select(`
          *,
          advisor:advisor_id(id, firstName, lastName, profileImage, department)
        `)
        .order('created_at', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลการนัดหมายได้: ' + err.message)
      }
      
      return data as Appointment[]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลความสัมพันธ์ระหว่างอาจารย์และนักศึกษาทั้งหมด (สำหรับ Admin)
  const fetchAllRelations = async () => {
    try {
      loading.value = true
      error.value = null
      
      // ดึงข้อมูลนักศึกษาที่มี advisorId
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('id, firstName, lastName, studentId, department, profileImage, advisorId')
        .not('advisorId', 'is', null)
        .eq('role', 'student')
        .order('created_at', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลความสัมพันธ์ได้: ' + err.message)
      }
      
      // แปลงข้อมูลให้อยู่ในรูปแบบ AdvisorStudentRelation
      const relations = data.map((student: any) => ({
        id: student.id,
        advisorId: student.advisorId,
        studentId: student.id,
        createdAt: student.createdAt
      })) as AdvisorStudentRelation[]
      
      return relations
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // อัปเดตโปรไฟล์อาจารย์
  const updateAdvisorProfile = async (profileData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null
      
      if (!profileData.id) {
        throw new Error('ไม่พบ ID ของอาจารย์')
      }
      
      // ตรวจสอบว่ามีการเปลี่ยนอีเมลหรือไม่
      if (profileData.email) {
        // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่ (ที่ไม่ใช่ของผู้ใช้คนนี้)
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('User')
          .select('id')
          .eq('email', profileData.email)
          .neq('id', profileData.id) // ไม่รวมผู้ใช้คนปัจจุบัน
          .maybeSingle()
        
        if (checkError) {
          throw new Error('ไม่สามารถตรวจสอบข้อมูลได้: ' + checkError.message)
        }
        
        if (existingUser) {
          throw new Error('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น')
        }
      }
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .update(profileData)
        .eq('id', profileData.id)
        .eq('role', 'advisor')
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถอัปเดตข้อมูลอาจารย์ได้: ' + err.message)
      }
      
      // อัปเดตข้อมูลในสโตร์
      const index = advisors.value.findIndex(advisor => advisor.id === profileData.id)
      if (index !== -1 && data && data.length > 0) {
        advisors.value[index] = { ...advisors.value[index], ...data[0] }
      }
      
      return data && data.length > 0 ? data[0] : null
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ลบอาจารย์
  const deleteAdvisor = async (advisorId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: err } = await supabaseAdmin
        .from('User')
        .delete()
        .eq('id', advisorId)
        .eq('role', 'advisor')
      
      if (err) {
        throw new Error('ไม่สามารถลบข้อมูลอาจารย์ได้: ' + err.message)
      }
      
      // อัปเดตข้อมูลในสโตร์
      advisors.value = advisors.value.filter(advisor => advisor.id !== advisorId)
      
      return true
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลนักศึกษาตาม ID
  const fetchStudentById = async (studentId: string) => {
    try {
      loading.value = true
      
      const { data, error: err } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', studentId)
        .eq('role', 'student')
        .single()
      
      if (err) {
        throw err
      }
      
      return data as User
    } catch (err) {
      console.error('Error fetching student by ID:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // ดึงข้อมูลการสนทนากับนักศึกษา
  const fetchStudentComments = async (studentId: string) => {
    try {
      loading.value = true
      
      // ตรวจสอบว่ามีการล็อกอินหรือไม่
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      // ดึงข้อมูลความคิดเห็น
      const { data, error: err } = await supabaseAdmin
        .from('Comment')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true })
      
      if (err) {
        throw err
      }
      
      return data as Comment[]
    } catch (err) {
      console.error('Error fetching student comments:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // เพิ่มความคิดเห็นให้กับนักศึกษา
  const addStudentComment = async (commentData: { studentId: string, content: string, isAdvisorComment: boolean }) => {
    try {
      loading.value = true
      
      // ตรวจสอบว่ามีการล็อกอินหรือไม่
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      // ดึง ID ของผู้ใช้ปัจจุบัน (อาจารย์)
      const user = JSON.parse(storedUser)
      const advisorId = user.id
      
      // สร้าง UUID แบบง่าย
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, 
                v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const commentId = generateUUID();
      
      // แสดงข้อมูลที่จะส่งในคอนโซล
      console.log('ข้อมูลที่จะส่ง:', {
        id: commentId,
        advisor_id: advisorId,
        student_id: commentData.studentId,
        content: commentData.content,
        is_advisor_comment: commentData.isAdvisorComment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      // ทดสอบการเชื่อมต่อกับตาราง Comment
      console.log('ทดสอบการเข้าถึงตาราง Comment...')
      const { data: testData, error: testError } = await supabaseAdmin
        .from('Comment')
        .select('count')
      
      if (testError) {
        console.error('ไม่สามารถเข้าถึงตาราง Comment:', testError)
        throw new Error(`ไม่สามารถเข้าถึงตาราง Comment: ${testError.message}`)
      }
      
      console.log('สามารถเข้าถึงตาราง Comment ได้:', testData)
      
      // เพิ่มข้อความลงในตาราง Comment
      const { data, error: err } = await supabaseAdmin
        .from('Comment')
        .insert([
          {
            id: commentId,
            advisor_id: advisorId,
            student_id: commentData.studentId,
            content: commentData.content,
            is_advisor_comment: commentData.isAdvisorComment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  const checkSession = async () => {
    try {
      console.log('Checking session status')
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error checking session:', error)
        return { data: { session: null, user: null }, error }
      }
      
      if (!data.session) {
        console.log('No active session found in Supabase, but using localStorage data')
        
        // ถ้าไม่มีเซสชันใน Supabase แต่มีข้อมูลใน localStorage ให้ใช้ข้อมูลจาก localStorage แทน
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          console.log('Using user data from localStorage:', userData.username)
          
          // ไม่ต้องพยายาม login อีก เพราะอาจทำให้เกิดการวนลูป
          // แค่ส่งข้อมูลกลับไปใช้งานเลย
          return { 
            data: { 
              session: { user: { id: userData.id } }, 
              user: userData 
            }, 
            error: null 
          }
        }
      }
      
      return { data, error }
    } catch (err) {
      console.error('Exception in checkSession:', err)
      return { 
        data: { session: null, user: null }, 
        error: err instanceof Error ? err : new Error(String(err)) 
      }
    }
  }

  return {
    advisors,
    students,
    advisorStudents,
    relations,
    announcements,
    appointments,
    loading,
    error,
    fetchAdvisors,
    createAdvisor,
    fetchStudents,
    searchStudents,
    assignAdvisorToStudent,
    fetchAdvisorStudents,
    searchAdvisorStudents,
    fetchAdvisorById,
    uploadFile,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAnnouncements,
    fetchStudentAnnouncements,
    requestAppointment,
    confirmAppointment,
    cancelAppointment,
    cancelStudentAppointment,
    confirmStudentAppointment,
    fetchAppointments,
    fetchStudentAppointments,
    fetchAllAppointments,
    fetchAllRelations,
    updateAdvisorProfile,
    deleteAdvisor,
    fetchStudentById,
    fetchStudentComments,
    addStudentComment,
    checkSession
  }
})
