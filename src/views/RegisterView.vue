<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 w-full">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">ลงทะเบียนนักศึกษา</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          หรือ
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            เข้าสู่ระบบ
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="studentId" class="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              v-model="formData.studentId"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="รหัสนักศึกษา"
            />
          </div>
          
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">ชื่อ</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              v-model="formData.firstName"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ชื่อ"
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">นามสกุล</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              v-model="formData.lastName"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="นามสกุล"
            />
          </div>
          
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700">ภาควิชา</label>
            <select
              id="department"
              name="department"
              required
              v-model="formData.department"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="" disabled selected>เลือกภาควิชา</option>
              <option value="วิศวกรรมซอฟแวร์ ป.โท">วิศวกรรมซอฟแวร์ ป.โท</option>
              <option value="การจัดการควาามรู้และนวัฒกรรม ป.โท">การจัดการควาามรู้และนวัฒกรรม ป.โท</option>
              <option value="การจัดการเทคโนโลยีดิจิทัล ป.โท">การจัดการเทคโนโลยีดิจิทัล ป.โท</option>
              <option value="การจัดการควาามรู้และนวัฒกรรม ป.เอก">การจัดการควาามรู้และนวัฒกรรม ป.เอก</option>
              <option value="วิศวกรรมซอฟแวร์ ป.ตรี">วิศวกรรมซอฟแวร์ ป.ตรี</option>
              <option value="การจัดการสมัยใหม่และเทคโนโลยีสารสนเทศ ป.ตรี">การจัดการสมัยใหม่และเทคโนโลยีสารสนเทศ ป.ตรี</option>
              <option value="แอนนิเมชันและวิชวลเอฟเฟกต์ ป.ตรี">แอนนิเมชันและวิชวลเอฟเฟกต์ ป.ตรี</option>
              <option value="ดิจิทัลเกม ป.ตรี">ดิจิทัลเกม ป.ตรี</option>
              <option value="บูรณาการอุตสาหกรรมดิจิตัล ป.ตรี">บูรณาการอุตสาหกรรมดิจิตัล ป.ตรี</option>
            </select>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              v-model="formData.email"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="อีเมล"
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <input
              id="phone"
              name="phone"
              type="text"
              v-model="formData.phone"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="เบอร์โทรศัพท์"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="formData.password"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="รหัสผ่าน"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              v-model="confirmPassword"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ยืนยันรหัสผ่าน"
            />
          </div>
          
          <div>
            <label for="profileImage" class="block text-sm font-medium text-gray-700">รูปโปรไฟล์</label>
            <input
              id="profileImage"
              name="profileImage"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ error }}</span>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storageService } from '../services/storageService'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  studentId: '',
  firstName: '',
  lastName: '',
  department: '',
  email: '',
  phone: '',
  password: '',
  profileImage: null as File | null
})

const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const isFormValid = computed(() => {
  return (
    formData.value.studentId &&
    formData.value.firstName &&
    formData.value.lastName &&
    formData.value.department &&
    formData.value.password &&
    formData.value.password === confirmPassword.value
  )
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formData.value.profileImage = target.files[0]
  }
}

const handleRegister = async () => {
  if (formData.value.password !== confirmPassword.value) {
    error.value = 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }
  
  try {
    loading.value = true
    error.value = null

    const newStudent = {
      username: formData.value.studentId,
      password: formData.value.password,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      department: formData.value.department,
      email: formData.value.email,
      phone: formData.value.phone,
      studentId: formData.value.studentId,
      role: 'student' as const 
    }

    const registeredUser = await authStore.registerStudent(newStudent)

    if (formData.value.profileImage && registeredUser) {
      try {
        const profileImageUrl = await storageService.uploadProfileImage(
          formData.value.profileImage,
          registeredUser.id
        )
        
        await authStore.updateUserProfile({
          id: registeredUser.id,
          profileImage: profileImageUrl
        })
      } catch (uploadError) {
        console.error('ไม่สามารถอัปโหลดรูปภาพได้:', uploadError)
      }
    }

    router.push('/login')
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
  } finally {
    loading.value = false
  }
}
</script>
