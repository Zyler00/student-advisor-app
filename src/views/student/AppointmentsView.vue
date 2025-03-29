<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import { useAuthStore } from '../../stores/auth'
import { supabaseAdmin } from '../../services/supabase'
import type { Appointment } from '../../types'

const advisorStore = useAdvisorStore()
const authStore = useAuthStore()

// ข้อมูลการนัดหมาย
const appointments = ref<Appointment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// ข้อมูลสำหรับการนัดหมาย
const showRequestModal = ref(false)
const formLoading = ref(false)
const formData = ref({
  topic: '',
  description: '',
  preferredDate: '',
  preferredTime: ''
})

// การนัดหมายที่เลือก
const selectedAppointment = ref<Appointment | null>(null)

// โหลดข้อมูลการนัดหมาย
const loadAppointments = async () => {
  try {
    await fetchAppointments()
  } catch (err) {
    console.error('Error loading appointments:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลการนัดหมายได้'
  }
}

// ดึงข้อมูลการนัดหมายของนักศึกษา
const fetchAppointments = async () => {
  try {
    loading.value = true
    
    // ดึงข้อมูลผู้ใช้จาก localStorage
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      error.value = 'ไม่พบข้อมูลผู้ใช้'
      loading.value = false
      return
    }
    
    const userData = JSON.parse(storedUser)
    console.log('User data from localStorage:', userData)
    
    // ดึงข้อมูลการนัดหมายโดยตรงจาก Supabase
    const { data, error: fetchError } = await supabaseAdmin
      .from('Appointment')
      .select(`
        *,
        advisor:advisorId(id, firstName, lastName, profileImage, department)
      `)
      .eq('studentId', userData.id)
      .order('createdAt', { ascending: false })
    
    if (fetchError) {
      console.error('Error fetching appointments:', fetchError)
      error.value = `ไม่สามารถดึงข้อมูลการนัดหมายได้: ${fetchError.message}`
      loading.value = false
      return
    }
    
    console.log('Appointment data fetched:', data)
    appointments.value = data || []
  } catch (err) {
    console.error('Exception in fetchAppointments:', err)
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลการนัดหมาย'
  } finally {
    loading.value = false
  }
}

// ส่งคำขอนัดหมาย
const handleRequestAppointment = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
    if (!formData.value.topic) {
      error.value = 'กรุณาระบุหัวข้อการนัดหมาย'
      formLoading.value = false
      return
    }
    
    // ดึงข้อมูลผู้ใช้จาก localStorage เพื่อให้แน่ใจว่ามีข้อมูลล่าสุด
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      error.value = 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่'
      formLoading.value = false
      return
    }
    
    const userData = JSON.parse(storedUser)
    if (!userData.advisorId) {
      error.value = 'ไม่พบข้อมูลอาจารย์ที่ปรึกษา กรุณาติดต่อผู้ดูแลระบบ'
      formLoading.value = false
      return
    }
    
    // แสดงข้อมูลในคอนโซลเพื่อตรวจสอบ
    console.log('User data from localStorage:', userData)
    
    // กำหนดเวลาเริ่มต้นและสิ้นสุด (เพิ่ม 1 ชั่วโมงจากเวลาเริ่มต้น)
    const startDate = formData.value.preferredDate ? new Date(formData.value.preferredDate) : new Date()
    
    // ปรับเวลาตามช่วงเวลาที่เลือก
    if (formData.value.preferredTime === 'ช่วงเช้า') {
      startDate.setHours(9, 0, 0, 0)
    } else if (formData.value.preferredTime === 'ช่วงบ่าย') {
      startDate.setHours(13, 0, 0, 0)
    } else if (formData.value.preferredTime === 'ช่วงเย็น') {
      startDate.setHours(16, 0, 0, 0)
    }
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // เพิ่ม 1 ชั่วโมง
    
    // สร้างข้อมูลการนัดหมาย
    const appointmentData = {
      topic: formData.value.topic,
      description: formData.value.description || '',
      preferredDate: formData.value.preferredDate || null,
      preferredTime: formData.value.preferredTime || null,
      advisorId: userData.advisorId,
      studentId: userData.id
    }
    
    console.log('Sending appointment data:', appointmentData)
    
    // สร้างข้อมูลสำหรับส่งไปยัง Supabase
    const appointmentRecord = {
      id: crypto.randomUUID(), // สร้าง UUID สำหรับ id
      advisorId: appointmentData.advisorId,
      studentId: appointmentData.studentId,
      title: appointmentData.topic,
      description: appointmentData.description || null,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('Appointment record to be inserted:', appointmentRecord)
    
    // ส่งคำขอนัดหมายโดยตรงไปยัง Supabase
    const { data, error: supabaseError } = await supabaseAdmin
      .from('Appointment')
      .insert([appointmentRecord])
      .select()
    
    if (supabaseError) {
      console.error('Error creating appointment:', supabaseError)
      error.value = `ไม่สามารถสร้างการนัดหมายได้: ${supabaseError.message}`
      formLoading.value = false
      return
    }
    
    console.log('Appointment created successfully:', data)
    
    // รีเซ็ตฟอร์ม
    formData.value = {
      topic: '',
      description: '',
      preferredDate: '',
      preferredTime: ''
    }
    
    // ปิด modal
    showRequestModal.value = false
    
    // โหลดข้อมูลการนัดหมายใหม่
    await fetchAppointments()
    
    // แสดงข้อความสำเร็จ
    alert('ส่งคำขอนัดหมายเรียบร้อยแล้ว')
  } catch (err) {
    console.error('Error requesting appointment:', err)
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งคำขอนัดหมาย'
  } finally {
    formLoading.value = false
  }
}

