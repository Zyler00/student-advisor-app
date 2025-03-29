<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-black">ประกาศจากอาจารย์ที่ปรึกษา</h3>
      <p class="mt-1 max-w-2xl text-sm text-black">ประกาศและข่าวสารสำคัญจากอาจารย์ที่ปรึกษาของคุณ</p>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
      
      <div v-else-if="announcements.length === 0" class="text-center py-8 text-black">
        ยังไม่มีประกาศ
      </div>
      
      <div v-else class="flow-root px-4 py-5">
        <ul role="list" class="-my-5 divide-y divide-gray-200">
          <li v-for="announcement in announcements" :key="announcement.id" class="py-5">
            <div class="relative focus-within:ring-2 focus-within:ring-gray-400">
              <h3 class="text-sm font-semibold text-black">
                <button @click="viewAnnouncementDetails(announcement)" class="hover:underline focus:outline-none text-white">
                  {{ announcement.title }}
                </button>
              </h3>
              <p class="mt-1 text-sm text-black line-clamp-2">{{ announcement.description }}</p>
              <div class="mt-2 flex items-center space-x-4">
                <div class="flex items-center text-sm text-black">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ formatDate(announcement.createdAt) }}</span>
                </div>
                
                <div v-if="announcement.fileUrl" class="flex items-center text-sm text-blue-400 cursor-pointer" @click="openUrl(announcement.fileUrl)">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                  </svg>
                  <span>ไฟล์แนบ</span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="showDetailsModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showDetailsModal = false"></div>
        
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-black" id="modal-title">
                  {{ selectedAnnouncement?.title }}
                </h3>
                <div class="mt-2 flex items-center text-sm text-black">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ formatDate(selectedAnnouncement?.createdAt) }}</span>
                </div>
                <div class="mt-4">
                  <p class="text-sm text-black whitespace-pre-line">{{ selectedAnnouncement?.description }}</p>
                </div>
                
                <div v-if="selectedAnnouncement?.fileUrl" class="mt-6">
                  <div class="flex items-center">
                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-blue-400">ไฟล์แนบ: {{ selectedAnnouncement?.fileName || 'ไฟล์' }}</span>
                  </div>
                  <button 
                    @click="openUrl(selectedAnnouncement?.fileUrl || '')" 
                    class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    ดาวน์โหลดไฟล์
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-100 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="showDetailsModal = false"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:ml-3 sm:w-auto sm:text-sm"
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
import { ref, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { Announcement } from '../../types'

const advisorStore = useAdvisorStore()

const announcements = ref<Announcement[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showDetailsModal = ref(false)
const selectedAnnouncement = ref<Announcement | null>(null)

onMounted(async () => {
  await fetchAnnouncements()
})

const fetchAnnouncements = async () => {
  try {
    loading.value = true
    const data = await advisorStore.fetchStudentAnnouncements()
    announcements.value = data
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const viewAnnouncementDetails = (announcement: Announcement) => {
  selectedAnnouncement.value = announcement
  showDetailsModal.value = true
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
