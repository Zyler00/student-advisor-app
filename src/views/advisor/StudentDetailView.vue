<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <button 
        @click="$router.back()" 
        class="flex items-center text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        กลับไปหน้ารายชื่อนักศึกษา
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">เกิดข้อผิดพลาด!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-else-if="student" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- ข้อมูลนักศึกษา -->
      <div class="md:col-span-1">
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex flex-col items-center">
            <img 
              :src="student.profileImage || 'https://via.placeholder.com/150'" 
              class="h-32 w-32 rounded-full object-cover mb-4" 
              alt="Profile"
            />
            <h2 class="text-xl font-semibold text-black ">{{ student.firstName }} {{ student.lastName }}</h2>
            <p class="text-black">{{ student.studentId || 'ไม่ระบุรหัสนักศึกษา' }}</p>
          </div>

          <div class="mt-6 space-y-4">
            <div class="flex flex-col">
              <span class="text-sm text-gray-500">ภาควิชา</span>
              <span class="font-medium text-black">{{ student.department || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-gray-500">อีเมล</span>
              <span class="font-medium text-black">{{ student.email || '-' }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-gray-500">เบอร์โทรศัพท์</span>
              <span class="font-medium text-black">{{ student.phone || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- การสนทนาและบันทึก -->
      <div class="md:col-span-2">
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4">การสนทนา</h3>
          
          <div v-if="loadingComments" class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          
          <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
            ยังไม่มีการสนทนา
          </div>
          
          <div v-else class="space-y-4 max-h-96 overflow-y-auto mb-4">
            <div 
              v-for="comment in comments" 
              :key="comment.id" 
              :class="[
                'p-3 rounded-lg', 
                comment.isAdvisorComment ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
              ]"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="font-medium">{{ comment.isAdvisorComment ? 'อาจารย์' : 'นักศึกษา' }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="text-black">{{ comment.content }}</p>
            </div>
          </div>

          <!-- ฟอร์มส่งข้อความ -->
          <div class="mt-4">
            <form @submit.prevent="submitComment">
              <div class="flex flex-col space-y-2">
                <textarea 
                  v-model="commentContent" 
                  class="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3" 
                  placeholder="พิมพ์ข้อความถึงนักศึกษา..."
                  required
                ></textarea>
                <button 
                  type="submit" 
                  class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  :disabled="formLoading"
                >
                  <span v-if="formLoading">กำลังส่ง...</span>
                  <span v-else>ส่งข้อความ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdvisorStore } from '../../stores/advisor'
import type { User, Comment } from '../../types'

const route = useRoute()
const advisorStore = useAdvisorStore()

const studentId = ref<string>(route.params.id as string)
const student = ref<User | null>(null)
const comments = ref<Comment[]>([])
const commentContent = ref('')
const loading = ref(true)
const loadingComments = ref(false)
const formLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    if (!studentId.value) {
      error.value = 'ไม่พบรหัสนักศึกษา'
      loading.value = false
      return
    }
    
    // ดึงข้อมูลนักศึกษา
    const studentData = await advisorStore.fetchStudentById(studentId.value)
    if (!studentData) {
      error.value = 'ไม่พบข้อมูลนักศึกษา'
      loading.value = false
      return
    }
    
    student.value = studentData
    
    // ดึงข้อมูลการสนทนา
    await fetchComments()
  } catch (err) {
    console.error('Error loading student details:', err)
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา'
  } finally {
    loading.value = false
  }
})

const fetchComments = async () => {
  try {
    loadingComments.value = true
    const commentsData = await advisorStore.fetchStudentComments(studentId.value)
    comments.value = commentsData || []
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
  
  if (!student.value || !student.value.id) {
    console.error('ไม่พบข้อมูลนักศึกษาหรือ ID ของนักศึกษา', student.value)
    alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลนักศึกษา')
    return
  }
  
  try {
    formLoading.value = true
    console.log('กำลังส่งข้อความ:', {
      studentId: student.value.id,
      content: commentContent.value,
      isAdvisorComment: true
    })
    
    await advisorStore.addStudentComment({
      studentId: student.value.id,
      content: commentContent.value,
      isAdvisorComment: true
    })
    
    // รีเซ็ตฟอร์มและโหลดคอมเมนต์ใหม่
    commentContent.value = ''
    await fetchComments()
  } catch (err) {
    console.error('Error submitting comment:', err)
    alert('เกิดข้อผิดพลาดในการส่งข้อความ: ' + (err instanceof Error ? err.message : String(err)))
  } finally {
    formLoading.value = false
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
</script>