// ดูรายละเอียดการนัดหมาย
const viewAppointmentDetails = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  showDetailsModal.value = true
}

// ยกเลิกการนัดหมาย
const cancelAppointment = async (id: string) => {
  if (confirm('คุณต้องการยกเลิกคำขอนัดหมายนี้ใช่หรือไม่?')) {
    try {
      loading.value = true
      await advisorStore.cancelStudentAppointment(id)
      await fetchAppointments()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
}

// ยืนยันการนัดหมาย
const confirmAppointment = async (appointment: Appointment) => {
  try {
    loading.value = true
    error.value = null
    
    await advisorStore.confirmStudentAppointment(appointment.id)
    
    // อัปเดตข้อมูลในหน้าจอ
    await fetchAppointments()
    
    // ถ้ากำลังแสดง modal รายละเอียด ให้ปิด
    if (showDetailsModal.value) {
      showDetailsModal.value = false
    }
    
    alert('ยืนยันการนัดหมายเรียบร้อยแล้ว')
  } catch (err: any) {
    error.value = err.message
    alert('เกิดข้อผิดพลาด: ' + err.message)
  } finally {
    loading.value = false
  }
}

// ยกเลิกการนัดหมายที่เลือก
const cancelSelectedAppointment = async () => {
  if (!selectedAppointment.value) return
  
  if (confirm('คุณต้องการยกเลิกคำขอนัดหมายนี้ใช่หรือไม่?')) {
    try {
      loading.value = true
      await advisorStore.cancelStudentAppointment(selectedAppointment.value.id)
      
      // ปิด modal และโหลดข้อมูลใหม่
      showDetailsModal.value = false
      await fetchAppointments()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
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
const getPreferredTimeText = (time: string | null | undefined) => {
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

// แปลงสถานะเป็นคลาส CSS
const getStatusClass = (status: string | undefined) => {
  if (!status) return ''
  
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'scheduled':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Modal แสดงรายละเอียดการนัดหมาย
const showDetailsModal = ref(false)

onMounted(async () => {
  await loadAppointments()
})
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">การนัดหมายกับอาจารย์ที่ปรึกษา</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">ขอนัดหมายและติดตามสถานะการนัดหมายกับอาจารย์ที่ปรึกษาของคุณ</p>
      </div>
      <button 
        @click="showRequestModal = true" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        ขอนัดหมายใหม่
      </button>
    </div>
    
    <!-- รายการการนัดหมาย -->
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="appointments.length === 0" class="text-center py-8 text-gray-500">
        ยังไม่มีการนัดหมาย
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
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
                สถานที่
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
            <tr v-for="appointment in appointments" :key="appointment.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ appointment.topic }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDateTime(appointment.requestDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="appointment.appointmentDate" class="text-sm text-gray-900">
                  {{ formatDateTime(appointment.appointmentDate) }}
                </div>
                <div v-else class="text-sm text-gray-500">รอการยืนยัน</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ appointment.location || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(appointment.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(appointment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    @click="viewAppointmentDetails(appointment)" 
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    รายละเอียด
                  </button>
                  <button 
                    v-if="appointment.status === 'pending' && !appointment.appointmentDate"
                    @click="cancelAppointment(appointment.id)" 
                    class="text-red-600 hover:text-red-900"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    v-if="appointment.status === 'pending' && appointment.appointmentDate"
                    @click="confirmAppointment(appointment)" 
                    class="text-green-600 hover:text-green-900"
                  >
                    ยืนยัน
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal ขอนัดหมายใหม่ -->
    <div v-if="showRequestModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showRequestModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleRequestAppointment">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    ขอนัดหมายกับอาจารย์ที่ปรึกษา
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="topic" class="block text-sm font-medium text-gray-700">หัวข้อการนัดหมาย</label>
                      <input
                        type="text"
                        id="topic"
                        v-model="formData.topic"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="เช่น ปรึกษาเรื่องการลงทะเบียน, ขอคำแนะนำเรื่องโครงงาน"
                      />
                    </div>
                    
                    <div>
                      <label for="description" class="block text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม</label>
                      <textarea
                        id="description"
                        v-model="formData.description"
                        rows="4"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="อธิบายรายละเอียดเพิ่มเติมเกี่ยวกับหัวข้อที่ต้องการปรึกษา"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label for="preferredDate" class="block text-sm font-medium text-gray-700">วันที่ต้องการนัดหมาย (ถ้ามี)</label>
                      <input
                        type="date"
                        id="preferredDate"
                        v-model="formData.preferredDate"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label for="preferredTime" class="block text-sm font-medium text-gray-700">ช่วงเวลาที่สะดวก (ถ้ามี)</label>
                      <div class="mt-1 grid grid-cols-3 gap-2">
                        <button 
                          type="button"
                          @click="formData.preferredTime = 'ช่วงเช้า'"
                          :class="[
                            'py-2 px-3 border rounded-md text-sm font-medium',
                            formData.preferredTime === 'ช่วงเช้า' 
                              ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          ]"
                        >
                          ช่วงเช้า<br>(9:00 - 12:00)
                        </button>
                        <button 
                          type="button"
                          @click="formData.preferredTime = 'ช่วงบ่าย'"
                          :class="[
                            'py-2 px-3 border rounded-md text-sm font-medium',
                            formData.preferredTime === 'ช่วงบ่าย' 
                              ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          ]"
                        >
                          ช่วงบ่าย<br>(13:00 - 16:00)
                        </button>
                        <button 
                          type="button"
                          @click="formData.preferredTime = 'ช่วงเย็น'"
                          :class="[
                            'py-2 px-3 border rounded-md text-sm font-medium',
                            formData.preferredTime === 'ช่วงเย็น' 
                              ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          ]"
                        >
                          ช่วงเย็น<br>(16:00 - 18:00)
                        </button>
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
                <span v-if="formLoading">กำลังส่ง...</span>
                <span v-else>ส่งคำขอนัดหมาย</span>
              </button>
              <button
                type="button"
                @click="showRequestModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal แสดงรายละเอียดการนัดหมาย -->
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
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">หัวข้อ</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedAppointment?.topic }}</p>
                  </div>
                  
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">รายละเอียด</h4>
                    <p class="mt-1 text-sm text-gray-900 whitespace-pre-line">{{ selectedAppointment?.description }}</p>
                  </div>
                  
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">วันที่ขอนัดหมาย</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(selectedAppointment?.requestDate) }}</p>
                  </div>
                  
                  <div v-if="selectedAppointment?.preferredDate">
                    <h4 class="text-sm font-medium text-gray-500">วันที่ต้องการนัดหมาย</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(selectedAppointment?.preferredDate) }}</p>
                  </div>
                  
                  <div v-if="selectedAppointment?.preferredTime">
                    <h4 class="text-sm font-medium text-gray-500">ช่วงเวลาที่ต้องการ</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ getPreferredTimeText(selectedAppointment.preferredTime) }}</p>
                  </div>
                  
                  <div v-if="selectedAppointment?.appointmentDate">
                    <h4 class="text-sm font-medium text-gray-500">วันที่นัดหมาย</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(selectedAppointment?.appointmentDate) }}</p>
                  </div>
                  
                  <div v-if="selectedAppointment?.location">
                    <h4 class="text-sm font-medium text-gray-500">สถานที่</h4>
                    <p class="mt-1 text-sm text-gray-900">{{ selectedAppointment?.location }}</p>
                  </div>
                  
                  <div v-if="selectedAppointment?.note">
                    <h4 class="text-sm font-medium text-gray-500">หมายเหตุจากอาจารย์</h4>
                    <p class="mt-1 text-sm text-gray-900 whitespace-pre-line">{{ selectedAppointment?.note }}</p>
                  </div>
                  
                  <div>
                    <h4 class="text-sm font-medium text-gray-500">สถานะ</h4>
                    <p class="mt-1 text-sm">
                      <span 
                        :class="[
                          'px-2 py-1 text-xs font-medium rounded-full', 
                          getStatusClass(selectedAppointment?.status)
                        ]"
                      >
                        {{ selectedAppointment?.status ? getStatusText(selectedAppointment.status) : '' }}
                      </span>
                    </p>
                  </div>
                  
                  <div v-if="selectedAppointment?.status === 'pending' && selectedAppointment?.appointmentDate" class="bg-yellow-50 p-4 rounded-md">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">รอการยืนยันจากคุณ</h3>
                        <div class="mt-2 text-sm text-yellow-700">
                          <p>อาจารย์ได้กำหนดวันและเวลานัดหมายแล้ว โปรดยืนยันการนัดหมายนี้</p>
                        </div>
                        <div class="mt-4">
                          <div class="-mx-2 -my-1.5 flex">
                            <button 
                              @click="confirmAppointment(selectedAppointment)" 
                              class="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                            >
                              ยืนยันการนัดหมาย
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
            <button
              v-if="selectedAppointment?.status === 'pending'"
              type="button"
              @click="cancelSelectedAppointment"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ยกเลิกการนัดหมาย
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
