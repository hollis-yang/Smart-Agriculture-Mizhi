<template>
  <div class="container">
    <div class="inner">
      <div class="echarts">
        <div class="left">
          <div class="topic">| 负责人</div>
          <div class="bottom">
            <el-avatar
              shape="circle"
              :size="80"
              class="avatar"
              fill="fill"
              src="./avatar.jpg"></el-avatar>
            <div class="basic-info">
              <div class="title">米脂县高标准农田</div>
              <div class="contact-info">
                <div class="name">负责人：葛艳芬</div>
                <div class="tel">电话：15198971229</div>
              </div>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="left">
            <div class="topic">| 用户数量</div>
            <div class="total-num">
              <div class="num">{{ userList.length || 0 }}</div>
              <div class="name">用户总数(个)</div>
            </div>
            <div class="right">
              <div class="admin-num">
                <div class="num">
                  {{ userList.filter(item => item.isAdmin === 1).length || 0 }}
                </div>
                <div class="name">管理员(个)</div>
              </div>
              <div class="user-num">
                <div class="num">
                  {{ userList.filter(item => item.isAdmin === 0).length || 0 }}
                </div>
                <div class="name">普通用户(个)</div>
              </div>
            </div>
            <v-chart class="pie-chart" :option="pieChartOption"> </v-chart>
          </div>
        </div>
        <div class="blank"></div>
      </div>
      <div class="search">
        <div class="left">
          <div class="left-item">
            <span>用户名</span>
            <el-input
              v-model="usernameInput"
              placeholder="请输入用户名"
              style="width: 230px;">
            </el-input>
          </div>
          <div class="left-item">
            <span>用户权限</span>
            <el-select
              v-model="adminSelected"
              placeholder="请选择用户权限"
              style="width: 200px;">
              <el-option
                v-for="item in [
                  { value: 1, label: '管理员' },
                  { value: 0, label: '普通用户' }
                ]"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="left-item">
            <el-button
              type="primary"
              plain
              color="rgb(27, 153, 97)"
              @click="resetBtnClick"
              >重置</el-button
            >
            <el-button
              type="primary"
              plain
              color="rgb(27, 153, 97)"
              @click="filterBtnClick"
              >查询</el-button
            >
          </div>
        </div>
        <div class="right">
          <el-button
            type="primary"
            color="rgb(27, 153, 97)"
            :icon="Plus"
            @click="addNewUser"
            >添加</el-button
          >
        </div>
      </div>
      <div class="table">
        <!-- el-table展示所有用户 -->
        <el-table
          :data="userListShow"
          style="width: 100%; font-size: 17px;"
          :default-sort="{ prop: 'registerTime', order: 'descending' }"
          stripe
          border>
          <el-table-column
            class-name="column"
            prop="username"
            label="用户名"
            min-width="15%">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <el-icon><User /></el-icon>
                <span style="margin-left: 10px">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="userid"
            label="用户ID"
            min-width="30%"
            class-name="column">
          </el-table-column>
          <el-table-column
            prop="registerTime"
            label="注册时间"
            min-width="17.5%"
            sortable
            class-name="column">
            <template #default="{ row }">
              <div style="display: flex; align-items: center;">
                <el-icon><Timer /></el-icon>
                <span style="margin-left: 10px">{{ row.registerTime }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="isAdmin"
            label="用户权限"
            min-width="17.5%"
            class-name="column">
            <template #default="{ row }">
              <el-tag :type="row.isAdmin === 1 ? 'success' : 'warning'">
                {{ row.isAdmin === 1 ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="username"
            label="操作"
            min-width="20%"
            class-name="column">
            <template #default="{ row }">
              <el-button
                @click="editCurrentUser(row.username, row.isAdmin, row.userid)"
                plain
                size="small"
                type="primary"
                >编辑</el-button
              >
              <el-button
                @click="deleteUser(row.username)"
                plain
                size="small"
                type="danger"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 添加新用户 -->
    <transition name="add-user">
      <div v-show="userAddShow" class="user-add">
        <div class="left" @click="closeAddUser"></div>
        <div class="right">
          <div class="user-inner">
            <div class="title">添加用户</div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>用户名
              </div>
              <div class="right">
                <el-input
                  v-model="userAddData.name"
                  placeholder="请输入用户名" />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>用户权限
              </div>
              <div class="right">
                <el-radio-group v-model="userAddData.isAdmin">
                  <el-radio :label="true">管理员</el-radio>
                  <el-radio :label="false">普通用户</el-radio>
                </el-radio-group>
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>密码
              </div>
              <div class="right">
                <el-input
                  v-model="userAddData.password"
                  placeholder="请输入密码"
                  show-password />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>确认密码
              </div>
              <div class="right">
                <el-input
                  v-model="userAddData.passwordAgain"
                  placeholder="请再次输入密码"
                  show-password />
              </div>
            </div>
            <div class="btns">
              <el-button
                type="primary"
                color="rgb(27, 153, 97)"
                plain
                @click="closeAddUser"
                >取消</el-button
              >
              <el-button
                type="primary"
                color="rgb(27, 153, 97)"
                @click="createNewUser"
                >确定</el-button
              >
            </div>
          </div>
        </div>
        <div class="close-cross">
          <el-icon :size="25" class="close-btn" @click="closeAddUser"
            ><Close
          /></el-icon>
        </div>
      </div>
    </transition>

    <!-- 编辑用户 -->
    <transition name="edit-user">
      <div v-show="userEditShow" class="user-edit">
        <div class="left" @click="closeEditUser"></div>
        <div class="right">
          <div class="user-inner">
            <div class="title">用户编辑</div>
            <div class="item">
              <div class="left">用户名</div>
              <div class="right">
                <el-input
                  v-model="userEditData.username"
                  placeholder="请输入用户名" />
              </div>
            </div>
            <div class="item">
              <div class="left">用户权限</div>
              <div class="right">
                <el-radio-group v-model="userEditData.isAdmin">
                  <el-radio :label="true">管理员</el-radio>
                  <el-radio :label="false">普通用户</el-radio>
                </el-radio-group>
              </div>
            </div>
            <div class="item">
              <div class="left">旧密码</div>
              <div class="right">
                <el-input
                  v-model="userEditData.passwordOld"
                  placeholder="请输入旧密码"
                  show-password />
              </div>
            </div>
            <div class="item">
              <div class="left">新密码</div>
              <div class="right">
                <el-input
                  v-model="userEditData.passwordNew"
                  placeholder="请输入新密码"
                  show-password />
              </div>
            </div>
            <div class="item">
              <div class="left">确认新密码</div>
              <div class="right">
                <el-input
                  v-model="userEditData.passwordAgain"
                  placeholder="请再次输入新密码"
                  show-password />
              </div>
            </div>
            <div class="btns">
              <el-button
                type="primary"
                color="rgb(27, 153, 97)"
                plain
                @click="closeEditUser"
                >取消</el-button
              >
              <el-button
                type="primary"
                color="rgb(27, 153, 97)"
                @click="confirmEditUser"
                >确定</el-button
              >
            </div>
          </div>
        </div>
        <div class="close-cross">
          <el-icon :size="25" class="close-btn" @click="closeAddUser"
            ><Close
          /></el-icon>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { Plus, Close, Timer } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'


const userList = ref([])  // 用户列表
const userListShow = ref([])  // 展示的用户列表


use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer])
const pieChartOption = ref({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      name: '用户',
      type: 'pie',
      radius: ['60%', '70%'],
      avoidLabelOverlap: false,
      padAngle: 5,
      itemStyle: {
        borderRadius: 10
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [] // 初始化为空数组
    }
  ]
})

