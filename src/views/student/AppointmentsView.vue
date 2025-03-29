<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabaseAdmin } from '../../services/supabase'
import type { Appointment } from '../../types'

const appointments = ref<Appointment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const showRequestModal = ref(false)
const formLoading = ref(false)
const formData = ref({
  topic: '',
  description: '',
  preferredDate: '',
  preferredTime: ''
})

const selectedAppointment = ref<Appointment | null>(null)

const loadAppointments = async () => {
  try {
    await fetchAppointments()
  } catch (err) {
    console.error('Error loading appointments:', err)
    error.value = 'ไม่สามารถโหลดข้อมูลการนัดหมายได้'
  }
}

const fetchAppointments = async () => {
  try {
    loading.value = true
  
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      error.value = 'ไม่พบข้อมูลผู้ใช้'
      loading.value = false
      return
    }
    
    const userData = JSON.parse(storedUser)
    console.log('User data from localStorage:', userData)

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

const handleRequestAppointment = async () => {
  try {
    formLoading.value = true
    error.value = null

    if (!formData.value.topic) {
      error.value = 'กรุณาระบุหัวข้อการนัดหมาย'
      formLoading.value = false
      return
    }

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

    console.log('User data from localStorage:', userData)

    const startDate = formData.value.preferredDate ? new Date(formData.value.preferredDate) : new Date()

    if (formData.value.preferredTime === 'ช่วงเช้า') {
      startDate.setHours(9, 0, 0, 0)
    } else if (formData.value.preferredTime === 'ช่วงบ่าย') {
      startDate.setHours(13, 0, 0, 0)
    } else if (formData.value.preferredTime === 'ช่วงเย็น') {
      startDate.setHours(16, 0, 0, 0)
    }
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
    
    const appointmentData = {
      topic: formData.value.topic,
      description: formData.value.description || '',
      preferredDate: formData.value.preferredDate || null,
      preferredTime: formData.value.preferredTime || null,
      advisorId: userData.advisorId,
      studentId: userData.id
    }

    const appointmentRecord = {
      id: crypto.randomUUID(),
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
   

    const {error: supabaseError } = await supabaseAdmin
      .from('Appointment')
      .insert([appointmentRecord])
      .select()
    
    if (supabaseError) {
      console.error('Error creating appointment:', supabaseError)
      error.value = `ไม่สามารถสร้างการนัดหมายได้: ${supabaseError.message}`
      formLoading.value = false
      return
    }

    formData.value = {
      topic: '',
      description: '',
      preferredDate: '',
      preferredTime: ''
    }

    showRequestModal.value = false

    await fetchAppointments()

    alert('ส่งคำขอนัดหมายเรียบร้อยแล้ว')
  } catch (err) {
    console.error('Error requesting appointment:', err)
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งคำขอนัดหมาย'
  } finally {
    formLoading.value = false
  }
}

const cancelAppointment = async (id: string) => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Cancelling appointment with ID:', id)

    const { error: deleteError } = await supabaseAdmin
      .from('Appointment')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      throw new Error(`ไม่สามารถยกเลิกการนัดหมายได้: ${deleteError.message}`)
    }

    appointments.value = appointments.value.filter(appointment => appointment.id !== id)

    alert('ยกเลิกการนัดหมายเรียบร้อยแล้ว')
    
  } catch (err: any) {
    error.value = err.message
    console.error('Error cancelling appointment:', err)
    alert(`เกิดข้อผิดพลาด: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const confirmAppointment = async (appointment: Appointment) => {
  try {
    loading.value = true
    error.value = null

    const { error: updateError } = await supabaseAdmin
      .from('Appointment')
      .update({
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      })
      .eq('id', appointment.id)
    
    if (updateError) {
      console.error('Supabase update error:', updateError)
      throw new Error(`ไม่สามารถยืนยันการนัดหมายได้: ${updateError.message}`)
    }

    const index = appointments.value.findIndex(a => a.id === appointment.id)
    if (index !== -1) {
      appointments.value[index].status = 'confirmed'
      appointments.value[index].updatedAt = new Date().toISOString()
    }

    alert('ยืนยันการนัดหมายเรียบร้อยแล้ว')
  } catch (err: any) {
    error.value = err.message
    console.error('Error confirming appointment:', err)
    alert(`เกิดข้อผิดพลาด: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const rejectAppointment = async (appointment: Appointment) => {
  try {
    loading.value = true
    error.value = null

    const { error: updateError } = await supabaseAdmin
      .from('Appointment')
      .update({
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .eq('id', appointment.id)
    
    if (updateError) {
      console.error('Supabase update error:', updateError)
      throw new Error(`ไม่สามารถปฏิเสธการนัดหมายได้: ${updateError.message}`)
    }

    const index = appointments.value.findIndex(a => a.id === appointment.id)
    if (index !== -1) {
      appointments.value[index].status = 'cancelled'
      appointments.value[index].updatedAt = new Date().toISOString()
    }

    alert('ปฏิเสธการนัดหมายเรียบร้อยแล้ว')
  } catch (err: any) {
    error.value = err.message
    console.error('Error rejecting appointment:', err)
    alert(`เกิดข้อผิดพลาด: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const cancelSelectedAppointment = async () => {
  if (!selectedAppointment.value) return
  
  if (confirm('คุณต้องการยกเลิกคำขอนัดหมายนี้ใช่หรือไม่?')) {
    try {
      loading.value = true
      await cancelAppointment(selectedAppointment.value.id)
      showDetailsModal.value = false
      await fetchAppointments()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
}

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

const formatDateTimeRange = (date: Date | string | null | undefined, status: string) => {
  if (!date) return 'ไม่ระบุ'
  
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)

  const thaiTime = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000) // เพิ่ม 7 ชั่วโมง

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
   
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="appointments.length === 0" class="text-center py-8 text-gray-500">
        ยังไม่มีการนัดหมาย
      </div>
      
      <div v-else class="overflow-x-auto">
        <div v-for="appointment in appointments" :key="appointment.id" class="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ appointment.title }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                วันที่นัดหมาย: {{ formatDateTimeRange(appointment.startTime, appointment.status) }}
              </p>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                สถานะ: {{ getStatusText(appointment.status) }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button 
                v-if="appointment.status === 'pending'"
                @click="cancelAppointment(appointment.id)" 
                class="text-red-600 hover:text-red-900"
              >
                ยกเลิก
              </button>
              <button 
                v-if="appointment.status === 'scheduled'"
                @click="confirmAppointment(appointment)" 
                class="text-green-600 hover:text-green-900"
              >
                ยืนยัน
              </button>
              <button 
                v-if="appointment.status === 'scheduled'"
                @click="rejectAppointment(appointment)" 
                class="text-red-600 hover:text-red-900"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
                            <button 
                              @click="rejectAppointment(selectedAppointment)" 
                              class="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                            >
                              ปฏิเสธการนัดหมาย
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
