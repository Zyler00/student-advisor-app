<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">จัดการประกาศ</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">สร้างและจัดการประกาศสำหรับนักศึกษาในที่ปรึกษา</p>
      </div>
      <button 
        @click="showAddModal = true" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        สร้างประกาศใหม่
      </button>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
      
      <div v-else-if="announcements.length === 0" class="text-center py-8 text-gray-500">
        ยังไม่มีประกาศ
      </div>
      
      <div v-else class="flow-root px-4 py-5">
        <ul role="list" class="-my-5 divide-y divide-gray-200">
          <li v-for="announcement in announcements" :key="announcement.id" class="py-5">
            <div class="relative focus-within:ring-2 focus-within:ring-indigo-500">
              <h3 class="text-sm font-semibold text-gray-800">
                <span class="absolute inset-0" aria-hidden="true"></span>
                {{ announcement.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ announcement.description }}</p>
              <div class="mt-2 flex items-center space-x-4">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ formatDate(announcement.createdAt) }}</span>
                </div>
                
                <div v-if="announcement.fileUrl" class="flex items-center text-sm text-indigo-500 cursor-pointer" @click="openUrl(announcement.fileUrl)">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                  </svg>
                  <span>ไฟล์แนบ</span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button 
                    @click="editAnnouncement(announcement)" 
                    class="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    แก้ไข
                  </button>
                  <button 
                    @click="deleteAnnouncement(announcement.id)" 
                    class="text-sm text-red-600 hover:text-red-900"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="showAddModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showAddModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleAddAnnouncement">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ isEditMode ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่' }}
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="title" class="block text-sm font-medium text-gray-700">หัวข้อประกาศ</label>
                      <input
                        type="text"
                        id="title"
                        v-model="formData.title"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label for="content" class="block text-sm font-medium text-gray-700">เนื้อหาประกาศ</label>
                      <textarea
                        id="content"
                        v-model="formData.content"
                        rows="4"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label for="file" class="block text-sm font-medium text-gray-700">ไฟล์แนบ (ถ้ามี)</label>
                      <input
                        type="file"
                        id="file"
                        @change="handleFileUpload"
                        class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p v-if="formData.fileName" class="mt-2 text-sm text-gray-500">
                        ไฟล์ปัจจุบัน: {{ formData.fileName }}
                      </p>
                    </div>
                    
                    <div>
                      <label for="targetGroup" class="block text-sm font-medium text-gray-700">กลุ่มเป้าหมาย</label>
                      <select
                        id="targetGroup"
                        v-model="formData.targetGroup"
                        required
                        class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="all">นักศึกษาทุกคนในที่ปรึกษา</option>
                        <option value="department">เฉพาะนักศึกษาในภาควิชา</option>
                        <option value="custom">เลือกนักศึกษาเอง</option>
                      </select>
                    </div>
                    
                    <div v-if="formData.targetGroup === 'custom'">
                      <label class="block text-sm font-medium text-gray-700">เลือกนักศึกษา</label>
                      <div class="mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                        <div v-for="student in students" :key="student.id" class="flex items-center px-4 py-2 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            :id="`student-${student.id}`"
                            v-model="selectedStudents"
                            :value="student.id"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label :for="`student-${student.id}`" class="ml-3 block text-sm text-gray-700">
                            {{ student.studentId }} - {{ student.firstName }} {{ student.lastName }}
                          </label>
                        </div>
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
import type { User, Announcement } from '../../types'

const advisorStore = useAdvisorStore()

const announcements = ref<Announcement[]>([])
const students = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showAddModal = ref(false)
const formLoading = ref(false)
const isEditMode = ref(false)
const editId = ref<string | null>(null)
const selectedStudents = ref<string[]>([])

const formData = ref({
  title: '',
  content: '',
  file: null as File | null,
  fileName: '',
  fileUrl: '',
  targetGroup: 'all'
})

onMounted(async () => {
  await Promise.all([fetchAnnouncements(), fetchStudents()])
})

const fetchAnnouncements = async () => {
  try {
    loading.value = true
    const data = await advisorStore.fetchAnnouncements()
    announcements.value = data
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
  } catch (err: any) {
    error.value = err.message
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    formData.value.file = target.files[0]
    formData.value.fileName = target.files[0].name
  }
}

const handleAddAnnouncement = async () => {
  try {
    formLoading.value = true
    error.value = null

    let fileUrl = formData.value.fileUrl
    if (formData.value.file) {
      fileUrl = 'https://example.com/files/' + formData.value.fileName
    }

    const announcementData = {
      title: formData.value.title,
      description: formData.value.content,
      fileUrl: fileUrl,
      fileName: formData.value.fileName
    }
    
    if (isEditMode.value && editId.value) {
      await advisorStore.updateAnnouncement(editId.value, announcementData)
    } else {
      await advisorStore.createAnnouncement(announcementData)
    }

    resetForm()
    showAddModal.value = false

    await fetchAnnouncements()
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const editAnnouncement = (announcement: Announcement) => {
  isEditMode.value = true
  editId.value = announcement.id

  formData.value = {
    title: announcement.title,
    content: announcement.description || '',
    file: null,
    fileName: announcement.fileName || '',
    fileUrl: announcement.fileUrl || '',
    targetGroup: 'all'
  }

  selectedStudents.value = []
  
  showAddModal.value = true
}

const deleteAnnouncement = async (id: string) => {
  if (confirm('คุณต้องการลบประกาศนี้ใช่หรือไม่?')) {
    try {
      loading.value = true
      await advisorStore.deleteAnnouncement(id)
      await fetchAnnouncements()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    file: null,
    fileName: '',
    fileUrl: '',
    targetGroup: 'all'
  }
  selectedStudents.value = []
  isEditMode.value = false
  editId.value = null
  error.value = null
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

const openUrl = (url: string) => {
  window.open(url, '_blank')
}
</script>