// 添加watch监听userList变化
watch(userList, (newVal) => {
  pieChartOption.value.series[0].data = [
    { 
      value: newVal.filter(item => item.isAdmin === 1).length,
      name: '管理员',
      itemStyle: { color: '#1E90FF' }
    },
    { 
      value: newVal.filter(item => item.isAdmin === 0).length,
      name: '普通用户',
      itemStyle: { color: '#8A2BE2' }
    }
  ]
}, { immediate: true })



const usernameInput = ref('')
const adminSelected = ref(null)

/**
 * 添加用户相关
 */
const userAddShow = ref(false)  // 是否展示添加页面
function addNewUser() {
  userAddShow.value = !userAddShow.value
}
function closeAddUser() {
  userAddShow.value = false
  // 清空数据
  userAddData.value = {
    name: '',
    password: '',
    passwordAgain: '',
    isAdmin: ''
  }
}
const userAddData = ref({
  name: '',
  password: '',
  passwordAgain: '',
  isAdmin: ''
})


/**
 * 编辑用户相关
 */
const userEditShow = ref(false)  // 是否展示添加页面
const userEditData = ref({
  userid: '',
  username: '',
  isAdmin: '',
  passwordOld: '',
  passwordNew: '',
  passwordAgain: '',
})
function editUser() {
  userEditShow.value = !userEditShow.value
}
function closeEditUser() {
  userEditShow.value = false
  // 清空数据
  userEditData.value = {
    userid: '',
    username: '',
    isAdmin: '',
    passwordOld: '',
    passwordNew: '',
    passwordAgain: '',
  }
}
/**
 * 确认编辑用户提交给后端
 */
