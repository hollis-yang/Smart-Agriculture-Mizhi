<template>
  <div>
    <div class="left-panel">
      <img src="@/assets/images/logo.png" alt="" class="bdny-icon" />
      <div class="left-menu">
        <div
          v-for="(item, index) in ['设备', '用户']"
          class="item-content"
          :key="index"
          :class="{ active: item === selectedItem }"
          @click="changeSelectedItem(item)">
          <div class="item-detail">
            <div class="item-icon">
              <el-icon size="large" color="white">
                <HomeFilled v-if="item === '首页'" />
                <Avatar v-if="item === '用户'" />
                <VideoCameraFilled v-if="item === '设备'" />
              </el-icon>
            </div>
            <div class="item-name">{{ item }}</div>
          </div>
        </div>
        <div class="setting-btn">
          <a href="/help/guide.pdf" target="_blank">
            <img
              src="/info-white.png"
              alt="前往管理平台"
              class="info"
          /></a>
          <img
            src="@/assets/images/display.png"
            alt="前往管理平台"
            class="go-display"
            @click="goDisplay" />
          <div class="logout">
            <el-popconfirm
              confirm-button-text="确定"
              cancel-button-text="取消"
              title="确定要退出登录吗？"
              width="200px"
              @confirm="logout">
              <template #reference>
                <el-avatar
                  shape="circle"
                  :size="40"
                  fill="fill"
                  src="./avatar.jpg"></el-avatar>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
    </div>
    <div class="right-panel">
      <div class="top-menu">米脂县高标准农田摄像头管理平台</div>
      <div class="bottom-menu">
        <CameraControl v-if="selectedItem === '设备'"></CameraControl>
        <User v-else-if="selectedItem === '用户'"></User>
        <HomePage v-else-if="selectedItem === '首页'"></HomePage>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VideoCameraFilled, Avatar, HomeFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'
import CameraControl from '@/views/Settings/components/CameraControl/index.vue'
import User from '@/views/Settings/components/User/index.vue'
import HomePage from '@/views/Settings/components/HomePage.vue'
import { useAdminStore } from '@/stores/admin'
import router from '@/router'
import { ElMessage } from 'element-plus'

const selectedItem = ref('设备')

function changeSelectedItem(item) {
  selectedItem.value = item
}

const adminStore = useAdminStore()
const isAdmin = ref(adminStore.isAdmin)
function goDisplay() {
  router.push('/video3d')
}
function logout() {
  adminStore.setIsAdmin(false)
  ElMessage.success('退出成功!')
  router.push('/')
}
</script>

<style lang="scss" scoped>
.left-panel {
  width: 70px;
  height: 100vh;
  background-color: rgb(27, 153, 97);
  position: relative;

  .bdny-icon {
    width: 80%;
    height: fit-content;
    margin-top: 20px;
    margin-left: 8px;
  }

  .left-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 20px;

    .item-content {
      width: 100%;
      height: 50px;
      padding: 20px 0 20px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      &:hover,
      &.active {
        background-color: rgb(15, 115, 73);
        cursor: pointer;
      }

      .item-detail {
        .item-icon {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
        }

        .item-name {
          font-size: 17px;
          color: white;
        }
      }
    }

    .setting-btn {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center; /* 中央对齐 */
      align-items: center;
      position: absolute; /* 绝对定位 */
      bottom: 20px; /* 距离底部 */

      .logout {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 20px;
      }

      .go-display {
        width: 40px;
        height: 40px;
        cursor: pointer;
      }

      .info {
        width: 40px;
        height: 40px;
        cursor: pointer;
        margin-bottom: 15px;
      }
    }
  }
}


.right-panel {
  position: fixed;
  left: 70px;
  top: 0px;
  width: calc(100% - 70px);
  height: 100vh;

  .top-menu {
    width: 100%;
    height: 64px;
    font-size: 24px;
    font-weight: 700;
    color: black;
    display: flex;
    align-items: center;
    padding-left: 20px;

    // 灰色underline
    border-bottom: 1px solid rgba(128, 128, 128, 0.5);
  }

  .bottom-menu {
    width: 100%;
    height: calc(100% - 65px);
  }
}
</style>
