<template>
  <div>
    <div class="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <h3 class="text-lg leading-6 font-medium text-gray-900">จัดการประกาศ</h3>
      <div class="mt-3 sm:mt-0 sm:ml-4">
        <button 
          @click="showCreateModal = true" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          สร้างประกาศใหม่
        </button>
      </div>
    </div>

    <div class="mt-8">
      <div v-if="loading" class="text-center py-4">
        <div class="text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
      <div v-else-if="announcements.length === 0" class="text-center py-4 bg-white shadow rounded-lg">
        <div class="text-sm text-gray-500">ยังไม่มีประกาศ</div>
      </div>
      <div v-else class="space-y-4">
        <div v-for="announcement in announcements" :key="announcement.id" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ announcement.title }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                วันที่ประกาศ: {{ formatDate(announcement.createdAt) }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editAnnouncement(announcement)" 
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                แก้ไข
              </button>
              <button 
                @click="confirmDelete(announcement)" 
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ลบ
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
                  {{ announcement.description }}
                </dd>
              </div>
              <div v-if="announcement.fileUrl" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  ไฟล์แนบ
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                    </svg>
                    <button 
                      @click="openUrl(announcement.fileUrl)" 
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      ดาวน์โหลดไฟล์
                    </button>
                  </div>
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
          <form @submit.prevent="createAnnouncement">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    สร้างประกาศใหม่
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="title" class="block text-sm font-medium text-gray-700">หัวข้อประกาศ</label>
                      <input 
                        type="text" 
                        id="title" 
                        v-model="formData.title" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label for="content" class="block text-sm font-medium text-gray-700">รายละเอียด</label>
                      <textarea 
                        id="content" 
                        v-model="formData.description" 
                        rows="4" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label for="file" class="block text-sm font-medium text-gray-700">ไฟล์แนบ (ถ้ามี)</label>
                      <input 
                        type="file" 
                        id="file" 
                        @change="handleFileUpload"
                        class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
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
    <div v-if="showEditModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showEditModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="updateAnnouncement">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    แก้ไขประกาศ
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="edit-title" class="block text-sm font-medium text-gray-700">หัวข้อประกาศ</label>
                      <input 
                        type="text" 
                        id="edit-title" 
                        v-model="formData.title" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label for="edit-content" class="block text-sm font-medium text-gray-700">รายละเอียด</label>
                      <textarea 
                        id="edit-content" 
                        v-model="formData.description" 
                        rows="4" 
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label for="edit-file" class="block text-sm font-medium text-gray-700">ไฟล์แนบ (ถ้ามี)</label>
                      <div v-if="formData.fileUrl" class="mb-2 flex items-center">
                        <span class="text-sm text-gray-500 mr-2">ไฟล์ปัจจุบัน:</span>
                        <button 
                          type="button"
                          @click="openUrl(formData.fileUrl)" 
                          class="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          ดูไฟล์
                        </button>
                        <button 
                          type="button"
                          @click="removeFile" 
                          class="ml-2 text-red-600 hover:text-red-900 text-sm"
                        >
                          ลบไฟล์
                        </button>
                      </div>
                      <input 
                        type="file" 
                        id="edit-file" 
                        @change="handleFileUpload"
                        class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
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
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDeleteModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  ยืนยันการลบประกาศ
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="deleteAnnouncement"
              :disabled="formLoading"
            >
              {{ formLoading ? 'กำลังลบ...' : 'ลบ' }}
            </button>
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showDeleteModal = false"
              :disabled="formLoading"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { Announcement } from '../../types'

const advisorStore = useAdvisorStore()
const announcements = ref<Announcement[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const formLoading = ref(false)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const formData = ref({
  id: '',
  title: '',
  description: '',
  fileUrl: '',
  file: null as File | null,
  fileName: ''
})

const selectedAnnouncement = ref<Announcement | null>(null)

onMounted(async () => {
  try {
    await advisorStore.fetchAnnouncements()
    announcements.value = advisorStore.announcements
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    formData.value.file = input.files[0]
    formData.value.fileName = input.files[0].name
  }
}

const createAnnouncement = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    await advisorStore.createAnnouncement({
      title: formData.value.title,
      description: formData.value.description
    }, formData.value.file)

    resetForm()
    showCreateModal.value = false

    announcements.value = advisorStore.announcements
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const editAnnouncement = (announcement: Announcement) => {
  selectedAnnouncement.value = announcement
  formData.value = {
    id: announcement.id,
    title: announcement.title,
    description: announcement.description || '',
    fileUrl: announcement.fileUrl || '',
    file: null,
    fileName: ''
  }
  showEditModal.value = true
}

const updateAnnouncement = async () => {
  try {
    formLoading.value = true
    error.value = null
    
    await advisorStore.updateAnnouncement(
      formData.value.id,
      {
        title: formData.value.title,
        description: formData.value.description,
        fileUrl: formData.value.fileUrl
      },
      formData.value.file
    )

    resetForm()
    showEditModal.value = false

    await advisorStore.fetchAnnouncements()
    announcements.value = advisorStore.announcements
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (announcement: Announcement) => {
  selectedAnnouncement.value = announcement
  showDeleteModal.value = true
}

const deleteAnnouncement = async () => {
  if (!selectedAnnouncement.value) return
  
  try {
    formLoading.value = true
    error.value = null
    
    await advisorStore.deleteAnnouncement(selectedAnnouncement.value.id)

    showDeleteModal.value = false

    announcements.value = advisorStore.announcements
  } catch (err: any) {
    error.value = err.message
  } finally {
    formLoading.value = false
  }
}

const removeFile = () => {
  formData.value.fileUrl = ''
}

const resetForm = () => {
  formData.value = {
    id: '',
    title: '',
    description: '',
    fileUrl: '',
    file: null,
    fileName: ''
  }
  selectedAnnouncement.value = null
}

const formatDate = (dateInput: Date | string) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const openUrl = (url: string) => {
  window.open(url, '_blank')
}
</script>
