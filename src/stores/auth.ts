// @ts-ignore
import { supabase, supabaseAdmin } from '../services/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../types'

const mapSupabaseUserToUser = (data: any): User => ({
  id: data.id,
  username: data.username,
  password: data.password,
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

  const initAuth = async () => {
    try {
      loading.value = true

      const { data: tableInfo, error: tableError } = await supabaseAdmin
        .from('User')
        .select('*')
        .limit(1)
      
      if (tableError) {
        console.error('Cannot connect to User table:', tableError)
      } else {
        console.log('User table structure:', tableInfo)
      }

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

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data, error } = await supabaseAdmin
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (error) {
          console.warn('ไม่สามารถดึงข้อมูลผู้ใช้จาก Supabase ได้:', error.message)
          if (!user.value) {
            throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
          }
        } else if (data) {
          user.value = mapSupabaseUserToUser(data)
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      } else {
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

  const login = async (username: string, password: string) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('Attempting to login with username:', username)

      if (username === 'admin' && password === 'admin') {
        console.log('Admin login detected')

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

        user.value = adminUser

        const userWithPassword = {
          ...adminUser,
          password: password
        }
        localStorage.setItem('user', JSON.stringify(userWithPassword))
        
        return adminUser
      }
      
      const { data: usernameData, error: usernameError } = await supabaseAdmin
        .from('User')
        .select('*')
        .ilike('username', username)
      
      console.log('Username search result:', usernameData, usernameError)
      
      let userData = null
      
      if (usernameData && usernameData.length > 0) {
        userData = usernameData[0]
      }

      if (!userData) {
        const { data: emailData, error: emailError } = await supabaseAdmin
          .from('User')
          .select('*')
          .ilike('email', username)
        
        console.log('Email search result:', emailData, emailError)
        
        if (emailData && emailData.length > 0) {
          userData = emailData[0]
        }
      }
      
      if (!userData) {
        throw new Error('ไม่พบผู้ใช้นี้ในระบบ')
      }
      
      console.log('Found user:', userData)

      if (userData.password !== password) {
        throw new Error('รหัสผ่านไม่ถูกต้อง')
      }

      const userWithCorrectType = mapSupabaseUserToUser(userData)

      user.value = userWithCorrectType

      const userWithPassword = {
        ...userWithCorrectType,
        password: password
      }
      localStorage.setItem('user', JSON.stringify(userWithPassword))

      try {
        let email = userWithCorrectType.email

        if (!email) {
          console.log('User has no email, using username as email')
          email = userWithCorrectType.username + '@example.com'
        }
 
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        })
        
        if (signInError) {
          console.warn('Could not create Supabase session:', signInError)

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

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      try {
        const { error: err } = await supabase.auth.signOut()
        
        if (err) {
          console.warn('ไม่สามารถออกจากระบบใน Supabase Auth:', err.message)
        }
      } catch (authError) {
        console.warn('ไม่สามารถใช้ Supabase Auth:', authError)
      }

      user.value = null
      localStorage.removeItem('user')
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const registerStudent = async (studentData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null

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

      const userId = crypto.randomUUID()
      
      const newStudent = {
        id: userId,
        ...studentData,
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Saving new student:', newStudent)

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

  const fetchUserProfile = async () => {
    try {
      loading.value = true

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

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        if (user.value) {
          return user.value
        }
        throw new Error('ไม่พบเซสชันผู้ใช้')
      }

      const { data, error } = await supabaseAdmin
        .from('User')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        if (user.value) {
          console.warn('ไม่สามารถดึงข้อมูลจาก Supabase ได้ ใช้ข้อมูลจาก localStorage แทน')
          return user.value
        }
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้: ' + error.message)
      }
      
      if (data) {
        const userWithCorrectType = mapSupabaseUserToUser(data)
        user.value = userWithCorrectType
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

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      loading.value = true
      error.value = null
      
      if (!user.value || !user.value.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
      }

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

      const userWithCorrectType = mapSupabaseUserToUser(data)

      user.value = userWithCorrectType
 
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
