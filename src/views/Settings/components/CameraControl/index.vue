<template>
  <div class="container" v-show="!cameraEditShow">
    <div class="top-menu">
      <div class="inner">
        <div class="left">
          <div class="left-item">
            <span>地块</span>
            <el-select
              v-model="regionSelected"
              placeholder="请选择地块"
              style="width: 180px;">
              <el-option
                v-for="item in regionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="left-item">
            <span>名称</span>
            <el-select
              v-model="cameraSelected"
              placeholder="请选择摄像头"
              style="width: 180px;">
              <el-option
                v-for="item in cameraOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="left-item">
            <span>状态</span>
            <el-select
              v-model="stateSelected"
              placeholder="请选择状态"
              style="width: 180px;">
              <el-option
                v-for="item in stateOptions"
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
              @click="filterBtnClick()"
              >查询</el-button
            >
          </div>
        </div>
        <div class="right">
          <el-button
            type="primary"
            color="rgb(27, 153, 97)"
            :icon="Plus"
            @click="addNewCamera"
            >添加</el-button
          >
        </div>
      </div>
    </div>
    <div class="bottom-container">
      <div v-for="(item, index) in cameraShow" :key="index" class="camera-item">
        <div class="camera-item-top">
          <div class="top">
            <div class="title">{{ item.stanceOption.name }}</div>
            <img src="@/assets/images/camera.png" alt="" class="img" />
          </div>
          <div class="middle">
            <span
              class="status"
              :class="{ online: item.status === 1 }"
              >{{ item.status === 1 ? '在线' : '离线' }}</span
            >
          </div>
          <div class="bottom">
            <div class="row">
              <div class="left">序列号：</div>
              <div class="right">{{ item.id }}</div>
            </div>
            <div class="row">
              <div class="left">通道：</div>
              <div class="right">1</div>
            </div>
            <div class="row">
              <div class="left">类型：</div>
              <div class="right">球机</div>
            </div>
            <div class="bottom-btn">
              <!-- <el-button
                type="primary"
                plain
                color="rgb(27, 153, 97)"
                :icon="VideoCamera"
                class="video-btn"
                >查看</el-button
              > -->
              <el-button
                type="primary"
                plain
                color="rgb(27, 153, 97)"
                :icon="Edit"
                class="video-btn"
                @click="changeCameraEditShow(item.id)"
                >编辑</el-button
              >
              <el-button
                type="primary"
                plain
                color="rgb(27, 153, 97)"
                :icon="Delete"
                class="video-btn"
                @click="deleteBtnClick(item.id)"
                >删除</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 添加新摄像头 -->
    <transition name="add-camera">
      <div v-show="cameraAddShow" class="camera-add">
        <div class="left" @click="closeAddCamera"></div>
        <div class="right">
          <div class="inner">
            <div class="title">添加新摄像头</div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>地块
              </div>
              <div class="right">
                <el-select v-model="cameraAddData.region" placeholder="请选择">
                  <el-option
                    v-for="item in regionNames"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>名称
              </div>
              <div class="right">
                <el-input v-model="cameraAddData.name" placeholder="请输入" />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>序列号
              </div>
              <div class="right">
                <el-input v-model="cameraAddData.id" placeholder="请输入" />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>推流地址
              </div>
              <div class="right">
                <el-input v-model="cameraAddData.hls" placeholder="请输入" />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>经度（°E）
              </div>
              <div class="right">
                <el-input v-model="cameraAddData.x" placeholder="请输入" />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>纬度（°N）
              </div>
              <div class="right">
                <el-input v-model="cameraAddData.y" placeholder="请输入" />
              </div>
            </div>
            <div class="item">
              <div class="left">
                <span style="color: red;">*&nbsp;&nbsp;</span>高程（m）
              </div>
              <div class="right">
                <el-input v-model="cameraAddData.z" placeholder="请输入" />
              </div>
            </div>
            <div class="btns">
              <el-button type="primary" color="rgb(27, 153, 97)" plain @click="closeAddCamera">取消</el-button>
              <el-button type="primary" color="rgb(27, 153, 97)" @click="confirmAddCamera">确定</el-button>
            </div>
          </div>
          
        </div>
        <div class="close-cross">
          <el-icon :size="25" class="close-btn" @click="closeAddCamera"
            ><Close
          /></el-icon>
        </div>
      </div>
    </transition>
  </div>
  <CameraEditCesium
    class="edit-container"
    :cameraEditShow="changeCameraEditShow"
    :cameraEditID="cameraEditID"
    :cameraList="cameraList"
    v-if="cameraEditShow"></CameraEditCesium>
</template>

<script setup>
import { Plus, Edit, Delete, VideoCamera, Close } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import { getCameraConfig } from '@/utils/addMultiVideo'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import CameraEditCesium from './CameraEditCesium.vue'

const cameraList = ref([])  // 接口获取的摄像头列表
const cameraShow = ref([])  // 展示的摄像头列表
const cameraEditShow = ref(false)  // 是否展示编辑页面