async function confirmEditUser() {
  console.log(userEditData.value)
  // 1.判断两次密码是否相等
  if (userEditData.value.passwordNew !== userEditData.value.passwordAgain) {
    ElMessage.error('两次密码不一致!')
    // 清空密码
    userEditData.value.passwordNew = ''
    userEditData.value.passwordAgain = ''
    return
  }
  // 2.新旧密码不得相同
  if (userEditData.value.passwordOld === userEditData.value.passwordNew &&
      userEditData.value.passwordOld !== '') {
    ElMessage.error('新旧密码不得相同!')
    // 清空密码
    userEditData.value.passwordOld = ''
    userEditData.value.passwordNew = ''
    userEditData.value.passwordAgain = ''
    return
  }
  // 3.username和isAdmin不能与之前一致 && 三个密码框都为空
  // 先找到userid对应的原数据
  const oldData = userList.value.find(item => item.userid === userEditData.value.userid)
  if (oldData.username === userEditData.value.username &&
      oldData.isAdmin === (userEditData.value.isAdmin ? 1 : 0) &&
      userEditData.value.passwordOld === '' &&
      userEditData.value.passwordNew === '' &&
      userEditData.value.passwordAgain === '') {
    ElMessage.error('未做任何修改!')
    return
  }
  // 4.三个密码框必须同时填/不填
  // 获取三个密码框的长度
  const passwordLength = [userEditData.value.passwordOld, userEditData.value.passwordNew, userEditData.value.passwordAgain].filter(item => item !== '').length
  if (passwordLength !== 3 && passwordLength !== 0) {
    ElMessage.error('请补充密码框!')
    return
  }

  // 5.发送请求
  // 构造提交的数据
  const data = {
    userid: userEditData.value.userid,
    username: userEditData.value.username,
    isAdmin: userEditData.value.isAdmin ? 1 : 0,
    passwordOld: userEditData.value.passwordOld,
    passwordNew: userEditData.value.passwordNew,
  }
  // const res = await axios.post('http://127.0.0.1:5000/updateUser', data)
  const res = await axios.post('http://47.117.71.69:8989/updateUser', data)
  // 5-1 原密码错误，所有更新失败
  // 5-2 用户名已存在，更新失败
  // 5-3 更新成功（只有用户名+权限 / 只有密码 / 都有）
  if (res.data.status === 'fail') {
    if (res.data.error === 'Incorrect old password') {
      ElMessage.error('原密码错误!')
    } else if (res.data.error === 'Username already exists') {
      ElMessage.error('用户名已存在!')
    }
  } else if (res.data.status === 'success') {
    ElMessage.success('更新成功!')
    closeEditUser()

    // 6.更新成功的话，重新拉起用户列表
    // 刷新用户列表
    // const newUserList = await axios.get('http://127.0.0.1:5000/getUser')
    const newUserList = await axios.get('http://47.117.71.69:8989/getUser')
    userList.value = newUserList.data
    userListShow.value = JSON.parse(JSON.stringify(userList.value))

    // 如果userList和userListShow不相等，则显示所有
    if (userList.value.length !== userListShow.value.length) {
      userListShow.value = JSON.parse(JSON.stringify(userList.value))
    }
    // 清空筛选条件
    usernameInput.value = ''
    adminSelected.value = null

    console.log(userList.value)
  }
}


