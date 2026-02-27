import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/video3d',
      component: () => import('@/views/VideoMulti.vue')
    },
    {
      path: '/settings',
      component: () => import('@/views/Settings/index.vue')
    },



    // 以下暂时不需要了
    // {
    //   path: '/video-clamp',
    //   component: () => import('@/views/VideoClamp.vue')
    // },
    // {
    //   path: '/viewshed',
    //   component: () => import('@/views/Viewshed.vue')
    // },
    // {
    //   path: '/viewshed-shadowmap',
    //   component: () => import('@/views/ViewShedShadowMap.vue')
    // },
    {
      path: '/video-shadowmap',
      component: () => import('@/views/VideoShadowMap.vue')
    },
  ]
})

export default router