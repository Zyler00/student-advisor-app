<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">จัดการข้อมูลอาจารย์</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">เพิ่ม แก้ไข และดูรายชื่ออาจารย์ทั้งหมด</p>
      </div>
      <button 
        @click="showAddModal = true" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        เพิ่มอาจารย์
      </button>
    </div>
    
    <!-- รายการอาจารย์ -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="advisors.length === 0" class="text-center py-8 text-gray-500">
        ไม่พบข้อมูลอาจารย์
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ตำแหน่งทางวิชาการ
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ภาควิชา
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อีเมล
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อผู้ใช้
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="advisor in advisors" :key="advisor.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      :src="advisor.profileImage || 'https://via.placeholder.com/40'" 
                      class="h-10 w-10 rounded-full object-cover" 
                      alt="Profile"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ advisor.firstName }} {{ advisor.lastName }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.academicPosition || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.department }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.email || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.username }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editAdvisor(advisor)" 
                  class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md text-sm"
                >
                  แก้ไข
                </button>
                <button 
                  @click="deleteAdvisor(advisor.id)" 
                  class="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-md text-sm ml-2"
                >
                  ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal เพิ่มอาจารย์ -->
    <div v-if="showAddModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showAddModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleAddAdvisor">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    เพิ่มอาจารย์ใหม่
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label for="academicPosition" class="block text-sm font-medium text-gray-700">ตำแหน่งทางวิชาการ</label>
                        <select
                          id="academicPosition"
                          v-model="formData.academicPosition"
                          class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">ไม่มี</option>
                          <option value="อาจารย์">อาจารย์</option>
                          <option value="ผู้ช่วยศาสตราจารย์">ผู้ช่วยศาสตราจารย์</option>
                          <option value="รองศาสตราจารย์">รองศาสตราจารย์</option>
                          <option value="ศาสตราจารย์">ศาสตราจารย์</option>
                        </select>
                      </div>
                      
                      <div>
                        <label for="department" class="block text-sm font-medium text-gray-700">ภาควิชา</label>
                        <select
                          id="department"
                          v-model="formData.department"
                          required
                          class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="" disabled>เลือกภาควิชา</option>
                          <option value="วิศวกรรมคอมพิวเตอร์">วิศวกรรมคอมพิวเตอร์</option>
                          <option value="วิศวกรรมไฟฟ้า">วิศวกรรมไฟฟ้า</option>
                          <option value="วิศวกรรมเครื่องกล">วิศวกรรมเครื่องกล</option>
                          <option value="วิศวกรรมโยธา">วิศวกรรมโยธา</option>
                          <option value="วิศวกรรมอุตสาหการ">วิศวกรรมอุตสาหการ</option>
                        </select>
                      </div>
                      
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
                          type="text"
                          id="phone"
                          v-model="formData.phone"
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label for="username" class="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                        <input
                          type="text"
                          id="username"
                          v-model="formData.username"
                          required
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                        <input
                          type="password"
                          id="password"
                          v-model="formData.password"
                          required
                          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div class="sm:col-span-2">
                        <label for="profileImage" class="block text-sm font-medium text-gray-700">รูปโปรไฟล์</label>
                        <input
                          type="file"
                          id="profileImage"
                          @change="handleFileUpload"
                          accept="image/*"
                          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
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
                @click="showAddModal = false"
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
import { useAdvisorStore } from '../../stores/advisor'
import type { User } from '../../types'
import { storageService } from '../../services/storageService'

const advisorStore = useAdvisorStore()

const advisors = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showAddModal = ref(false)
const formLoading = ref(false)
const isEditMode = ref(false)
const editId = ref<string | null>(null)

const formData = ref({
  academicPosition: '',
  firstName: '',
  lastName: '',
  department: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  profileImage: null as File | null
})

onMounted(async () => {
  await fetchAdvisors()
})

const fetchAdvisors = async () => {
  try {
    loading.value = true
    const data = await advisorStore.fetchAdvisors()
    advisors.value = data as User[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formData.value.profileImage = target.files[0]
  }
}

const handleAddAdvisor = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    if (isEditMode.value && editId.value) {
      if (formData.value.profileImage) {
        try {
          const profileImageUrl = await storageService.uploadProfileImage(
            formData.value.profileImage,
            editId.value
          )
          await advisorStore.updateAdvisorProfile({
            id: editId.value,
            profileImage: profileImageUrl
          })
          resetForm()
          showAddModal.value = false
          await fetchAdvisors()
          return
        } catch (uploadError: any) {
          console.error('ไม่สามารถอัปโหลดรูปภาพได้:', uploadError)
          error.value = 'ไม่สามารถอัปโหลดรูปภาพได้: ' + uploadError.message
          return
        }
      }
      
      const advisorData = {
        id: editId.value,
        academicPosition: formData.value.academicPosition,
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        department: formData.value.department,
        email: formData.value.email,
        phone: formData.value.phone,
        username: formData.value.username
      }
      
      if (formData.value.password) {
        Object.assign(advisorData, { password: formData.value.password })
      }
      
      await advisorStore.updateAdvisorProfile(advisorData)
    } else {
      const advisorData = {
        academicPosition: formData.value.academicPosition,
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        department: formData.value.department,
        email: formData.value.email,
        phone: formData.value.phone,
        username: formData.value.username,
        password: formData.value.password,
        role: 'advisor' as const
      }
      
      const result = await advisorStore.createAdvisor(advisorData)
      const createdAdvisor = result && result.length > 0 ? result[0] : null
      
      if (formData.value.profileImage && createdAdvisor && createdAdvisor.id) {
        try {
          const profileImageUrl = await storageService.uploadProfileImage(
            formData.value.profileImage,
            createdAdvisor.id
          )
          await advisorStore.updateAdvisorProfile({
            id: createdAdvisor.id,
            profileImage: profileImageUrl
          })
        } catch (uploadError) {
          console.error('ไม่สามารถอัปโหลดรูปภาพได้:', uploadError)
        }
      }
    }
    
    resetForm()
    showAddModal.value = false
    await fetchAdvisors()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const editAdvisor = (advisor: User) => {
  isEditMode.value = true
  editId.value = advisor.id
  
  formData.value = {
    academicPosition: advisor.academicPosition || '',
    firstName: advisor.firstName,
    lastName: advisor.lastName,
    department: advisor.department,
    email: advisor.email || '',
    phone: advisor.phone || '',
    username: advisor.username,
    password: '', 
    profileImage: null
  }
  
  showAddModal.value = true
}

const deleteAdvisor = async (advisorId: string) => {
  if (confirm('คุณต้องการลบข้อมูลอาจารย์นี้ใช่หรือไม่?')) {
    try {
      loading.value = true
      await advisorStore.deleteAdvisor(advisorId)
      await fetchAdvisors()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
}

const resetForm = () => {
  formData.value = {
    academicPosition: '',
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    profileImage: null
  }
  isEditMode.value = false
  editId.value = null
  error.value = null
}
</script>
