<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">404</h2>
        <p class="mt-2 text-center text-xl text-gray-600">ไม่พบหน้าที่คุณต้องการ</p>
        <p class="mt-2 text-center text-sm text-gray-500">
          ขออภัย หน้าที่คุณกำลังค้นหาไม่มีอยู่หรืออาจถูกย้ายไปแล้ว
        </p>
      </div>
      <div class="mt-8">
        <router-link
          to="/"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          กลับไปยังหน้าหลัก
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ไม่จำเป็นต้องมีโค้ดใดๆ ในส่วนนี้
</script>