/**
 * 添加新用户
 */
async function createNewUser() {
  console.log(userAddData.value)
  // 先判断两次密码是否相等
  if (userAddData.value.password !== userAddData.value.passwordAgain) {
    ElMessage.error('两次密码不一致!')
    // 清空密码
    userAddData.value.password = ''
    userAddData.value.passwordAgain = ''
    return
  }
  // 判断是否填写了用户名, 密码, 用户权限
  if (userAddData.value.name === '' || userAddData.value.password === '' || userAddData.value.isAdmin === '') {
    ElMessage.error('请填写完整信息!')
    return
  }

  // 发送请求
  const res = await axios.post('http://47.117.71.69:8989/addUser', {
    username: userAddData.value.name,
    password: userAddData.value.password,
    isAdmin: userAddData.value.isAdmin ? 1 : 0
  })
  if (res.data.status === 'fail') {
    if (res.data.error === 'Username already exists') {
      ElMessage.error('用户名已存在!')
    }
  } else if (res.data.status === 'success') {
    ElMessage.success('添加成功!')
    closeAddUser()

    // 刷新用户列表
    const newUserList = await axios.get('http://47.117.71.69:8989/getUser')
    userList.value = newUserList.data
    userListShow.value = JSON.parse(JSON.stringify(userList.value))

    // 如果userList和userListShow不相等，则显示所有
    if (userList.value.length !== userListShow.value.length) {
      userListShow.value = JSON.parse(JSON.stringify(userList.value))
    }
    // 清空筛选条件
    usernameInput.value = ''
    adminSelected.value = null

    console.log(userList.value)
  }
}


/**
 * 重置按钮和查询按钮
 */
function resetBtnClick() {
  usernameInput.value = ''
  adminSelected.value = null
}
function filterBtnClick() {
  // 1. 从userList中筛选用户权限 -> userListShow
  userListShow.value = userList.value.filter(item => {
    if (adminSelected.value === null) {
      return true
    } else {
      return item.isAdmin === adminSelected.value
    }
  })
  // 2. 从userListShow中筛选用户名.startsWith -> userListShow
  userListShow.value = userListShow.value.filter(item => {
    if (usernameInput.value === '') {
      return true
    } else {
      return item.username.startsWith(usernameInput.value)
    }
  })
}


/**
 * 编辑与删除用户
 */
function editCurrentUser(username, isAdmin, userid) {
  userEditData.value.username = username
  userEditData.value.isAdmin = isAdmin === 1 ? true : false
  userEditData.value.userid = userid
  editUser()
}
function deleteUser(username) {
  ElMessageBox.confirm('确定删除该用户?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await axios.post('http://47.117.71.69:8989/deleteUser', {
    username })

    if (res.data.status === 'success') {
      ElMessage.success('删除成功!')
      // 刷新用户列表
      const res = await axios.get('http://47.117.71.69:8989/getUser')
      userList.value = res.data
      userListShow.value = JSON.parse(JSON.stringify(userList.value))

      // 如果userList和userListShow不相等，则显示所有
      if (userList.value.length !== userListShow.value.length) {
        userListShow.value = JSON.parse(JSON.stringify(userList.value))
      }
      // 清空筛选条件
      usernameInput.value = ''
      adminSelected.value = null

      console.log(userList.value)
    }
  })
}



