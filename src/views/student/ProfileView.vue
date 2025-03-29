<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">ข้อมูลส่วนตัว</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">ข้อมูลส่วนตัวและข้อมูลอาจารย์ที่ปรึกษาของคุณ</p>
    </div>
    
    <div class="border-t border-gray-200">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else class="px-4 py-5 sm:px-6">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <!-- ข้อมูลส่วนตัว -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">ข้อมูลนักศึกษา</h3>
              <button 
                @click="showEditModal = true" 
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                แก้ไขข้อมูล
              </button>
            </div>
            
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <div class="flex justify-center py-5">
                <div class="relative">
                  <img 
                    :src="user?.profileImage || 'https://via.placeholder.com/150'" 
                    class="h-32 w-32 rounded-full object-cover" 
                    alt="Profile"
                  />
                </div>
              </div>
              
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">รหัสนักศึกษา</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.studentId }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.firstName }} {{ user?.lastName }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">ภาควิชา</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.department }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">อีเมล</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.email || '-' }}</dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.phone || '-' }}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <!-- ข้อมูลอาจารย์ที่ปรึกษา -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">อาจารย์ที่ปรึกษา</h3>
            </div>
            
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <div v-if="!advisor" class="flex justify-center items-center h-64">
                <p class="text-sm text-gray-500">ยังไม่มีอาจารย์ที่ปรึกษา</p>
              </div>
              
              <div v-else>
                <div class="flex justify-center py-5">
                  <div class="relative">
                    <img 
                      :src="advisor.profileImage || 'https://via.placeholder.com/150'" 
                      class="h-32 w-32 rounded-full object-cover" 
                      alt="Advisor Profile"
                    />
                  </div>
                </div>
                
                <dl class="sm:divide-y sm:divide-gray-200">
                  <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ advisor.title }} {{ advisor.firstName }} {{ advisor.lastName }}</dd>
                  </div>
                  <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">ตำแหน่ง</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ advisor.position }}</dd>
                  </div>
                  <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">ภาควิชา</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ advisor.department }}</dd>
                  </div>
                  <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">อีเมล</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ advisor.email || '-' }}</dd>
                  </div>
                  <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">เบอร์โทรศัพท์</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ advisor.phone || '-' }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal แก้ไขข้อมูลส่วนตัว -->
    <div v-if="showEditModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showEditModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleUpdateProfile">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    แก้ไขข้อมูลส่วนตัว
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div class="flex justify-center">
                      <div class="relative">
                        <img 
                          :src="profileImagePreview || user?.profileImage || 'https://via.placeholder.com/150'" 
                          class="h-32 w-32 rounded-full object-cover" 
                          alt="Profile Preview"
                        />
                        <label 
                          for="profile-image" 
                          class="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 cursor-pointer"
                        >
                          <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                          </svg>
                        </label>
                        <input 
                          type="file" 
                          id="profile-image" 
                          @change="handleImageChange" 
                          accept="image/*" 
                          class="hidden"
                        />
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label for="firstName" class="block text-sm font-medium text-gray-700">ชื่อ</label>
                        <input
                          type="text"
                          id="firstName"
                          v-model="formData.firstName"
                          required
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label for="lastName" class="block text-sm font-medium text-gray-700">นามสกุล</label>
                        <input
                          type="text"
                          id="lastName"
                          v-model="formData.lastName"
                          required
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700">อีเมล</label>
                      <input
                        type="email"
                        id="email"
                        v-model="formData.email"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        id="phone"
                        v-model="formData.phone"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                      <span class="block sm:inline">{{ error }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="formLoading"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ formLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
              <button
                type="button"
                @click="showEditModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useAdvisorStore } from '../../stores/advisor'
import type { User } from '../../types'
import { storageService } from '../../services/storageService'

const authStore = useAuthStore()
const advisorStore = useAdvisorStore()

const user = ref<User | null>(null)
const advisor = ref<User | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showEditModal = ref(false)
const formLoading = ref(false)
const profileImagePreview = ref<string | null>(null)
const profileImageFile = ref<File | null>(null)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

onMounted(async () => {
  await fetchUserData()
})

const fetchUserData = async () => {
  try {
    loading.value = true
    
    // โหลดข้อมูลผู้ใช้
    const userData = await authStore.fetchUserProfile()
    user.value = userData
    
    // โหลดข้อมูลอาจารย์ที่ปรึกษา
    if (userData.advisorId) {
      const advisorData = await advisorStore.fetchAdvisorById(userData.advisorId)
      advisor.value = advisorData
    }
    
    // เตรียมข้อมูลสำหรับฟอร์ม
    formData.value = {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || ''
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    profileImageFile.value = file
    
    // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
    profileImagePreview.value = URL.createObjectURL(file)
  }
}

const handleUpdateProfile = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    // สร้างข้อมูลสำหรับอัปเดต
    const updateData = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone
    }
    
    // ถ้ามีการเปลี่ยนแปลงรูปภาพ ให้อัปโหลดไปยัง Supabase Storage
    if (profileImageFile.value) {
      try {
        // อัปโหลดรูปภาพไปยัง Supabase Storage
        const profileImageUrl = await storageService.uploadProfileImage(
          profileImageFile.value,
          authStore.user?.id || 'unknown-user'
        )
        
        // อัปเดตโปรไฟล์พร้อมกับ URL ของรูปภาพ
        await authStore.updateUserProfile({
          ...updateData,
          profileImage: profileImageUrl
        })
      } catch (uploadError) {
        console.error('ไม่สามารถอัปโหลดรูปภาพได้:', uploadError)
        // ถ้าอัปโหลดไม่สำเร็จ ให้อัปเดตข้อมูลอื่นๆ ไปก่อน
        await authStore.updateUserProfile(updateData)
      }
    } else {
      await authStore.updateUserProfile(updateData)
    }
    
    // ปิด modal และโหลดข้อมูลใหม่
    showEditModal.value = false
    await fetchUserData()
    
    // ล้างข้อมูลรูปภาพ
    profileImagePreview.value = null
    profileImageFile.value = null
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์'
  } finally {
    formLoading.value = false
  }
}
</script>
