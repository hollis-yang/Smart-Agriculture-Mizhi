<template>
  <div class="container">
    <h2>毕业设计Cesium demo</h2>
    <h3 @click="goToRoute('/video-shadowmap')">1. 单路视频流播放</h3>
    <h3 @click="goToRoute('/video3d')">2. 多路视频流播放</h3>
    <h3 @click="goToRoute('/login')">3. 登录页面test</h3>
    <h3 @click="goToRoute('/settings')">4. 后端管理系统test</h3>


    <!-- 以下暂不需要 -->
    <!-- <h3 @click="goToRoute('/video-clamp')">1-1. 播放视频并贴地</h3> -->
    <!-- <h3 @click="goToRoute('/viewshed')">2-1. viewshed</h3>
    <h3 @click="goToRoute('/viewshed-shadowmap')">2-2. 基于ShadowMap的viewshed实现</h3>
    <h3 @click="goToRoute('/frustum')">3. 视锥体</h3> -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToRoute(route) {
  router.push(route)
}
</script>

<style scoped lang="scss">
.container {
  max-width: fit-content;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10%;
  font-size: 20px;
  font-weight: 700;
}

h3 {
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: 500;
  text-decoration: underline;

  &:hover {
    color: blue;
    cursor: pointer;
  }
}
</style>
