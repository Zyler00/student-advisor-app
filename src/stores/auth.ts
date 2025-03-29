// @ts-ignore
import { supabase, supabaseAdmin } from '../services/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../types'

// ฟังก์ชันสำหรับแปลงข้อมูลจาก Supabase ให้ตรงกับ Type ที่กำหนด
const mapSupabaseUserToUser = (data: any): User => ({
  id: data.id,
  username: data.username,
  password: data.password, // เก็บรหัสผ่านไว้สำหรับการเข้าสู่ระบบอัตโนมัติ
  role: data.role as 'admin' | 'advisor' | 'student',
  firstName: data.firstName,
  lastName: data.lastName,
  profileImage: data.profileImage || null,
  department: data.department || null,
  email: data.email || null,
  phone: data.phone || null,
  academicPosition: data.academicPosition || null,
  studentId: data.studentId || null,
  title: data.title || null,
  position: data.position || null,
  office: data.office || null,
  advisorId: data.advisorId || null
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // เริ่มต้นการตรวจสอบสถานะการเข้าสู่ระบบ
  const initAuth = async () => {
    try {
      loading.value = true
      
      // ทดสอบการเชื่อมต่อกับ Supabase
      const { data: tableInfo, error: tableError } = await supabaseAdmin
        .from('User')
        .select('*')
        .limit(1)
      
      if (tableError) {
        console.error('Cannot connect to User table:', tableError)
      } else {
        console.log('User table structure:', tableInfo)
      }
      
      // ตรวจสอบข้อมูลใน localStorage ก่อน
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          user.value = parsedUser
        } catch (err) {
          console.error('ไม่สามารถแปลงข้อมูลผู้ใช้จาก localStorage ได้:', err)
          localStorage.removeItem('user')
        }
      }
      
      // ตรวจสอบเซสชันจาก Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // ดึงข้อมูลผู้ใช้จาก Supabase
        const { data, error } = await supabaseAdmin
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.warn('ไม่สามารถดึงข้อมูลผู้ใช้จาก Supabase ได้:', error.message)
          // ถ้าไม่สามารถดึงข้อมูลจาก Supabase ได้ แต่มีข้อมูลใน localStorage แล้ว ก็ใช้ข้อมูลจาก localStorage ต่อไป
          if (!user.value) {
            throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
          }
        } else if (data) {
          // แปลงข้อมูลให้ตรงกับ Type ที่กำหนด
          user.value = mapSupabaseUserToUser(data)
          // อัปเดตข้อมูลใน localStorage
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      } else {
        // ถ้าไม่มีเซสชัน และไม่มีข้อมูลผู้ใช้ใน localStorage ให้ล้างข้อมูลผู้ใช้
        if (!user.value) {
          user.value = null
          localStorage.removeItem('user')
        }
      }
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการเริ่มต้นการตรวจสอบสถานะการเข้าสู่ระบบ:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // เข้าสู่ระบบ
  const login = async (username: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('Attempting to login with username:', username)
      
      // ตรวจสอบว่าเป็น admin หรือไม่
      if (username === 'admin' && password === 'admin') {
        console.log('Admin login detected')
        
        // ดึงข้อมูล admin จากฐานข้อมูล
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('User')
          .select('*')
          .eq('role', 'admin')
          .single()
        
        if (adminError) {
          console.error('Error fetching admin data:', adminError)
          throw new Error('ไม่สามารถดึงข้อมูลผู้ดูแลระบบได้')
        }
        
        const adminUser = mapSupabaseUserToUser(adminData)
        
        // เก็บข้อมูลผู้ใช้ในสโตร์
        user.value = adminUser
        
        // เก็บข้อมูลผู้ใช้ใน localStorage พร้อมรหัสผ่าน (สำหรับใช้ re-login อัตโนมัติ)
        const userWithPassword = {
          ...adminUser,
          password: password
        }
        localStorage.setItem('user', JSON.stringify(userWithPassword))
        
        return adminUser
      }
      
      // ค้นหาผู้ใช้จาก username โดยตรง
      const { data: usernameData, error: usernameError } = await supabaseAdmin
        .from('User')
        .select('*')
        .ilike('username', username) // ใช้ ilike แทน eq เพื่อไม่สนใจตัวพิมพ์ใหญ่-เล็ก
      
      console.log('Username search result:', usernameData, usernameError)
      
      let userData = null
      
      if (usernameData && usernameData.length > 0) {
        userData = usernameData[0]
      }
      
      // ถ้าไม่พบจาก username ให้ลองค้นหาจาก email
      if (!userData) {
        const { data: emailData, error: emailError } = await supabaseAdmin
          .from('User')
          .select('*')
          .ilike('email', username) // ใช้ ilike แทน eq เพื่อไม่สนใจตัวพิมพ์ใหญ่-เล็ก
        
        console.log('Email search result:', emailData, emailError)
        
        if (emailData && emailData.length > 0) {
          userData = emailData[0]
        }
      }
      
      if (!userData) {
        throw new Error('ไม่พบผู้ใช้นี้ในระบบ')
      }
      
      console.log('Found user:', userData)
      
      // ตรวจสอบรหัสผ่าน
      if (userData.password !== password) {
        throw new Error('รหัสผ่านไม่ถูกต้อง')
      }
      
      // แปลงข้อมูลให้ตรงกับ Type ที่กำหนด
      const userWithCorrectType = mapSupabaseUserToUser(userData)
      
      // เก็บข้อมูลผู้ใช้ในสโตร์
      user.value = userWithCorrectType
      
      // เก็บข้อมูลผู้ใช้ใน localStorage พร้อมรหัสผ่าน (สำหรับใช้ re-login อัตโนมัติ)
      const userWithPassword = {
        ...userWithCorrectType,
        password: password
      }
      localStorage.setItem('user', JSON.stringify(userWithPassword))
      
      // สร้าง session ใน Supabase Auth
      try {
        let email = userWithCorrectType.email
        
        // ถ้าไม่มี email ให้ใช้ username แทน (เพื่อให้ Supabase Auth ทำงานได้)
        if (!email) {
          console.log('User has no email, using username as email')
          email = userWithCorrectType.username + '@example.com'
        }
        
        // ใช้ email และ password สำหรับ sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        })
        
        if (signInError) {
          console.warn('Could not create Supabase session:', signInError)
          
          // ถ้าไม่สามารถ sign in ได้ ให้ลองลงทะเบียนก่อน
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                id: userWithCorrectType.id,
                role: userWithCorrectType.role,
                username: userWithCorrectType.username,
                studentId: userWithCorrectType.studentId
              }
            }
          })
          
          if (signUpError) {
            console.warn('Could not sign up user:', signUpError)
          } else {
            console.log('User signed up:', signUpData)
          }
        } else {
          console.log('Supabase session created:', signInData)
        }
      } catch (signInErr) {
        console.warn('Error creating Supabase session:', signInErr)
      }
      
      return userWithCorrectType
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ออกจากระบบ
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      try {
        // พยายามออกจากระบบด้วย Supabase Auth
        const { error: err } = await supabase.auth.signOut()
        
        if (err) {
          console.warn('ไม่สามารถออกจากระบบใน Supabase Auth:', err.message)
        }
      } catch (authError) {
        console.warn('ไม่สามารถใช้ Supabase Auth:', authError)
      }
      
      // ล้างข้อมูลผู้ใช้และลบจาก localStorage
      user.value = null
      localStorage.removeItem('user')
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ลงทะเบียนนักศึกษา
  const registerStudent = async (studentData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null
      
      // ตรวจสอบว่าชื่อผู้ใช้ (รหัสนักศึกษา) มีอยู่แล้วหรือไม่
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('username', studentData.username)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError)
        throw new Error('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล: ' + checkError.message)
      }
      
      if (existingUser) {
        throw new Error('รหัสนักศึกษานี้มีอยู่ในระบบแล้ว')
      }
      
      // สร้าง UUID สำหรับผู้ใช้ใหม่
      const userId = crypto.randomUUID()
      
      // สร้างข้อมูลนักศึกษาใหม่
      const newStudent = {
        id: userId, // กำหนด id ด้วย UUID
        ...studentData,
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Saving new student:', newStudent)
      
      // บันทึกข้อมูลลงใน Supabase โดยตรง
      const { data, error: insertError } = await supabaseAdmin
        .from('User')
        .insert([newStudent])
        .select()
      
      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error('ไม่สามารถลงทะเบียนได้: ' + insertError.message)
      }
      
      if (!data || data.length === 0) {
        throw new Error('ไม่สามารถลงทะเบียนได้: ไม่ได้รับข้อมูลตอบกลับจากเซิร์ฟเวอร์')
      }
      
      // ลงทะเบียนผู้ใช้ใน Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: newStudent.email || `${newStudent.username}@example.com`,
        password: newStudent.password || '',
        options: {
          data: {
            user_id: newStudent.id
          }
        }
      })
      
      if (signUpError) {
        throw new Error('ไม่สามารถสร้างบัญชีผู้ใช้ได้: ' + signUpError.message)
      }
      
      // แปลงข้อมูลให้ตรงกับ Type ที่กำหนด
      const userWithCorrectType = mapSupabaseUserToUser(data[0])
      
      return userWithCorrectType
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ดึงข้อมูลโปรไฟล์ผู้ใช้
  const fetchUserProfile = async () => {
    try {
      loading.value = true
      
      // ตรวจสอบข้อมูลใน localStorage ก่อน
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          user.value = parsedUser
        } catch (err) {
          console.error('ไม่สามารถแปลงข้อมูลผู้ใช้จาก localStorage ได้:', err)
          localStorage.removeItem('user')
        }
      }
      
      // ดึงข้อมูลเซสชันปัจจุบัน
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // ถ้าไม่มีเซสชัน แต่มีข้อมูลผู้ใช้ใน localStorage ให้ใช้ข้อมูลจาก localStorage
        if (user.value) {
          return user.value
        }
        throw new Error('ไม่พบเซสชันผู้ใช้')
      }
      
      // ดึงข้อมูลผู้ใช้จาก Supabase
      const { data, error } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        // ถ้าไม่สามารถดึงข้อมูลจาก Supabase ได้ แต่มีข้อมูลใน localStorage ให้ใช้ข้อมูลจาก localStorage
        if (user.value) {
          console.warn('ไม่สามารถดึงข้อมูลจาก Supabase ได้ ใช้ข้อมูลจาก localStorage แทน')
          return user.value
        }
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้: ' + error.message)
      }
      
      if (data) {
        // แปลงข้อมูลให้ตรงกับ Type ที่กำหนด
        const userWithCorrectType = mapSupabaseUserToUser(data)
        user.value = userWithCorrectType
        // อัปเดตข้อมูลใน localStorage
        localStorage.setItem('user', JSON.stringify(userWithCorrectType))
        return userWithCorrectType
      }
      
      return user.value
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์ผู้ใช้:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // อัปเดตข้อมูลโปรไฟล์ผู้ใช้
  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null
      
      if (!user.value || !user.value.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }
      
      // อัปเดตข้อมูลผู้ใช้ใน Supabase
      const { data, error: updateError } = await supabaseAdmin
        .from('User')
        .update(userData)
        .eq('id', user.value.id)
        .select()
        .single()
      
      if (updateError) {
        throw new Error('ไม่สามารถอัปเดตข้อมูลผู้ใช้: ' + updateError.message)
      }
      
      if (!data) {
        throw new Error('ไม่พบข้อมูลผู้ใช้หลังการอัปเดต')
      }
      
      // แปลงข้อมูลให้ตรงกับ Type ที่กำหนด
      const userWithCorrectType = mapSupabaseUserToUser(data)
      
      // อัปเดตข้อมูลผู้ใช้ในสโตร์
      user.value = userWithCorrectType
      
      // อัปเดตข้อมูลผู้ใช้ใน localStorage
      localStorage.setItem('user', JSON.stringify(userWithCorrectType))
      
      return userWithCorrectType
    } catch (err: any) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    initAuth,
    login,
    logout,
    registerStudent,
    fetchUserProfile,
    updateUserProfile
  }
})
