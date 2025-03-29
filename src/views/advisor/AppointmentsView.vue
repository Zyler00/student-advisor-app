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
                {{ appointment.title }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                วันที่นัดหมาย: {{ formatDateTimeRange(appointment.startTime, appointment.status) }}
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
                @click="openUpdateModal(appointment)" 
                class="text-blue-600 hover:text-blue-900"
              >
                อัปเดตสถานะ
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
                        v-model="formData.title" 
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
                        v-model="formData.startTime" 
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
    <div v-if="isUpdateModalOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">อัปเดตการนัดหมาย</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
          <select 
            v-model="updateData.status" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="scheduled">อาจารย์ยืนยันกำหนดการ</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">วันที่นัดหมาย</label>
          <input 
            type="datetime-local" 
            v-model="updateData.appointmentDate" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
          <textarea 
            v-model="updateData.note" 
            rows="3" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="isUpdateModalOpen = false" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ยกเลิก
          </button>
          <button 
            @click="updateAppointment" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import { supabaseAdmin } from '../../services/supabase'
import type { Appointment, User } from '../../types'

const advisorStore = useAdvisorStore()
const appointments = ref<Appointment[]>([])
const students = ref<User[]>([])
const studentData = ref<Record<string, any>>({}) 
const loading = ref(false)
const error = ref<string | null>(null)
const formLoading = ref(false)

const showCreateModal = ref(false)
const isUpdateModalOpen = ref(false)

const formData = ref({
  id: '',
  studentId: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  status: 'pending' as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
  location: '',
  note: ''
})

const selectedAppointment = ref<Appointment | null>(null)

const loadAppointments = async () => {
  try {
    loading.value = true
    error.value = null

    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      error.value = 'กรุณาเข้าสู่ระบบก่อนดูข้อมูลการนัดหมาย'
      loading.value = false
      return
    }
    
    const userData = JSON.parse(storedUser)
    console.log('User data from localStorage:', userData)

    const { error: fetchError } = await supabaseAdmin
      .from('Appointment')
      .select(`
        id,
        advisorId,
        studentId,
        title,
        description,
        startTime,
        endTime,
        status,
        location,
        note,
        createdAt,
        updatedAt
      `)
      .eq('advisorId', userData.id)
      .order('createdAt', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching appointments:', fetchError)
      error.value = `ไม่สามารถดึงข้อมูลการนัดหมายได้: ${fetchError.message}`
      loading.value = false
      return
    }
    
    console.log('Appointment data fetched:')
    appointments.value = []

    await loadStudentData()
  } catch (err) {
    console.error('Error loading appointments:', err)
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลการนัดหมาย'
  } finally {
    loading.value = false
  }
}

const loadStudentData = async () => {
  try {
    const uniqueStudentIds = new Set<string>()
    
    appointments.value.forEach(appointment => {
      if (appointment.studentId) {
        uniqueStudentIds.add(appointment.studentId)
      }
    })

    for (const studentId of uniqueStudentIds) {
      try {
        const { data, error } = await supabaseAdmin
          .from('User')
          .select('id, firstName, lastName, profileImage, department')
          .eq('id', studentId)
          .single()
        
        if (error) {
          console.error(`Error fetching student data for ID ${studentId}:`, error)
          continue
        }
        
        if (data) {
          studentData.value[studentId] = data
        }
      } catch (err) {
        console.error(`Exception when fetching student data for ID ${studentId}:`, err)
      }
    }
    
    console.log('Updated student data:', studentData.value)
  } catch (err) {
    console.error('Error in loadStudentData:', err)
  }
}

onMounted(async () => {
  await loadAppointments()
  await advisorStore.fetchStudents()
  students.value = advisorStore.students
})

const createAppointment = async () => {
  try {
    formLoading.value = true
    error.value = null

    const appointmentData = {
      studentId: formData.value.studentId,
      title: formData.value.title,
      description: formData.value.description,
      startTime: formData.value.startTime ? new Date(formData.value.startTime) : undefined,
      endTime: formData.value.endTime ? new Date(formData.value.endTime) : undefined,
      status: formData.value.status as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
      location: formData.value.location,
      note: formData.value.note
    }
    
    await advisorStore.requestAppointment(appointmentData)

    resetForm()
    showCreateModal.value = false

    await loadAppointments()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const updateData = ref({
  id: '',
  status: '',
  appointmentDate: '',
  note: ''
})

const updateAppointment = async () => {
  try {
    formLoading.value = true
    error.value = null
 
    const appointmentData = {
      id: updateData.value.id,
      status: updateData.value.status,
      startTime: updateData.value.appointmentDate ? new Date(updateData.value.appointmentDate).toISOString() : undefined,
      note: updateData.value.note
    }

    const { error: updateError } = await supabaseAdmin
      .from('Appointment')
      .update({
        status: appointmentData.status,
        startTime: appointmentData.startTime,
        note: appointmentData.note,
        updatedAt: new Date().toISOString()
      })
      .eq('id', appointmentData.id)
    
    if (updateError) {
      throw new Error(`ไม่สามารถอัปเดตการนัดหมายได้: ${updateError.message}`)
    }

    isUpdateModalOpen.value = false

    await loadAppointments()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: '',
    studentId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'pending' as 'pending' | 'scheduled' | 'confirmed' | 'cancelled',
    location: '',
    note: ''
  }
  selectedAppointment.value = null
}

const openUpdateModal = (appointment: Appointment) => {
  isUpdateModalOpen.value = true
  updateData.value = {
    id: appointment.id,
    status: appointment.status,
    appointmentDate: appointment.startTime ? new Date(appointment.startTime).toISOString().replace('Z', '') : '',
    note: appointment.note || ''
  }
}

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

const formatDateTimeRange = (date: Date | string | null | undefined, status: string) => {
  if (!date) return 'ไม่ระบุ'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const thaiTime = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000)

  const dateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'buddhist'
  })

  const timeFormatter = new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const formattedDate = dateFormatter.format(thaiTime)
  const formattedStartTime = timeFormatter.format(thaiTime)

  if (status === 'pending') {
    const endTime = new Date(thaiTime.getTime() + 3 * 60 * 60 * 1000)
    const formattedEndTime = timeFormatter.format(endTime)
    return `${formattedDate} เวลา ${formattedStartTime} - ${formattedEndTime} น.`
  } else {
    return `${formattedDate} เวลา ${formattedStartTime} น.`
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'รอดำเนินการ'
    case 'scheduled':
      return 'อาจารย์ยืนยันกำหนดการ'
    case 'confirmed':
      return 'ยืนยัน'
    case 'cancelled':
      return 'ยกเลิกแล้ว'
    default:
      return status
  }
}

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
