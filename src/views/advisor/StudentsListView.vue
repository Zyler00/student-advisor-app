<template>
  <div>
    <div class="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
      <h3 class="text-lg leading-6 font-medium text-gray-900">รายชื่อนักศึกษาในที่ปรึกษา</h3>
      <div class="mt-3 sm:mt-0 sm:ml-4">
        <div class="flex rounded-md shadow-sm">
          <input
            type="text"
            v-model="searchQuery"
            class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
            placeholder="ค้นหานักศึกษา..."
          />
        </div>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัสนักศึกษา
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ-นามสกุล
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สาขาวิชา
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เบอร์โทรศัพท์
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">แก้ไข</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
                  </td>
                </tr>
                <tr v-else-if="filteredStudents.length === 0">
                  <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="text-sm text-gray-500">ไม่พบข้อมูลนักศึกษา</div>
                  </td>
                </tr>
                <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ student.studentId }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img v-if="student.profileImage" class="h-10 w-10 rounded-full object-cover" :src="student.profileImage" alt="" />
                        <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-gray-500 text-sm">{{ getInitials(student) }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ student.title ? student.title + ' ' : '' }}{{ student.firstName }} {{ student.lastName }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ student.department }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ student.email || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ student.phone || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <router-link 
                      :to="{ name: 'student-detail', params: { id: student.id } }"
                      class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                      ดูข้อมูล
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdvisorStore } from '../../stores/advisor'
import type { User } from '../../types'

const advisorStore = useAdvisorStore()

const loading = ref(true)
const searchQuery = ref('')

// ดึงข้อมูลนักศึกษาเมื่อโหลดหน้า
onMounted(async () => {
  try {
    await advisorStore.fetchAdvisorStudents()
    console.log('advisorStudents:', advisorStore.advisorStudents)
  } catch (error) {
    console.error('Failed to fetch students:', error)
  } finally {
    loading.value = false
  }
})

// กรองนักศึกษาตามคำค้นหา
const filteredStudents = computed(() => {
  if (!searchQuery.value) return advisorStore.advisorStudents
  
  const query = searchQuery.value.toLowerCase()
  return advisorStore.advisorStudents.filter(student => 
    student.firstName.toLowerCase().includes(query) ||
    student.lastName.toLowerCase().includes(query) ||
    (student.studentId && student.studentId.toLowerCase().includes(query)) ||
    (student.email && student.email.toLowerCase().includes(query))
  )
})

// สร้างตัวย่อชื่อสำหรับแสดงในกรณีที่ไม่มีรูปภาพ
const getInitials = (user: User) => {
  return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase()
}
</script>
