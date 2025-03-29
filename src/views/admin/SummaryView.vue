<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">สรุปข้อมูล</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">รายงานสรุปข้อมูลอาจารย์ที่ปรึกษาและการนัดหมาย</p>
    </div>
    
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else>
        <div class="px-4 py-5 sm:px-6">
          <h4 class="text-md font-medium text-gray-900">รายการอาจารย์ที่ปรึกษา</h4>
        </div>
        
        <div class="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="advisor in paginatedAdvisors" :key="advisor.id">
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
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ก่อนหน้า
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ถัดไป
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                แสดง
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                ถึง
                <span class="font-medium">{{ Math.min(currentPage * pageSize, advisors.length) }}</span>
                จากทั้งหมด
                <span class="font-medium">{{ advisors.length }}</span>
                รายการ
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">ก่อนหน้า</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">ถัดไป</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        <div class="px-4 py-5 sm:px-6 mt-8">
          <h4 class="text-md font-medium text-gray-900">สรุปการนัดหมาย</h4>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 px-4 py-5 sm:px-6">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">การนัดหมายทั้งหมด</dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">{{ appointmentSummary.total }}</dd>
              </dl>
            </div>
          </div>
          
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">รอการยืนยัน</dt>
                <dd class="mt-1 text-3xl font-semibold text-yellow-500">{{ appointmentSummary.pending }}</dd>
              </dl>
            </div>
          </div>
          
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">อาจารย์ยืนยันกำหนดการ</dt>
                <dd class="mt-1 text-3xl font-semibold text-blue-500">{{ appointmentSummary.scheduled }}</dd>
              </dl>
            </div>
          </div>
          
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">ยืนยันแล้ว</dt>
                <dd class="mt-1 text-3xl font-semibold text-green-500">{{ appointmentSummary.confirmed }}</dd>
              </dl>
            </div>
          </div>
          
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">ยกเลิก</dt>
                <dd class="mt-1 text-3xl font-semibold text-red-500">{{ appointmentSummary.cancelled }}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto mt-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อาจารย์ที่ปรึกษา
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  นักศึกษา
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หัวข้อ
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่นัดหมาย
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="appointment in recentAppointments" :key="appointment.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getAdvisorName(appointment.advisorId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getStudentName(appointment.studentId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ appointment.topic || appointment.title }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(appointment.appointmentDate || appointment.startTime) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(appointment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { User, AdvisorStudentRelation, Appointment } from '../../types'

const advisorStore = useAdvisorStore()

const advisors = ref<User[]>([])
const students = ref<User[]>([])
const relations = ref<AdvisorStudentRelation[]>([])
const appointments = ref<Appointment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const advisorMap = ref<Map<string, User>>(new Map())
const studentMap = ref<Map<string, User>>(new Map())
const studentCountMap = ref<Map<string, number>>(new Map())

const currentPage = ref(1)
const pageSize = ref(5)

const appointmentSummary = ref({
  total: 0,
  pending: 0,
  scheduled: 0,
  confirmed: 0,
  cancelled: 0
})

const totalPages = computed(() => Math.ceil(advisors.value.length / pageSize.value))

const displayedPages = computed(() => {
  const pages = []
  const maxPagesToShow = 5
  
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
  let endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)
  
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  
  return pages
})

const paginatedAdvisors = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return advisors.value.slice(start, end)
})

const recentAppointments = computed(() => {
  return appointments.value
})

onMounted(async () => {
  loading.value = true
  try {
    await fetchAdvisors()
    await fetchStudents()
    await fetchRelations()
    await fetchAppointments()
    calculateStudentCounts()
    calculateAppointmentSummary()
    console.log('จำนวนการนัดหมายที่ดึงมาได้:', appointments.value.length)
    console.log('สรุปการนัดหมาย:', appointmentSummary.value)
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err)
  } finally {
    loading.value = false
  }
})

const fetchAdvisors = async () => {
  try {
    const data = await advisorStore.fetchAdvisors()
    advisors.value = data as User[]

    advisorMap.value = new Map()
    advisors.value.forEach(advisor => {
      advisorMap.value.set(advisor.id, advisor)
    })
  } catch (err: any) {
    error.value = err.message
  }
}

const fetchStudents = async () => {
  try {
    const data = await advisorStore.fetchStudents()
    students.value = data as User[]

    studentMap.value = new Map()
    students.value.forEach(student => {
      studentMap.value.set(student.id, student)
    })
  } catch (err: any) {
    error.value = err.message
  }
}

const fetchRelations = async () => {
  try {
    const data = await advisorStore.fetchAllRelations()
    relations.value = data as AdvisorStudentRelation[]
  } catch (err: any) {
    error.value = err.message
  }
}

const fetchAppointments = async () => {
  try {
    const data = await advisorStore.fetchAllAppointments()
    appointments.value = data as Appointment[]
  } catch (err: any) {
    error.value = err.message
  }
}

const calculateStudentCounts = () => {
  studentCountMap.value = new Map()

  relations.value.forEach(relation => {
    const count = studentCountMap.value.get(relation.advisorId) || 0
    studentCountMap.value.set(relation.advisorId, count + 1)
  })
}

const calculateAppointmentSummary = () => {
  console.log('กำลังคำนวณสรุปการนัดหมาย จากข้อมูลทั้งหมด:', appointments.value.length, 'รายการ')
  
  appointmentSummary.value = {
    total: appointments.value.length,
    pending: appointments.value.filter(a => a.status === 'pending').length,
    scheduled: appointments.value.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.value.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.value.filter(a => a.status === 'cancelled').length
  }
  
  console.log('สรุปการนัดหมายที่คำนวณได้:', appointmentSummary.value)
}

const getStudentCount = (advisorId: string) => {
  return studentCountMap.value.get(advisorId) || 0
}

const getAdvisorName = (advisorId: string) => {
  const advisor = advisorMap.value.get(advisorId)
  if (!advisor) return 'ไม่พบข้อมูล'
  
  return `${advisor.academicPosition ? advisor.academicPosition + ' ' : ''}${advisor.firstName} ${advisor.lastName}`
}

const getStudentName = (studentId: string) => {
  const student = studentMap.value.get(studentId)
  if (!student) return 'ไม่พบข้อมูล'
  
  return `${student.firstName} ${student.lastName}`
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการแปลงวันที่:', err, date)
    return '-'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'รอการยืนยัน'
    case 'scheduled':
      return 'กำหนดเวลาแล้ว'
    case 'confirmed':
      return 'ยืนยันแล้ว'
    case 'cancelled':
      return 'ยกเลิก'
    default:
      return status
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
}
</script>
