<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">นักศึกษาในที่ปรึกษา</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">รายชื่อนักศึกษาที่อยู่ในความดูแลของท่าน</p>
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
                เบอร์โทรศัพท์
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
                <div class="text-sm text-gray-900">{{ student.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link 
                  :to="{ name: 'student-detail', params: { id: student.id } }" 
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  ดูข้อมูล
                </router-link>
                <router-link 
                  :to="{ name: 'student-detail', params: { id: student.id } }" 
                  class="text-green-600 hover:text-green-900"
                >
                  สนทนา
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { User } from '../../types'

const advisorStore = useAdvisorStore()

const students = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

onMounted(async () => {
  await fetchStudents()
})

const fetchStudents = async () => {
  try {
    loading.value = true
    const data = await advisorStore.fetchAdvisorStudents()
    console.log('Fetched students data:', data)
    
    if (!data || data.length === 0) {
      console.warn('No student data received from advisorStore.fetchAdvisorStudents()')
      students.value = []
      return
    }
    
    students.value = data
  } catch (err: any) {
    console.error('Error fetching students:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    // ถ้าไม่มีคำค้นหา ให้แสดงนักศึกษาทั้งหมด
    fetchStudents()
    return
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  
  // กรองนักศึกษาตามคำค้นหา
  students.value = students.value.filter(student => 
    (student.studentId && student.studentId.toLowerCase().includes(query)) ||
    (student.firstName && student.firstName.toLowerCase().includes(query)) ||
    (student.lastName && student.lastName.toLowerCase().includes(query)) ||
    (student.email && student.email.toLowerCase().includes(query))
  )
}
</script>
