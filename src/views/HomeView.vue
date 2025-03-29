<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">ระบบอาจารย์ที่ปรึกษาและนักศึกษา</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="text-center">
              <h2 class="text-2xl font-semibold mb-4">ยินดีต้อนรับสู่ระบบอาจารย์ที่ปรึกษาและนักศึกษา</h2>
              <p class="mb-6 text-gray-600">ระบบนี้ช่วยให้อาจารย์และนักศึกษาสามารถติดต่อสื่อสาร นัดหมาย และแลกเปลี่ยนข้อมูลได้อย่างสะดวก</p>
              
              <div class="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <router-link 
                  to="/login" 
                  class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  เข้าสู่ระบบ
                </router-link>
                <router-link 
                  to="/register" 
                  class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  ลงทะเบียน (สำหรับนักศึกษา)
                </router-link>
              </div>
            </div>
            
            <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-200 rounded-lg p-4 text-center">
                <div class="text-blue-600 text-4xl mb-2">
                  <i class="fas fa-user-tie"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">สำหรับผู้ดูแลระบบ</h3>
                <p class="text-gray-600 text-sm">จัดการข้อมูลอาจารย์ นักศึกษา และดูรายงานสรุป</p>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4 text-center">
                <div class="text-green-600 text-4xl mb-2">
                  <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">สำหรับอาจารย์</h3>
                <p class="text-gray-600 text-sm">ดูรายชื่อนักศึกษา สร้างประกาศ และจัดการการนัดหมาย</p>
              </div>
              
              <div class="border border-gray-200 rounded-lg p-4 text-center">
                <div class="text-purple-600 text-4xl mb-2">
                  <i class="fas fa-user-graduate"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">สำหรับนักศึกษา</h3>
                <p class="text-gray-600 text-sm">ดูประกาศ สร้างการนัดหมาย และติดต่ออาจารย์ที่ปรึกษา</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="bg-white shadow mt-8 py-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          &copy; {{ new Date().getFullYear() }} ระบบอาจารย์ที่ปรึกษาและนักศึกษา
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>