const cameraAddShow = ref(false)  // 是否展示添加页面
function addNewCamera() {
  cameraAddShow.value = !cameraAddShow.value
}
function closeAddCamera() {
  cameraAddShow.value = false
  // 清空数据
  cameraAddData.value = {
    region: '',
    name: '',
    id: '',
    hls: '',
    x: '',
    y: '',
    z: '',
  }
}
const cameraAddData = ref({
  region: '',
  name: '',
  id: '',
  hls: '',
  x: '',
  y: '',
  z: '',
})
// watch region和name的联动
watch(() => cameraAddData.value.region, (newVal) => {
  if (newVal) {
    cameraAddData.value.name = cameraAddData.value.region + '监测站点'
  }
})


/**
 * 确认添加视频
 */
async function confirmAddCamera() {
  // 判断是否有空值
  for (const key in cameraAddData.value) {
    if (!cameraAddData.value[key]) {
      ElMessage.error('请填写完整信息!')
      return
    }
  }

  // 构造数据(部分数据是默认的)
  const data = {
    id: cameraAddData.value.id,
    name: cameraAddData.value.name,
    x: cameraAddData.value.x,
    y: cameraAddData.value.y,
    z: cameraAddData.value.z,
    hls: cameraAddData.value.hls,
    // 以下数据默认
    status: 0,
    heading: 180,
    pitch: 60,
    roll: 0,
    fov: 30,
    aspectRatio: 2,
    distance: 1000,
    opacity: 0.8,
    videoShow: 1,
  }

  // 发送请求
  const res = await axios.post('http://47.117.71.69:8989/addCamera', data)
  console.log(res)
  if (res.data.status === 'fail') {
    ElMessage.error('序列号重复!')
    return
  } else if (res.data.status === 'success') {
    ElMessage.success('添加成功!')

    // 关闭添加页面
    closeAddCamera()
    // 重新获取数据
    cameraList.value = await getCameraConfig()
    cameraShow.value = JSON.parse(JSON.stringify(cameraList.value))  // 深拷贝一份数据用于展示
    console.log('cameraList', cameraList.value)
    // 清空所有选择项
    regionSelected.value = ''
    stateSelected.value = ''
    cameraSelected.value = ''
    cameraOptions.value = cameraList.value.map(item => {
      return {
        value: item.id,
        label: item.stanceOption.name,
      }
    })
  }
}


const cameraEditID = ref({})  // 编辑摄像头的数据
async function changeCameraEditShow(cameraID) {
  cameraEditShow.value = !cameraEditShow.value

  // 如果是进入编辑界面，需要props传递数据
  if (cameraID) {
    cameraEditID.value = cameraID
  } else {
    // 退出编辑界面重新调用接口
    cameraList.value = await getCameraConfig()
    cameraShow.value = JSON.parse(JSON.stringify(cameraList.value))  // 深拷贝一份数据用于展示
    console.log('cameraList', cameraList.value)
    // 清空所有选择项
    regionSelected.value = ''
    stateSelected.value = ''
    cameraSelected.value = ''
    cameraOptions.value = cameraList.value.map(item => {
      return {
        value: item.id,
        label: item.stanceOption.name,
      }
    })
    // 在cameraOptions第一个加上全部
    cameraOptions.value.unshift({ value: '全部', label: '全部' })
  }
}

/**
 * 选择框数据定义
 */
const regionSelected = ref('')
const regionOptions = [
  { value: '全部', label: '全部' },
  { value: '对岔', label: '对岔' },
  { value: '姜兴庄', label: '姜兴庄' },
  { value: '李家寺', label: '李家寺' },
  { value: '冯渠', label: '冯渠' },
]
const regionNames = [
  { value: '对岔', label: '对岔' },
  { value: '姜兴庄', label: '姜兴庄' },
  { value: '李家寺', label: '李家寺' },
  { value: '冯渠', label: '冯渠' },
]
const stateSelected = ref('')
const stateOptions = [
  { value: '全部', label: '全部' },
  { value: '在线', label: '在线' },
  { value: '离线', label: '离线' },
]
const cameraSelected = ref('')
const cameraOptions = ref([])


/**
 * 注意地块和名称的联动
 */
watch(regionSelected, (newVal) => {
  if (!newVal) {
    cameraOptions.value = cameraList.value.map(item => {
      return {
        value: item.id,
        label: item.stanceOption.name,
      }
    })
    // 在cameraOptions第一个加上全部
    cameraOptions.value.unshift({ value: '全部', label: '全部' })
  } else {
    cameraOptions.value = cameraList.value.filter(item => item.stanceOption.name.startsWith(newVal)).map(item => {
      return {
        value: item.id,
        label: item.stanceOption.name,
      }
    })
    // 在cameraOptions第一个加上全部
    cameraOptions.value.unshift({ value: '全部', label: '全部' })
  }
})


/**
 * 重置+查询按钮点击事件
 */
