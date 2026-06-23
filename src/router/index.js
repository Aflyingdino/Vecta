import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/stores/authStore'

/* ── Lazy-loaded page components ── */
const HomePage       = () => import('@/pages/HomePage.vue')
const AboutPage      = () => import('@/pages/AboutPage.vue')
const ContactPage    = () => import('@/pages/ContactPage.vue')
const LoginPage      = () => import('@/pages/LoginPage.vue')
const RegisterPage   = () => import('@/pages/RegisterPage.vue')
const InvitePage     = () => import('@/pages/InvitePage.vue')
const ProjectsPage   = () => import('@/pages/ProjectsPage.vue')
const BoardPage      = () => import('@/pages/BoardPage.vue')
const DashboardPage  = () => import('@/pages/DashboardPage.vue')
const ActivityPage   = () => import('@/pages/ActivityPage.vue')
const CalendarPage   = () => import('@/pages/CalendarPage.vue')
const AccountPage    = () => import('@/pages/AccountPage.vue')
const ProjectDashboardPage = () => import('@/pages/ProjectDashboardPage.vue')

const routes = [
  /* ── Public ── */
  { path: '/',         redirect: '/home' },
  { path: '/home',     name: 'home',     component: HomePage },
  { path: '/about',    name: 'about',    component: AboutPage },
  { path: '/contact',  name: 'contact',  component: ContactPage },
  { path: '/login',    name: 'login',    component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  { path: '/invite/:token', name: 'invite', component: InvitePage, meta: { requiresAuth: true } },
  /* ── Authenticated (wrapped in AppLayout) ── */
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    name: 'board',
    component: BoardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id/dashboard',
    name: 'project-dashboard',
    component: ProjectDashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/activity',
    name: 'activity',
    component: ActivityPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/account',
    name: 'account',
    component: AccountPage,
    meta: { requiresAuth: true },
  },

  /* ── Fallback ── */
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

/* ── Navigation guard ── */
router.beforeEach((to, from) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !isLoggedIn.value) {
    // Redirect to login with return URL
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