onMounted(async () => {
  const res = await axios.get('http://47.117.71.69:8989/getUser')
  userList.value = res.data
  userListShow.value = JSON.parse(JSON.stringify(userList.value))
  console.log(userList.value)
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;

  .inner {
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    margin: 20px;
    display: flex;
    flex-direction: column;

    .echarts {
      width: 100%;
      height: 120px;
      // background-color: red;
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .left {
        display: flex;
        flex-direction: column;
        // margin-right: 15vw;
        height: 100%;
        flex: 1;

        .topic {
          font-size: 20px;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .bottom {
          display: flex;

          .avatar {
            margin: 5px 0
          }

          .basic-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-left: 20px;

            .title {
              font-size: 18px;
              color: #333;
            }

            .contact-info {
              display: flex;
              margin-top: 10px;

              .name {
                font-size: 15px;
                color: #666;
                margin-right: 20px;
              }

              .tel {
                font-size: 15px;
                color: #666;
              }
            }
          }
        }
      }

      .right {
        margin-left: 20px;
        display: flex;
        // justify-content: space-between;
        height: 100%;
        flex: 1;

        .left {
          display: flex;
          flex-direction: column;
          position: relative;

          .topic {
            font-size: 20px;
            margin-bottom: 10px;
            font-weight: 700;
          }

          .total-num {
            width: 100%;
            height: 100%;

            .num {
              font-size: 45px;
            }

            .name {
              font-size: 16px;
            }
          }

          .right {
            position: absolute;
            left: 250px;
            top: 10%;
            // width: 200px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            // align-items: center;

            .admin-num,
            .user-num {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;

              .num {
                font-size: 35px;
                margin-right: 25px;
              }

              .name {
                font-size: 16px;
              }
            }

            .admin-num {
              color: #1E90FF;
            }

            .user-num {
              color: #8A2BE2;
            }
          }

          .pie-chart {
            position: absolute;
            left: 100px;
            top: calc(-30px + 10%);
            width: 170px;
            height: 170px;
          }
        }
      }

      .blank {
        flex: 1;
        height: 100%;
      }
    }

    .search {
      width: 100%;
      height: 64px;
      // background-color: blue;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left {
        height: 100%;
        display: flex;
        align-items: center;
        font-size: 16px;

        .left-item {
          margin-right: 20px;
          display: flex;
          align-items: center;

          span {
            white-space: nowrap;
            margin-right: 10px;
          }
        }
      }
    }

    .table {
      width: 100%;
      height: calc(100% - 204px);
      // 滚动条
      overflow: auto;

      // background-color: green;
    }
  }

  .user-add,
  .user-edit {
    width: calc(100% - 70px);
    height: calc(100% - 65px);
    z-index: 9999;
    position: fixed;
    top: 65px;
    left: 70px;
    display: flex;
    background-color: rgba(0, 0, 0, 0.45);

    .close-cross {
      position: absolute;
      top: 15px;
      right: 15px;
      cursor: pointer;
    }

    .left {
      width: 75%;
      height: 100%;
    }

    .right {
      width: 25%;
      height: 100%;
      background-color: white;

      .user-inner {
        padding: 20px;
        width: calc(100% - 40px);
        height: calc(100% - 40px);

        .title {
          font-size: 18px;
          margin-bottom: 30px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          margin-bottom: 30px;

          .left {
            flex: 3.5;
          }

          .right {
            flex: 6.5;
          }
        }
      }
    }

  }
}


// 过渡动画
.add-user-enter-active,
.add-user-leave-active {
  transition: opacity 0.3s;
}

.add-user-enter-active .right,
.add-user-leave-active .right {
  transition: transform 0.3s ease;
}

.add-user-enter-from .right,
.add-user-leave-to .right {
  transform: translateX(100%);
}

.edit-user-enter-active,
.edit-user-leave-active {
  transition: opacity 0.3s;
}

.edit-user-enter-active .right,
.edit-user-leave-active .right {
  transition: transform 0.3s ease;
}

.edit-user-enter-from .right,
.edit-user-leave-to .right {
  transform: translateX(100%);
}
</style>
