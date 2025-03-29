<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">จัดการข้อมูลนักศึกษา</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">ค้นหา และกำหนดอาจารย์ที่ปรึกษาให้กับนักศึกษา</p>
      </div>
      <div class="flex items-center">
        <div class="relative rounded-md shadow-sm">
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="ค้นหาตามรหัสนักศึกษา ชื่อ หรือนามสกุล"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- รายการนักศึกษา -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="students.length === 0" class="text-center py-8 text-gray-500">
        ไม่พบข้อมูลนักศึกษา
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รหัสนักศึกษา
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ภาควิชา
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อีเมล
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                อาจารย์ที่ปรึกษา
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in students" :key="student.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ student.studentId }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      :src="student.profileImage || 'https://via.placeholder.com/40'" 
                      class="h-10 w-10 rounded-full object-cover" 
                      alt="Profile"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ student.firstName }} {{ student.lastName }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ student.department }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ student.email || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ getAdvisorName(student.id) || 'ยังไม่มีอาจารย์ที่ปรึกษา' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="assignAdvisor(student)" 
                  class="bg-green-500 text-white font-600 hover:text-indigo-900"
                >
                  กำหนดอาจารย์ที่ปรึกษา
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal กำหนดอาจารย์ที่ปรึกษา -->
    <div v-if="showAssignModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showAssignModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleAssignAdvisor">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    กำหนดอาจารย์ที่ปรึกษา
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      กำหนดอาจารย์ที่ปรึกษาให้กับ {{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }}
                    </p>
                  </div>
                  <div class="mt-4">
                    <label for="advisor" class="block text-sm font-medium text-gray-700">เลือกอาจารย์ที่ปรึกษา</label>
                    <select
                      id="advisor"
                      v-model="selectedAdvisorId"
                      required
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="" disabled>เลือกอาจารย์ที่ปรึกษา</option>
                      <option v-for="advisor in advisors" :key="advisor.id" :value="advisor.id">
                        {{ advisor.academicPosition ? advisor.academicPosition + ' ' : '' }}{{ advisor.firstName }} {{ advisor.lastName }}
                      </option>
                    </select>
                  </div>
                  
                  <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <span class="block sm:inline">{{ error }}</span>
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
                @click="showAssignModal = false"
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
import { supabase } from '../../services/supabase'

const advisorStore = useAdvisorStore()

const students = ref<User[]>([])
const advisors = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const showAssignModal = ref(false)
const formLoading = ref(false)
const selectedStudent = ref<User | null>(null)
const selectedAdvisorId = ref('')

// ตัวแปรสำหรับการแคช
const advisorMap = ref<Map<string, User>>(new Map())
const studentAdvisorMap = ref<Map<string, string>>(new Map())

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchAdvisors(), fetchRelations()])
})

const fetchStudents = async () => {
  try {
    loading.value = true
    const data = await advisorStore.fetchStudents()
    students.value = data as User[]
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchAdvisors = async () => {
  try {
    const data = await advisorStore.fetchAdvisors()
    advisors.value = data as User[]
    
    // สร้าง map ของอาจารย์
    advisorMap.value = new Map()
    advisors.value.forEach(advisor => {
      advisorMap.value.set(advisor.id, advisor)
    })
  } catch (err: any) {
    error.value = err.message
  }
}

const fetchRelations = async () => {
  try {
    // ดึงข้อมูลนักศึกษาที่มีอาจารย์ที่ปรึกษาแล้ว
    const { data, error: err } = await supabase
      .from('User')
      .select('id, advisorId')
      .eq('role', 'student')
      .not('advisorId', 'is', null)
    
    if (err) {
      throw new Error('ไม่สามารถดึงข้อมูลความสัมพันธ์ได้: ' + err.message)
    }
    
    // สร้าง map ของความสัมพันธ์ระหว่างนักศึกษาและอาจารย์
    studentAdvisorMap.value = new Map()
    data.forEach((student: { id: string, advisorId: string }) => {
      if (student.advisorId) {
        studentAdvisorMap.value.set(student.id, student.advisorId)
      }
    })
  } catch (err: any) {
    error.value = err.message
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    await fetchStudents()
    return
  }
  
  try {
    loading.value = true
    const data = await advisorStore.searchStudents(searchQuery.value)
    students.value = data
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const getAdvisorName = (studentId: string) => {
  const advisorId = studentAdvisorMap.value.get(studentId)
  if (!advisorId) return null
  
  const advisor = advisorMap.value.get(advisorId)
  if (!advisor) return null
  
  return `${advisor.academicPosition ? advisor.academicPosition + ' ' : ''}${advisor.firstName} ${advisor.lastName}`
}

const assignAdvisor = (student: User) => {
  selectedStudent.value = student
  selectedAdvisorId.value = studentAdvisorMap.value.get(student.id) || ''
  showAssignModal.value = true
}

const handleAssignAdvisor = async () => {
  if (!selectedStudent.value || !selectedAdvisorId.value) return
  
  try {
    formLoading.value = true
    error.value = null
    
    await advisorStore.assignAdvisorToStudent(selectedAdvisorId.value, selectedStudent.value.id)
    
    // อัปเดต map ของความสัมพันธ์
    studentAdvisorMap.value.set(selectedStudent.value.id, selectedAdvisorId.value)
    
    // รีเซ็ตฟอร์มและปิด modal
    showAssignModal.value = false
    selectedStudent.value = null
    selectedAdvisorId.value = ''
    
    // โหลดข้อมูลความสัมพันธ์ใหม่
    await fetchRelations()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}
</script>
