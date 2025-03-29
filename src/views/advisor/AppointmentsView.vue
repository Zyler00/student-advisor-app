<template>
  <div>
    <div class="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <h3 class="text-lg leading-6 font-medium text-gray-900">จัดการการนัดหมาย</h3>
      <div class="mt-3 sm:mt-0 sm:ml-4">
        <button 
          @click="showCreateModal = true" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          สร้างการนัดหมายใหม่
        </button>
      </div>
    </div>

    <div class="mt-8">
      <div v-if="loading" class="text-center py-4">
        <div class="text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
      <div v-else-if="appointments.length === 0" class="text-center py-4 bg-white shadow rounded-lg">
        <div class="text-sm text-gray-500">ยังไม่มีการนัดหมาย</div>
      </div>
      <div v-else class="space-y-4">
        <div v-for="appointment in appointments" :key="appointment.id" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ appointment.topic }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                วันที่ขอนัดหมาย: {{ formatDate(appointment.requestDate) }}
              </p>
              <p v-if="appointment.appointmentDate" class="mt-1 max-w-2xl text-sm text-gray-500">
                วันที่นัดหมาย: {{ formatDateTime(appointment.appointmentDate) }}
              </p>
              <p v-if="appointment.preferredDate" class="mt-1 max-w-2xl text-sm text-gray-500">
                วันที่นักศึกษาต้องการ: {{ formatDate(appointment.preferredDate) }}
              </p>
              <p v-if="appointment.preferredTime" class="mt-1 max-w-2xl text-sm text-gray-500">
                ช่วงเวลาที่นักศึกษาสะดวก: {{ getPreferredTimeText(appointment.preferredTime) }}
              </p>
            </div>
            <div class="flex space-x-2">
              <span 
                :class="{
                  'px-2 py-1 text-xs font-medium rounded-full': true,
                  'bg-yellow-100 text-yellow-800': appointment.status === 'pending',
                  'bg-green-100 text-green-800': appointment.status === 'confirmed',
                  'bg-red-100 text-red-800': appointment.status === 'cancelled',
                  'bg-purple-100 text-purple-800': appointment.status === 'scheduled'
                }"
              >
                {{ getStatusText(appointment.status) }}
              </span>
              <button 
                @click="editAppointment(appointment)" 
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                แก้ไข
              </button>
            </div>
          </div>
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  รายละเอียด
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {{ appointment.description }}
                </dd>
              </div>
              <div v-if="appointment.location" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  สถานที่
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ appointment.location }}
                </dd>
              </div>
              <div v-if="studentData[appointment.studentId]" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  นักศึกษา
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ studentData[appointment.studentId].firstName }} {{ studentData[appointment.studentId].lastName }} ({{ studentData[appointment.studentId].studentId }})
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal สร้างการนัดหมายใหม่ -->
    <div v-if="showCreateModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showCreateModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="createAppointment">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    สร้างการนัดหมายใหม่
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="student" class="block text-sm font-medium text-gray-700">นักศึกษา</label>
                      <select 
                        id="student" 
                        v-model="formData.studentId" 
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="" disabled>เลือกนักศึกษา</option>
                        <option v-for="student in students" :key="student.id" :value="student.id">
                          {{ student.studentId }} - {{ student.firstName }} {{ student.lastName }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label for="title" class="block text-sm font-medium text-gray-700">หัวข้อการนัดหมาย</label>
                      <input 
                        type="text" 
                        id="title" 
                        v-model="formData.topic" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label for="description" class="block text-sm font-medium text-gray-700">รายละเอียด</label>
                      <textarea 
                        id="description" 
                        v-model="formData.description" 
                        rows="3" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label for="date" class="block text-sm font-medium text-gray-700">วันที่นัดหมาย</label>
                      <input 
                        type="date" 
                        id="date" 
                        v-model="formData.appointmentDate" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label for="location" class="block text-sm font-medium text-gray-700">สถานที่</label>
                      <input 
                        type="text" 
                        id="location" 
                        v-model="formData.location" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label for="note" class="block text-sm font-medium text-gray-700">บันทึกเพิ่มเติม</label>
                      <textarea 
                        id="note" 
                        v-model="formData.note" 
                        rows="2" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                      <span class="block sm:inline">{{ error }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                :disabled="formLoading"
              >
                {{ formLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
              <button 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="showCreateModal = false"
                :disabled="formLoading"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal แก้ไขการนัดหมาย -->
    <div v-if="showEditModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showEditModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="updateAppointment">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    แก้ไขการนัดหมาย
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="edit-student" class="block text-sm font-medium text-gray-700">นักศึกษา</label>
                      <div class="mt-1 text-sm text-gray-900">
                        {{ selectedStudentName }}
                      </div>
                    </div>
                    <div>
                      <label for="edit-title" class="block text-sm font-medium text-gray-700">หัวข้อการนัดหมาย</label>
                      <input 
                        type="text" 
                        id="edit-title" 
                        v-model="formData.topic" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label for="edit-description" class="block text-sm font-medium text-gray-700">รายละเอียด</label>
                      <textarea 
                        id="edit-description" 
                        v-model="formData.description" 
                        rows="3" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label for="edit-date" class="block text-sm font-medium text-gray-700">วันที่นัดหมาย</label>
                      <input 
                        type="date" 
                        id="edit-date" 
                        v-model="formData.appointmentDate" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label for="edit-location" class="block text-sm font-medium text-gray-700">สถานที่</label>
                      <input 
                        type="text" 
                        id="edit-location" 
                        v-model="formData.location" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label for="edit-note" class="block text-sm font-medium text-gray-700">บันทึกเพิ่มเติม</label>
                      <textarea 
                        id="edit-note" 
                        v-model="formData.note" 
                        rows="2" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                    <div>
                      <label for="edit-status" class="block text-sm font-medium text-gray-700">สถานะ</label>
                      <select 
                        id="edit-status" 
                        v-model="formData.status" 
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="pending">รอการยืนยัน</option>
                        <option value="scheduled">กำหนดการแล้ว</option>
                        <option value="confirmed">นักศึกษายืนยันแล้ว</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </div>
                    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                      <span class="block sm:inline">{{ error }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                :disabled="formLoading"
              >
                {{ formLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
              <button 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="showEditModal = false"
                :disabled="formLoading"
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
import { ref, computed, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { Appointment, User } from '../../types'

const advisorStore = useAdvisorStore()
const appointments = ref<Appointment[]>([])
const students = ref<User[]>([])
const studentData = ref<Record<string, any>>({}) // เพิ่มตัวแปรสำหรับเก็บข้อมูลนักศึกษาแยกตาม ID
const loading = ref(false)
const error = ref<string | null>(null)
const formLoading = ref(false)

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)

// Form data
const formData = ref({
  id: '',
  studentId: '',
  topic: '',
  description: '',
  appointmentDate: '',
  location: '',
  note: '',
  status: 'pending' as 'pending' | 'scheduled' | 'confirmed' | 'cancelled'
})

// Selected appointment for edit
const selectedAppointment = ref<Appointment | null>(null)

// คำนวณชื่อนักศึกษาที่เลือก
const selectedStudentName = computed(() => {
  if (!formData.value.studentId) return ''
  
  const student = students.value.find(s => s.id === formData.value.studentId)
  return student ? `${student.firstName} ${student.lastName}` : ''
})

// ฟังก์ชันสำหรับโหลดข้อมูลการนัดหมาย
const loadAppointments = async () => {
  try {
    loading.value = true
    error.value = null
    
    // ตรวจสอบว่ามีผู้ใช้ที่ล็อกอินอยู่หรือไม่
    const currentUser = authStore.user
    if (!currentUser) {
      error.value = 'กรุณาเข้าสู่ระบบก่อนดูข้อมูลการนัดหมาย'
      return
    }
    
    // ดึงข้อมูลการนัดหมายจากสโตร์
    await advisorStore.fetchAppointments()
    appointments.value = advisorStore.appointments
    
    // โหลดข้อมูลนักศึกษาสำหรับแต่ละการนัดหมาย
    await loadStudentData()
  } catch (err: any) {
    console.error('Error loading appointments:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// ฟังก์ชันสำหรับโหลดข้อมูลนักศึกษา
const loadStudentData = async () => {
  try {
    // สร้างเซตของ studentId ที่ไม่ซ้ำกัน
    const studentIds = new Set(appointments.value.map(appointment => appointment.studentId))
    
    // โหลดข้อมูลนักศึกษาสำหรับแต่ละ ID
    for (const studentId of studentIds) {
      try {
        const studentInfo = await advisorStore.fetchStudentById(studentId)
        if (studentInfo) {
          studentData.value[studentId] = studentInfo
        }
      } catch (studentErr) {
        console.error(`Error loading student data for ID ${studentId}:`, studentErr)
      }
    }
  } catch (err) {
    console.error('Error in loadStudentData:', err)
  }
}

// ดึงข้อมูลการนัดหมายและนักศึกษาเมื่อโหลดหน้า
onMounted(async () => {
  await loadAppointments()
  await advisorStore.fetchStudents()
  students.value = advisorStore.students
})

// สร้างการนัดหมายใหม่
const createAppointment = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    // ส่งข้อมูลไปยัง store
    const appointmentData = {
      studentId: formData.value.studentId,
      topic: formData.value.topic,
      description: formData.value.description,
      appointmentDate: formData.value.appointmentDate ? new Date(formData.value.appointmentDate) : null,
      location: formData.value.location,
      note: formData.value.note,
      status: formData.value.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled'
    }
    
    await advisorStore.requestAppointment(appointmentData)
    
    // รีเซ็ตฟอร์มและปิด modal
    resetForm()
    showCreateModal.value = false
    
    // โหลดข้อมูลใหม่
    await loadAppointments()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

// แก้ไขการนัดหมาย
const editAppointment = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  
  formData.value = {
    id: appointment.id,
    studentId: appointment.studentId,
    topic: appointment.topic || '',
    description: appointment.description || '',
    appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
    location: appointment.location || '',
    note: appointment.note || '',
    status: appointment.status
  }
  
  showEditModal.value = true
}

// อัปเดตการนัดหมาย
const updateAppointment = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    // ส่งข้อมูลไปยัง store
    const appointmentData = {
      id: formData.value.id,
      topic: formData.value.topic,
      description: formData.value.description,
      appointmentDate: formData.value.appointmentDate ? new Date(formData.value.appointmentDate) : null,
      location: formData.value.location,
      note: formData.value.note,
      status: formData.value.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled'
    }
    
    // ใช้ requestAppointment เพื่ออัปเดตข้อมูล
    await advisorStore.requestAppointment(appointmentData)
    
    // รีเซ็ตฟอร์มและปิด modal
    resetForm()
    showEditModal.value = false
    
    // โหลดข้อมูลใหม่
    await loadAppointments()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

// รีเซ็ตฟอร์ม
const resetForm = () => {
  formData.value = {
    id: '',
    studentId: '',
    topic: '',
    description: '',
    appointmentDate: '',
    location: '',
    note: '',
    status: 'pending' as 'pending' | 'scheduled' | 'confirmed' | 'cancelled'
  }
  selectedAppointment.value = null
}

// จัดรูปแบบวันที่
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return 'ไม่ระบุ'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'buddhist'
  }).format(dateObj)
}

// จัดรูปแบบวันที่และเวลา
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return 'ไม่ระบุ'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'buddhist',
    timeZone: 'Asia/Bangkok'
  }).format(dateObj)
}

// แปลงสถานะเป็นข้อความภาษาไทย
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'รอดำเนินการ'
    case 'scheduled':
      return 'กำหนดการแล้ว'
    case 'confirmed':
      return 'นักศึกษายืนยันแล้ว'
    case 'cancelled':
      return 'ยกเลิกแล้ว'
    default:
      return status
  }
}

// แปลงช่วงเวลาเป็นข้อความภาษาไทย
const getPreferredTimeText = (time?: string | null) => {
  if (!time) return ''
  
  switch (time) {
    case 'morning':
      return 'ช่วงเช้า (9:00 - 12:00)'
    case 'afternoon':
      return 'ช่วงบ่าย (13:00 - 16:00)'
    case 'evening':
      return 'ช่วงเย็น (16:00 - 18:00)'
    default:
      return time
  }
}
</script>