function resetBtnClick() {
  regionSelected.value = ''
  stateSelected.value = ''
  cameraSelected.value = ''
}
function filterBtnClick() {
  let cameraShowTemp = JSON.parse(JSON.stringify(cameraList.value))  // 深拷贝一份数据用于展示
  if (!(regionSelected.value === '全部' || regionSelected.value === '')) {
    cameraShowTemp = cameraShowTemp.filter(item => item.stanceOption.name.startsWith(regionSelected.value))
  }
  if (!(stateSelected.value === '全部' || stateSelected.value === '')) {
    cameraShowTemp = cameraShowTemp.filter(item => item.status === (stateSelected.value === '在线' ? 1 : 0))
  }
  if (!(cameraSelected.value === '全部' || cameraSelected.value === '')) {
    cameraShowTemp = cameraShowTemp.filter(item => item.id === cameraSelected.value)
  }

  // 赋值
  cameraShow.value = cameraShowTemp
}


/**
 * 删除摄像头
 */
function deleteBtnClick(id) {
  ElMessageBox.confirm('此操作将永久删除该摄像头, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    try {
      const res = axios.post('http://47.117.71.69:8989/deleteCamera', { id })
    } catch (error) {
      console.log('error', error)
      ElMessage.error('删除失败!')
      return
    }
    ElMessage.success('删除成功!')

    // 在页面中展示的信息也要改变
    cameraList.value = cameraList.value.filter(item => item.id !== id)
    cameraShow.value = cameraShow.value.filter(item => item.id !== id)
    cameraOptions.value = cameraOptions.value.filter(item => item.value !== id)
    if (cameraSelected.value === id) {
      cameraSelected.value = ''
    }
  })
}

onMounted(async () => {
  cameraList.value = await getCameraConfig()
  cameraShow.value = JSON.parse(JSON.stringify(cameraList.value))  // 深拷贝一份数据用于展示
  console.log('cameraList', cameraList.value)

  // 初始化摄像头选择框数据
  cameraOptions.value = cameraList.value.map(item => {
    return {
      value: item.id,
      label: item.stanceOption.name,
    }
  })
  // 在cameraOptions第一个加上全部
  cameraOptions.value.unshift({ value: '全部', label: '全部' })
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;

  .top-menu {
    width: 100%;
    height: 64px;

    .inner {
      margin: 0 20px;
      width: calc(100% - 40px);
      height: 100%;
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
  }

  .bottom-container {
    width: 100%;
    height: calc(100% - 64px);
    overflow-y: auto;
    background-color: rgba(128, 128, 128, 0.1);
    padding: 20px;
    box-sizing: border-box;

    /* 网格布局配置 */
    display: grid;
    grid-template-columns: repeat(4, minmax(240px, 1fr)); // 默认4列
    row-gap: 20px;
    column-gap: 20px;
    transition: all 0.3s ease; // 添加布局过渡动画

    /* 宽屏适配（1600px~1999px） */
    @media (min-width: 1600px) {
      column-gap: 40px;
      grid-template-columns: repeat(4, minmax(240px, 1fr)); // 保持4列
    }

    /* 超宽屏适配（≥2000px） */
    @media (min-width: 2000px) {
      column-gap: 60px;
      grid-template-columns: repeat(5, minmax(240px, 1fr)); // 改为5列
    }

    .camera-item {
      height: 350px;
      // background-color: rgba(0, 128, 255, 0.2);
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      // display: flex;
      // justify-content: center;
      // align-items: center;
      width: 100%;
      background-color: white;

      // hover阴影
      &:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }

      .camera-item-top {
        width: calc(100% - 50px);
        height: 40%;
        margin: 30px 20px 30px 30px;

        .top {
          display: flex;
          justify-content: space-between;

          .title {
            font-size: 20px;
            font-weight: 700;
            color: black;
          }

          .img {
            width: 75px;
            height: 75px;
          }
        }

        .middle {
          margin-top: -5px;

          .status {
            font-size: 16px;
            color: white;
            padding: 5px 13px;
            border-radius: 20px;
            background-color: red;

            &.online {
              background-color: green;
            }
          }
        }

        .bottom {
          margin-top: 30px;

          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 5px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.2);

            .left {
              font-size: 17px;
              color: black;
              width: 80px;
            }

            .right {
              font-size: 17px;
              color: black;
            }
          }
        }

        .video-btn {
          cursor: pointer;
        }
      }
    }
  }

  .camera-add {
    width: calc(100% - 70px);
    height: calc(100% - 65px);
    z-index: 9999;
    position: fixed;
    top: 65px;
    left: 70px;
    display: flex;
    background-color: rgba(0, 0, 0, 0.45);

    .left {
      width: 75%;
      height: 100%;
    }

    .right {
      width: 25%;
      height: 100%;
      background-color: white;

      .inner {
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

    .close-cross {
      position: absolute;
      top: 15px;
      right: 15px;
      cursor: pointer;
    }
  }


  .pagination {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 30px;
    background-color: red;
  }
}

.edit-container {
  width: 100%;
  height: 100%;
}


// 过渡动画
.add-camera-enter-active,
.add-camera-leave-active {
  transition: opacity 0.3s;
}

.add-camera-enter-active .right,
.add-camera-leave-active .right {
  transition: transform 0.3s ease;
}

.add-camera-enter-from .right,
.add-camera-leave-to .right {
  transform: translateX(100%);
}
</style>
