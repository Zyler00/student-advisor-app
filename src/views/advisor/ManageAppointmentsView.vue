<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">จัดการการนัดหมาย</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">ตรวจสอบและจัดการคำขอนัดหมายจากนักศึกษา</p>
      </div>
      <div class="flex space-x-2">
        <select
          v-model="statusFilter"
          @change="filterAppointments"
          class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="all">ทั้งหมด</option>
          <option value="pending">รอการยืนยัน</option>
          <option value="confirmed">ยืนยันแล้ว</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
      </div>
    </div>
    
    <!-- รายการการนัดหมาย -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="filteredAppointments.length === 0" class="text-center py-8 text-gray-500">
        ไม่พบข้อมูลการนัดหมาย
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                นักศึกษา
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หัวข้อ
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่ขอนัดหมาย
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่นัดหมาย
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="appointment in filteredAppointments" :key="appointment.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      :src="getStudentImage(appointment.studentId)" 
                      class="h-10 w-10 rounded-full object-cover" 
                      alt="Profile"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getStudentName(appointment.studentId) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ getStudentId(appointment.studentId) }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ appointment.topic }}</div>
                <div v-if="appointment.description" class="text-sm text-gray-500 truncate max-w-xs">
                  {{ appointment.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(appointment.requestDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="appointment.appointmentDate" class="text-sm text-gray-900">
                  {{ formatDate(appointment.appointmentDate) }}
                </div>
                <div v-else class="text-sm text-gray-500">ยังไม่กำหนด</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(appointment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(appointment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    v-if="appointment.status === 'pending'"
                    @click="confirmAppointment(appointment)" 
                    class="text-green-600 hover:text-green-900"
                  >
                    ยืนยัน
                  </button>
                  <button 
                    v-if="appointment.status === 'pending'"
                    @click="cancelAppointment(appointment.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    ปฏิเสธ
                  </button>
                  <button 
                    v-if="appointment.status === 'confirmed'"
                    @click="cancelAppointment(appointment.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    @click="viewAppointmentDetails(appointment)" 
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    รายละเอียด
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal ยืนยันการนัดหมาย -->
    <div v-if="showConfirmModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showConfirmModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleConfirmAppointment">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    ยืนยันการนัดหมาย
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      กรุณากำหนดวันและเวลาสำหรับการนัดหมายกับ {{ getStudentName(selectedAppointment?.studentId || '') }}
                    </p>
                  </div>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="appointmentDate" class="block text-sm font-medium text-gray-700">วันที่นัดหมาย</label>
                      <input
                        type="date"
                        id="appointmentDate"
                        v-model="appointmentDate"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label for="appointmentTime" class="block text-sm font-medium text-gray-700">เวลานัดหมาย</label>
                      <input
                        type="time"
                        id="appointmentTime"
                        v-model="appointmentTime"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label for="location" class="block text-sm font-medium text-gray-700">สถานที่</label>
                      <input
                        type="text"
                        id="location"
                        v-model="location"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="เช่น ห้องพักอาจารย์ ชั้น 3 อาคารวิศวกรรมศาสตร์"
                      />
                    </div>
                    
                    <div>
                      <label for="note" class="block text-sm font-medium text-gray-700">หมายเหตุ (ถ้ามี)</label>
                      <textarea
                        id="note"
                        v-model="note"
                        rows="3"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
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
                {{ formLoading ? 'กำลังบันทึก...' : 'ยืนยันการนัดหมาย' }}
              </button>
              <button
                type="button"
                @click="showConfirmModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal รายละเอียดการนัดหมาย -->
    <div v-if="showDetailsModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDetailsModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  รายละเอียดการนัดหมาย
                </h3>
                <div class="mt-4 space-y-4">
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">นักศึกษา</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ getStudentName(selectedAppointment?.studentId || '') }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">รหัสนักศึกษา</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ getStudentId(selectedAppointment?.studentId || '') }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">หัวข้อ</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ selectedAppointment?.topic }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">รายละเอียด</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ selectedAppointment?.description || '-' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">วันที่ขอนัดหมาย</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ formatDate(selectedAppointment?.requestDate) }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">วันที่นัดหมาย</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ selectedAppointment?.appointmentDate ? formatDate(selectedAppointment.appointmentDate) : 'ยังไม่กำหนด' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">สถานที่</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ selectedAppointment?.location || '-' }}
                    </dd>
                  </div>
                  <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">หมายเหตุ</dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {{ selectedAppointment?.note || '-' }}
                    </dd>
                  </div>
                  <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
                    <dt class="text-sm font-medium text-gray-500">สถานะ</dt>
                    <dd class="mt-1 sm:mt-0 sm:col-span-2">
                      <span :class="getStatusClass(selectedAppointment?.status || '')" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ getStatusText(selectedAppointment?.status || '') }}
                      </span>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="showDetailsModal = false"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { User, Appointment } from '../../types'

const advisorStore = useAdvisorStore()

const appointments = ref<Appointment[]>([])
const students = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const statusFilter = ref('all')
const showConfirmModal = ref(false)
const showDetailsModal = ref(false)
const formLoading = ref(false)
const selectedAppointment = ref<Appointment | null>(null)

// ข้อมูลสำหรับการยืนยันการนัดหมาย
const appointmentDate = ref('')
const appointmentTime = ref('')
const location = ref('')
const note = ref('')

// ตัวแปรสำหรับการแคช
const studentMap = ref<Map<string, User>>(new Map())

// กรองการนัดหมายตามสถานะ
const filteredAppointments = computed(() => {
  if (statusFilter.value === 'all') {
    return appointments.value
  }
  return appointments.value.filter(appointment => appointment.status === statusFilter.value)
})

onMounted(async () => {
  await Promise.all([fetchAppointments(), fetchStudents()])
})

const fetchAppointments = async () => {
  try {
    loading.value = true
    const data = await advisorStore.fetchAppointments()
    appointments.value = data
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const fetchStudents = async () => {
  try {
    const data = await advisorStore.fetchAdvisorStudents()
    students.value = data
    
    // สร้าง map ของนักศึกษา
    studentMap.value = new Map()
    students.value.forEach(student => {
      studentMap.value.set(student.id, student)
    })
  } catch (err: any) {
    error.value = err.message
  }
}

const filterAppointments = () => {
  // ไม่ต้องทำอะไรเพิ่มเติม เพราะใช้ computed property
}

const getStudentName = (studentId: string) => {
  const student = studentMap.value.get(studentId)
  if (!student) return 'ไม่พบข้อมูล'
  
  return `${student.firstName} ${student.lastName}`
}

const getStudentId = (studentId: string) => {
  const student = studentMap.value.get(studentId)
  if (!student) return ''
  
  return student.studentId || ''
}

const getStudentImage = (studentId: string) => {
  const student = studentMap.value.get(studentId)
  if (!student || !student.profileImage) {
    return 'https://via.placeholder.com/40'
  }
  
  return student.profileImage
}

const formatDate = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const confirmAppointment = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  appointmentDate.value = ''
  appointmentTime.value = ''
  location.value = ''
  note.value = ''
  showConfirmModal.value = true
}

const handleConfirmAppointment = async () => {
  if (!selectedAppointment.value) return
  
  try {
    formLoading.value = true
    error.value = null
    
    // สร้างวันที่นัดหมายจากข้อมูลที่กรอก
    const dateTime = new Date(`${appointmentDate.value}T${appointmentTime.value}`)
    
    // อัปเดตข้อมูลการนัดหมาย
    await advisorStore.confirmAppointment(
      selectedAppointment.value.id,
      dateTime,
      location.value,
      note.value
    )
    
    // รีเซ็ตฟอร์มและปิด modal
    showConfirmModal.value = false
    selectedAppointment.value = null
    
    // โหลดข้อมูลการนัดหมายใหม่
    await fetchAppointments()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const cancelAppointment = async (id: string) => {
  if (confirm('คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่?')) {
    try {
      loading.value = true
      await advisorStore.cancelAppointment(id)
      await fetchAppointments()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
}

const viewAppointmentDetails = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  showDetailsModal.value = true
}

// ฟังก์ชันสำหรับการเปิด URL
const openUrl = (url: string) => {
  window.open(url, '_blank')
}
</script>
