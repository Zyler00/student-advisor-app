import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'advisors',
          name: 'manage-advisors',
          component: () => import('../views/admin/ManageAdvisorsView.vue')
        },
        {
          path: 'students',
          name: 'admin-manage-students',
          component: () => import('../views/admin/ManageStudentsView.vue')
        },
        {
          path: 'summary',
          name: 'admin-summary',
          component: () => import('../views/admin/SummaryView.vue')
        }
      ]
    },
    // Advisor routes
    {
      path: '/advisor',
      name: 'advisor',
      component: () => import('../views/advisor/AdvisorDashboard.vue'),
      meta: { requiresAuth: true, role: 'advisor' },
      children: [
        {
          path: 'students',
          name: 'advisor-students',
          component: () => import('../views/advisor/StudentsListView.vue')
        },
        {
          path: 'manage-students',
          name: 'advisor-manage-students',
          component: () => import('../views/advisor/ManageStudentsView.vue')
        },
        {
          path: 'student/:id',
          name: 'student-detail',
          component: () => import('../views/advisor/StudentDetailView.vue'),
          props: true
        },
        {
          path: 'announcements',
          name: 'announcements',
          component: () => import('../views/advisor/AnnouncementsView.vue')
        },
        {
          path: 'appointments',
          name: 'advisor-appointments',
          component: () => import('../views/advisor/AppointmentsView.vue')
        }
      ]
    },
    // Student routes
    {
      path: '/student',
      name: 'student',
      component: () => import('../views/student/StudentDashboard.vue'),
      meta: { requiresAuth: true, role: 'student' },
      children: [
        {
          path: 'profile',
          name: 'student-profile',
          component: () => import('../views/student/ProfileView.vue')
        },
        {
          path: 'announcements',
          name: 'student-announcements',
          component: () => import('../views/student/AnnouncementsView.vue')
        },
        {
          path: 'appointments',
          name: 'student-appointments',
          component: () => import('../views/student/AppointmentsView.vue')
        },
        {
          path: 'chat',
          name: 'student-chat',
          component: () => import('../views/student/StudentChatView.vue')
        }
      ]
    },
    // Error routes
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

// ตรวจสอบการยืนยันตัวตนและสิทธิ์การเข้าถึง
router.beforeEach((to, from, next) => {
  // ตรวจสอบว่ามีผู้ใช้ที่ล็อกอินอยู่หรือไม่
  const isAuthenticated = localStorage.getItem('user') !== null
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  const userRole = user?.role

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.role && to.meta.role !== userRole) {
    next({ name: 'not-found' })
  } else {
    next()
  }
})

export default router
