import { createRouter, createWebHistory } from 'vue-router'
import mainPage from '@/views/mainPage/mainPage.vue'
import loginPage from '@/views/loginPage/loginPage.vue'
import listPage from '@/commponent/listPage.vue'
import songs from '@/views/songs/songs.vue'
import { useUserinfoStore } from '@/stores/counter'
import { ref } from 'vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/main',
      name: 'home',
      component: mainPage,
      children:[
        {
        path:'/list',
        name:'list',
        component:listPage,
      },
     
    ]
    },
    {
      path: '/login',
      name: 'login',
      component: loginPage
    }
  ]
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
