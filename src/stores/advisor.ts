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
      
      // ตรวจสอบสถานะการเข้าสู่ระบบ
      const { data: sessionData, error: sessionError } = await checkSession()
      
      if (sessionError) {
        console.error('Session check error:', sessionError)
        throw new Error('ไม่สามารถตรวจสอบสถานะการเข้าสู่ระบบได้')
      }
      
      if (!sessionData.session) {
        console.error('No active session found in Supabase')
        
        // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน localStorage หรือไม่
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          console.error('No user data found in localStorage')
          throw new Error('กรุณาเข้าสู่ระบบก่อนขอนัดหมาย')
        }
        
        // พยายาม login ด้วยข้อมูลจาก localStorage
        try {
          const userData = JSON.parse(storedUser)
          console.log('Attempting to login with stored credentials:', userData.username)
          
          // ถ้ามี username และ password ให้พยายาม login
          if (userData.username && userData.password) {
            console.log('Found username in localStorage:', userData.username)
            
            // ดึงข้อมูลผู้ใช้จากฐานข้อมูลด้วย username
            const { data: dbUserData, error: dbUserError } = await supabaseAdmin
              .from('User')
              .select('*')
              .ilike('username', userData.username)
              .single()
            
            if (dbUserError) {
              console.error('Error getting user data from DB by username:', dbUserError)
            }
            
            if (dbUserData && dbUserData.email) {
              console.log('Found email for username, attempting to sign in with email:', dbUserData.email)
              
              // พยายาม sign in ด้วย email และ password
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: dbUserData.email,
                password: userData.password
              })
              
              if (signInError) {
                console.warn('Could not sign in with email and stored password:', signInError)
              } else {
                console.log('Successfully signed in with stored credentials')
              }
            }
          }
        } catch (parseErr) {
          console.error('Error parsing user data from localStorage:', parseErr)
        }
        
        // ตรวจสอบสถานะการเข้าสู่ระบบอีกครั้ง
        const { data: recheckData, error: recheckError } = await supabase.auth.getSession()
        
        if (recheckError || !recheckData.session) {
          console.error('Still no active session after login attempt')
          throw new Error('กรุณาเข้าสู่ระบบก่อนขอนัดหมาย')
        }
      }
      
      console.log('Session check passed, proceeding with appointment request')
      
      // ดึงข้อมูลผู้ใช้จาก localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        console.error('No user data found in localStorage')
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      const userData = JSON.parse(storedUser)
      console.log('User data from localStorage:', userData)
      
      // ค้นหาข้อมูลผู้ใช้จากฐานข้อมูล
      let studentData = null
      
      // วิธีที่ 1: ค้นหาจาก username
      console.log('Searching for user by username:', userData.username)
      const { data: usernameData, error: usernameError } = await supabaseAdmin
        .from('User')
        .select('*')
        .ilike('username', userData.username)
      
      if (usernameError) {
        console.error('Error searching by username:', usernameError)
      } else {
        console.log('Username search result:', usernameData)
        if (usernameData && usernameData.length > 0) {
          studentData = usernameData[0]
          console.log('Found student by username:', studentData)
        }
      }
      
      // วิธีที่ 2: ค้นหาจาก studentId (เนื่องจากนักศึกษาใช้ studentId ในการล็อกอิน)
      if (!studentData && userData.username) {
        console.log('Searching for user by studentId:', userData.username)
        const { data: studentIdData, error: studentIdError } = await supabaseAdmin
          .from('User')
          .select('*')
          .eq('studentId', userData.username)
        
        if (studentIdError) {
          console.error('Error searching by studentId:', studentIdError)
        } else {
          console.log('StudentId search result:', studentIdData)
          if (studentIdData && studentIdData.length > 0) {
            studentData = studentIdData[0]
            console.log('Found student by studentId:', studentData)
          }
        }
      }
      
      // วิธีที่ 3: ถ้าไม่พบจาก username และ studentId ให้ลองค้นหาจาก email
      if (!studentData && userData.email) {
        console.log('Searching for user by email:', userData.email)
        const { data: emailData, error: emailError } = await supabaseAdmin
          .from('User')
          .select('*')
          .ilike('email', userData.email)
        
        if (emailError) {
          console.error('Error searching by email:', emailError)
        } else {
          console.log('Email search result:', emailData)
          if (emailData && emailData.length > 0) {
            studentData = emailData[0]
            console.log('Found student by email:', studentData)
          }
        }
      }
      
      // วิธีที่ 4: ตรวจสอบข้อมูลผู้ใช้จาก Supabase Auth
      if (!studentData) {
        console.log('Checking user metadata in Supabase Auth')
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Error getting user from Supabase Auth:', authError)
        } else if (authData && authData.user) {
          console.log('Found user in Supabase Auth:', authData.user)
          
          // ดึงข้อมูล metadata จาก user
          const metadata = authData.user.user_metadata
          console.log('User metadata:', metadata)
          
          if (metadata && metadata.username) {
            console.log('Found username in metadata:', metadata.username)
            
            // ค้นหาผู้ใช้จาก username ใน metadata
            const { data: metaUsernameData, error: metaUsernameError } = await supabaseAdmin
              .from('User')
              .select('*')
              .ilike('username', metadata.username)
            
            if (metaUsernameError) {
              console.error('Error searching by metadata username:', metaUsernameError)
            } else {
              console.log('Metadata username search result:', metaUsernameData)
              if (metaUsernameData && metaUsernameData.length > 0) {
                studentData = metaUsernameData[0]
                console.log('Found student by metadata username:', studentData)
              }
            }
          }
          
          // ถ้ายังไม่พบและมี id ใน metadata
          if (!studentData && metadata && metadata.id) {
            console.log('Found id in metadata:', metadata.id)
            
            // ค้นหาผู้ใช้จาก id ใน metadata
            const { data: metaIdData, error: metaIdError } = await supabaseAdmin
              .from('User')
              .select('*')
              .eq('id', metadata.id)
            
            if (metaIdError) {
              console.error('Error searching by metadata id:', metaIdError)
            } else {
              console.log('Metadata id search result:', metaIdData)
              if (metaIdData && metaIdData.length > 0) {
                studentData = metaIdData[0]
                console.log('Found student by metadata id:', studentData)
              }
            }
          }
        }
      }
      
      // ถ้าไม่พบข้อมูลผู้ใช้
      if (!studentData) {
        console.error('Could not find student data')
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      // ตรวจสอบว่าพบข้อมูลนักศึกษาหรือไม่
      if (!studentData) {
        console.error('Student data not found for user:', userData)
        throw new Error('ไม่พบข้อมูลนักศึกษา กรุณาติดต่อผู้ดูแลระบบ')
      }
      
      console.log('Using student data:', studentData)
      
      // ค้นหาข้อมูลอาจารย์ที่ปรึกษา
      console.log('Searching for advisor by id:', appointmentData.advisorId)
      const { data: advisor, error: advisorError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', appointmentData.advisorId)
        .single()
      
      if (advisorError) {
        console.error('Error getting advisor data:', advisorError)
        throw new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา')
      }
      
      if (!advisor) {
        console.error('No advisor data found')
        throw new Error('ไม่พบข้อมูลอาจารย์ที่ปรึกษา')
      }
      
      console.log('Found advisor data:', advisor)
      
      // สร้างข้อมูลการนัดหมาย
      const newAppointment = {
        advisorId: appointmentData.advisorId,
        studentId: studentData.id,
        requestDate: new Date(),
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        description: appointmentData.description,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      console.log('Creating new appointment:', newAppointment)
      
      // บันทึกข้อมูลการนัดหมายลงในฐานข้อมูล
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('Appointment')
        .insert([newAppointment])
        .select()
      
      if (insertError) {
        console.error('Error inserting appointment:', insertError)
        throw new Error('ไม่สามารถสร้างการนัดหมายได้: ' + insertError.message)
      }
      
      console.log('Appointment created successfully:', insertData)
      return insertData[0]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ยืนยันการนัดหมาย (สำหรับอาจารย์)
  const confirmAppointment = async (id: string, appointmentDate: Date, location: string, note?: string) => {
    try {
      loading.value = true
      error.value = null
      
      const updateData = {
        status: 'scheduled',
        appointmentDate: appointmentDate.toISOString(),
        location,
        note,
        updatedAt: new Date().toISOString()
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
          updatedAt: new Date().toISOString()
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
          updatedAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
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
          student:studentId(id, firstName, lastName, studentId, profileImage, department)
        `)
        .eq('advisorId', user.id)
        .order('createdAt', { ascending: false })
      
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
          advisor:advisorId(id, firstName, lastName, profileImage, department)
        `)
        .eq('studentId', user.id)
        .order('createdAt', { ascending: false })
      
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
          advisor:advisorId(id, firstName, lastName, profileImage, department)
        `)
        .order('createdAt', { ascending: false })
      
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
        .order('createdAt', { ascending: false })
      
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
        .eq('studentId', studentId)
        .order('createdAt', { ascending: true })
      
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
        advisorId,
        studentId: commentData.studentId,
        content: commentData.content,
        isAdvisorComment: commentData.isAdvisorComment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
            advisorId,
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

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  const checkSession = async () => {
    try {
      // ตรวจสอบ session จาก Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        // ไม่ throw error แต่ใช้ข้อมูลจาก localStorage แทน
        console.log('Using localStorage data instead due to session error')
      }
      
      // ถ้าไม่มี session แต่มีข้อมูลผู้ใช้ใน localStorage
      if (!sessionData.session) {
        console.log('No active session found in Supabase, but using localStorage data')
        
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            console.log('Using user data from localStorage:', userData)
            
            // ไม่พยายามสร้าง session ใหม่ทุกครั้ง เพราะอาจติด rate limit
            // แต่ส่งข้อมูลผู้ใช้จาก localStorage กลับไปใช้งานแทน
            return { 
              data: { 
                session: null,
                user: userData 
              }, 
              error: null 
            }
          } catch (parseErr) {
            console.error('Error parsing user data from localStorage:', parseErr)
          }
        } else {
          console.warn('No user data found in localStorage')
        }
      }
      
      return { data: sessionData, error: sessionError }
    } catch (err: any) {
      console.error('Error checking session:', err)
      error.value = err.message
      
      // ไม่ throw error แต่ใช้ข้อมูลจาก localStorage แทน
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log('Using user data from localStorage due to error:', userData)
          return { 
            data: { 
              session: null,
              user: userData 
            }, 
            error: null 
          }
        } catch (parseErr) {
          console.error('Error parsing user data from localStorage:', parseErr)
        }
      }
      
      throw err
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
