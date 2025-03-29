<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">สนทนากับอาจารย์ที่ปรึกษา</h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">พูดคุยกับอาจารย์ที่ปรึกษาของคุณได้ที่นี่</p>
            </div>
            <div v-if="advisor">
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                อาจารย์ที่ปรึกษา: {{ advisor.firstName }} {{ advisor.lastName }}
              </span>
            </div>
          </div>
          
          <div class="border-t border-gray-200">
            <div class="px-4 py-5 sm:p-6">
              <div v-if="loading" class="flex justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
              
              <div v-else-if="!advisor" class="text-center py-10">
                <p class="text-gray-500">คุณยังไม่มีอาจารย์ที่ปรึกษา</p>
              </div>
              
              <div v-else>
                <div class="space-y-4 h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg mb-4" ref="chatContainer">
                  <div v-if="loadingComments" class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                  
                  <div v-else-if="comments.length === 0" class="text-center py-10">
                    <p class="text-gray-500">ยังไม่มีข้อความ</p>
                  </div>
                  
                  <div v-else>
                    <div 
                      v-for="comment in comments" 
                      :key="comment.id" 
                      :class="[
                        'p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg', 
                        comment.isAdvisorComment 
                          ? 'bg-gray-200 text-gray-800 ml-auto' 
                          : 'bg-blue-500 text-white mr-auto'
                      ]"
                    >
                      <p>{{ comment.content }}</p>
                      <p class="text-xs mt-1 opacity-70">{{ formatDate(comment.createdAt) }}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <form @submit.prevent="submitComment" class="flex">
                    <textarea 
                      v-model="commentContent" 
                      placeholder="พิมพ์ข้อความ..." 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                      :disabled="formLoading"
                    ></textarea>
                    <button 
                      type="submit" 
                      class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      :disabled="formLoading || !commentContent.trim()"
                    >
                      <span v-if="formLoading">กำลังส่ง...</span>
                      <span v-else>ส่งข้อความ</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useStudentStore } from '../../stores/student'
import type { User, Comment } from '../../types'

const studentStore = useStudentStore()

const advisor = ref<User | null>(null)
const comments = ref<Comment[]>([])
const commentContent = ref('')
const loading = ref(true)
const loadingComments = ref(true)
const formLoading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    loading.value = true

    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      throw new Error('ไม่พบข้อมูลผู้ใช้')
    }

    const user = JSON.parse(storedUser)

    if (user.advisorId) {
      advisor.value = await studentStore.fetchAdvisorById(user.advisorId)
      await fetchComments()
    }
  } catch (err) {
    console.error('Error loading advisor details:', err)
  } finally {
    loading.value = false
  }
})

const fetchComments = async () => {
  try {
    loadingComments.value = true

    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      throw new Error('ไม่พบข้อมูลผู้ใช้')
    }

    const user = JSON.parse(storedUser)
    
    const commentsData = await studentStore.fetchStudentComments(user.id)
    comments.value = commentsData || []

    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Error fetching comments:', err)
  } finally {
    loadingComments.value = false
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    alert('กรุณากรอกข้อความก่อนส่ง')
    return
  }
  
  if (!advisor.value || !advisor.value.id) {
    console.error('ไม่พบข้อมูลอาจารย์ที่ปรึกษาหรือ ID ของอาจารย์', advisor.value)
    alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลอาจารย์ที่ปรึกษา')
    return
  }
  
  try {
    formLoading.value = true

    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      throw new Error('ไม่พบข้อมูลผู้ใช้')
    }
    
    const user = JSON.parse(storedUser)
    
    await studentStore.addStudentComment({
      studentId: user.id,
      advisorId: advisor.value.id,
      content: commentContent.value,
      isAdvisorComment: false
    })

    commentContent.value = ''
    await fetchComments()
  } catch (err) {
    console.error('Error submitting comment:', err)
    alert('เกิดข้อผิดพลาดในการส่งข้อความ: ' + (err instanceof Error ? err.message : String(err)))
  } finally {
    formLoading.value = false
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatDate = (date: Date | string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(comments, () => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>
