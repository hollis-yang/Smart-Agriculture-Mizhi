<template>
  <div class="container">
    <div class="left">
      <div class="title">米 脂 县 农 业 视 频 监 控 管 理 平 台</div>
      <img src="@/assets/images/login-bg.svg" alt="" class="bg" />
      <img src="@/assets/images/logo-login.png" alt="" class="logo" />
    </div>
    <div class="right">
      <div class="inner">
        <div class="title">
          <span v-if="!isRegister">系统登录</span><span v-else>系统注册</span>
        </div>
        <div class="subtitle">用户名</div>
        <el-input
          v-model="username"
          style="width: 50%"
          size="large"
          placeholder="请输入用户名" />
        <div class="subtitle">密码</div>
        <el-input
          v-model="password"
          style="width: 50%"
          size="large"
          type="password"
          placeholder="请输入密码"
          show-password />
        <div class="subtitle" v-if="isRegister">再次输入密码</div>
        <el-input
          v-model="passwordAgain"
          style="width: 50%"
          size="large"
          type="password"
          placeholder="请再次输入密码"
          v-if="isRegister"
          show-password />
        <el-button
          type="primary"
          color="rgb(27, 153, 97)"
          style="width: 50%"
          size="large"
          class="login-button"
          @click="login"
          v-if="!isRegister"
          >登录</el-button
        >
        <el-button
          type="primary"
          color="rgb(27, 153, 97)"
          style="width: 50%"
          size="large"
          class="login-button"
          @click="register"
          v-else
          >注册</el-button
        >

        <div class="help">
          <div class="change subtitle" v-if="!isRegister" @click="changePage">
            没有账号？前往注册
          </div>
          <div class="change subtitle" v-else @click="changePage">
            已有账号？前往登录
          </div>
          <div class="help-right">
            <img src="/info.png" alt="" />
            <a href="/help/guide.pdf" target="_blank">使用指南</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useAdminStore } from '@/stores/admin'

const username = ref('')
const password = ref('')
const passwordAgain = ref('')
const isAdmin = ref(null)
const adminStore = useAdminStore()
const isRegister = ref(false)

async function login() {
  // 先校验是否为空
  if (!username.value || !password.value) {
    ElMessage.error('用户名或密码不能为空!')
    return
  }
  try {
    const res = await axios.post('http://47.117.71.69:8989/login', {
      username: username.value,
      password: password.value
    })
    if (res.status === 200) {
      if (res.message === 'User not found') {
        ElMessage.error('用户不存在!')
        return
      } else if (res.message === 'Incorrect password') {
        ElMessage.error('密码错误!')
        return
      } else {
        ElMessage.success('登录成功!')

        // 确认是否为管理员
        if (res.data.isAdmin === 1) {
          isAdmin.value = true
        } else {
          isAdmin.value = false
        }
        adminStore.setIsAdmin(isAdmin.value)
        // 确定已登录
        adminStore.setIsLogin(true)
        // 保存用户名
        adminStore.setUserName(username.value)

        // 登录成功后跳转到首页
        router.push('/video3d')
        return
      }
    } else {
      ElMessage.error('登录失败!')
    }
  } catch (error) {
    console.log(error)
  }
}


async function register() {
  // 先校验是否为空
  if (!username.value || !password.value || !passwordAgain.value) {
    ElMessage.error('用户名或密码不能为空!')
    return
  }
  // 校验两次密码是否一致
  if (password.value !== passwordAgain.value) {
    ElMessage.error('两次密码不一致!')
    password.value = ''
    passwordAgain.value = ''
    return
  }
  // 发送请求
  const res = await axios.post('http://47.117.71.69:8989/addUser', {
    username: username.value,
    password: password.value,
    isAdmin: 0
  })
  if (res.data.status === 'fail') {
    if (res.data.error === 'Username already exists') {
      ElMessage.error('用户名已存在!')
      return
    }
  } else if (res.data.status === 'success') {
    ElMessage.success('注册成功!')
    // 注册成功后跳转到登录页
    isRegister.value = false
  } else {
    ElMessage.error('注册失败!')
  }
}


function changePage() {
  isRegister.value = !isRegister.value
  username.value = ''
  password.value = ''
  passwordAgain.value = ''
}
</script>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;

  .left {
    width: 58%;
    height: 100%;
    background-color: #109b5e;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .title {
      font-size: 50px;
      color: #fff;
      text-align: center;
      margin-bottom: 60px;
    }

    .bg {
      width: 70%;
      height: auto;
    }

    .logo {
      position: absolute;
      top: 30px;
      left: 50px;
      width: 200px;
      height: auto;
    }
  }

  .right {
    width: 42%;
    height: 100%;
    background-color: #fff;

    .inner {
      width: 100%;
      height: calc(100% - 80px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 80px;

      .title {
        font-size: 30px;
        font-weight: 700;
        color: #333;
        padding-bottom: 60px;
        // border-bottom: #333 solid 1px;
        width: 50%;
        display: flex;
        justify-content: center;
      }

      .help {
        font-size: 17px;
        margin-top: 10px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 50%;
        margin-top: 25px;

        .help-right {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;

          a {
            text-decoration: none;
            color: inherit;
          }

          img {
            width: 18px;
            height: 18px;
            margin-right: 5px;
          }
        }
      }

      .subtitle {
        font-size: 20px;
        color: #333;
        margin-bottom: 20px;
        align-self: flex-start;
        padding-left: 25%;
      }

      .change {
        font-size: 17px !important;
        cursor: pointer;
        padding-left: 0 !important;
        margin-bottom: 0 !important;
      }

      .el-input {
        margin-bottom: 20px;
      }

      .login-button {
        margin-top: 20px;
      }
    }
  }
}
</style>
