<template>
  <div id="cesiumContainer"></div>
  <div class="info-box">
    <!-- 地图选择器 -->
    <div class="camera-basic-setting">
      <div class="demonstration" style="margin-bottom: 5px;">地图选择器</div>
      <el-button
        type="primary"
        size="small"
        v-for="(value, key) in regionCoordinate"
        @click="flyToRegion(value, key)">
        {{ key }}
      </el-button>
    </div>

    <!-- 视频融合摄像头个数 -->
    <div class="camera-basic-setting">
      <div class="demonstration">视频融合显示个数</div>
      <el-input-number
        v-model="fusionCameraNumber"
        size="small"
        class="cam-number-input">
      </el-input-number>
    </div>

    <!-- 视锥体显示 -->
    <div class="camera-basic-setting">
      <div class="demonstration">摄像头编辑模式</div>
      <el-switch
        v-model="frustumShow"
        active-color="#13ce66"
        inactive-color="#ffffff"
        active-text="开"
        inactive-text="关"
        class="slider"></el-switch>
    </div>

    <div class="inner" v-show="showInfoBox">
      <div style="margin-top: 20px;" class="title">| 基本信息</div>
      <!-- id -->
      <div class="camera-basic-setting">
        <div class="demonstration">摄像头ID</div>
        <div class="slider">{{ infoContent.id }}</div>
      </div>
      <!-- 摄像头名称 -->
      <div class="camera-basic-setting">
        <div class="demonstration">摄像头名称</div>
        <div class="slider">{{ infoContent.name }}</div>
      </div>
      <!-- 是否显示/隐藏 -->
      <!-- <div class="camera-basic-setting">
        <div class="demonstration">融合区域显示</div>
        <el-switch
          v-model="infoContent.show"
          active-color="#13ce66"
          inactive-color="#ffffff"
          active-text="显示"
          inactive-text="隐藏"
          class="slider"></el-switch>
      </div> -->
      <!-- 球机 -->
      <div class="camera-basic-setting">
        <div class="demonstration">类型</div>
        <div class="slider">球机</div>
      </div>

      <!-- part1 -->
      <!-- 坐标参数调节面板 -->
      <div style="margin-top: 20px;" class="title">| 坐标位置</div>
      <!-- <div class="panel-block">
        <div class="demonstration">当前坐标</div>
        <div class="slider" style="line-height: 26px;">
          <div>经度: {{ infoContent.position[0] }}°E</div>
          <div>纬度: {{ infoContent.position[1]}}°N</div>
          <div>高程: {{ infoContent.position[2] }}m</div>
        </div>
      </div> -->
      <!-- <div class="panel-block">
        <div class="demonstration">当前坐标</div>
        <table
          class="coordinate-table"
          style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px;">
          <tbody>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">经度</td>
              <td style="border: 1px solid #ccc; padding: 8px;">
                {{ infoContent.position[0] }}°E
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">纬度</td>
              <td style="border: 1px solid #ccc; padding: 8px;">
                {{ infoContent.position[1] }}°N
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">高程</td>
              <td style="border: 1px solid #ccc; padding: 8px;">
                {{ infoContent.position[2] }}m
              </td>
            </tr>
          </tbody>
        </table>
      </div> -->

      <div class="camera-basic-setting">
        <div class="demonstration">经度</div>
        <div class="slider">{{ infoContent.position[0] }}°E</div>
      </div>
      <div class="camera-basic-setting">
        <div class="demonstration">纬度</div>
        <div class="slider">{{ infoContent.position[1]}}°N</div>
      </div>
      <div class="camera-basic-setting">
        <div class="demonstration">高程</div>
        <div class="slider">{{ infoContent.position[2] }}m</div>
      </div>

      <div class="panel-block" style="margin: 5px 0;">
        <div style="margin-right: 15px;">
          <span class="demonstration" style="margin-right: 7px;"
            >经纬度调整
          </span>
          <el-button
            type="primary"
            circle
            :icon="Top"
            class="direction"
            @click="updateCameraPositionByStep('north', cameraMoveDistance)" />
          <el-button
            type="primary"
            circle
            :icon="Bottom"
            class="direction"
            @click="updateCameraPositionByStep('south', cameraMoveDistance)" />
          <el-button
            type="primary"
            circle
            :icon="Back"
            class="direction"
            @click="updateCameraPositionByStep('west', cameraMoveDistance)" />
          <el-button
            type="primary"
            circle
            :icon="Right"
            class="direction"
            @click="updateCameraPositionByStep('east', cameraMoveDistance)" />
        </div>
        <div>
          <span class="demonstration" style="margin-right: 7px;"
            >高程调整
          </span>
          <el-button
            type="primary"
            circle
            :icon="CaretTop"
            @click="updateCameraPositionByStep('up', cameraMoveDistance)"
            class="direction" />
          <el-button
            type="primary"
            circle
            :icon="CaretBottom"
            @click="updateCameraPositionByStep('down', cameraMoveDistance)"
            class="direction" />
        </div>
      </div>
      <!-- 坐标参数调节步长 -->
      <div style="margin: 10px 0 30px 0; display: block;" class="panel-block">
        <span class="demonstration" style="margin-right: 35px;">调整步长 </span>
        <el-input-number v-model="cameraMoveDistance" size="small">
          <template #suffix>
            <span>m</span>
          </template>
        </el-input-number>
      </div>

      <!-- part2 -->
      <span class="title">| 姿态参数</span>
      <!-- 姿态参数 -->
      <div v-for="(value, key) in infoList" class="panel-block">
        <div class="demonstration">{{ stanceOptionCN[key] }}</div>
        <el-slider
          v-model="infoContent[key]"
          show-input
          size="small"
          :min="value[0]"
          :max="value[1]"
          :step="value[2]"
          class="slider"></el-slider>
      </div>

      <!-- part3 -->
      <!-- 复原与确认按钮 -->
      <div class="ctl-btn" style="margin: 15px 0 8px 0;">
        <el-button type="primary" @click="restoreToOldStanceOption"
          >复原</el-button
        >
        <el-button type="primary" @click="updateToNewStanceOption"
          >更新</el-button
        >
      </div>
    </div>
  </div>

  <!-- 底部面板 -->
  <!-- <div class="bottom-panel">
    <div class="cesium-info">
      <CesiumInfo :viewer="viewer"></CesiumInfo>
    </div>
  </div> -->

  <!-- 左下角前往设置按钮 -->
  <div class="setting-btn">
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
    <img
      src="@/assets/images/setting.png"
      alt="前往管理平台"
      class="go-setting"
      @click="goSetting"
      v-show="adminStore.isAdmin" />
  </div>

  <!-- 左侧面板 -->
  <div class="left-panel">
    <div class="title">米脂县农业视频监控管理平台</div>
    <div class="subtitle">| 摄像头列表</div>
    <div v-for="(item, index) in cameraList" :key="item.id" class="table">
      <!-- 检测 xxx 是否变化 -->
      <template
        v-if="index === 0 || getXXX(cameraList[index - 1].stanceOption.name) !== getXXX(item.stanceOption.name)">
        <div class="header">
          ▶&nbsp;&nbsp;{{ getXXX(item.stanceOption.name) }}高标准农田
        </div>
      </template>
      <div @click="flyToCamera(item.stanceOption.position)" class="table-item">
        <img src="/camera-icon-white.png" alt="" />
        <span
          >{{ item.stanceOption.name}}&nbsp;&nbsp;--&nbsp;&nbsp;{{ item.id }}</span
        >
      </div>
    </div>
    <div class="help">
      <img src="/info-white.png" alt="" />
      <a href="/help/guide.pdf" target="_blank">使用指南</a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as Cesium from 'cesium'
import Hls from 'hls.js'
import { getCameraConfig, createVideo3D } from '@/utils/addMultiVideo'
import { toggleDebugCameraPrimitives, toggleCameraEntities } from '@/utils/updateMultiVideo'
import { ElMessage } from 'element-plus'
import { regionCoordinate } from '@/assets/region'
import axios from 'axios'
import { Top, Bottom, Right, Back, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import CesiumInfo from '@/components/CesiumInfo.vue'
import { useAdminStore } from '@/stores/admin'
import router from '@/router'

let viewer = null
const showInfoBox = ref(false)
const frustumShow = ref(false)
const pickedCameraID = ref('')  // 当前选中摄像头ID
const cameraMoveDistance = ref(5)  // 摄像头坐标移动步长
const initialRegion = '对岔'  // 默认飞到的区域
const fusionCameraNumber = ref(3)  // 视频融合显示个数（根据GPU性能调整）

const adminStore = useAdminStore()
const isAdmin = ref(adminStore.isAdmin)
function goSetting() {
  if (isAdmin.value) {
    router.push('/settings')
  }
}
function logout() {
  adminStore.setIsAdmin(false)
  router.push('/')
}


// 摄像头参数最大最小值
const infoList = {
  heading: [0, 360, 1],
  pitch: [-180, 180, 1],
  roll: [-180, 180, 1],
  fov: [1, 90, 1],
  aspectRatio: [0.1, 5, 0.1],
  distance: [1, 2000, 1],
  opacity: [0, 1, 0.05],
}
// 摄像头参数中文名
const stanceOptionCN = {
  heading: '方位角',
  pitch: '俯仰角',
  roll: '翻滚角',
  fov: '视场角',
  aspectRatio: '宽高比',
  distance: '投影距离',
  opacity: '视频透明度',
}


// 当前选中摄像头姿态信息+坐标信息（实时）
const infoContent = ref({
  id: '',
  name: '',
  position: [0, 0, 0],
  heading: 0,
  pitch: 0,
  roll: 0,
  fov: 0,
  aspectRatio: 0,
  distance: 0,
  opacity: 1,
  show: false,
})
const infoCameraPPS = ref(null)
// 当前选中摄像头姿态信息（原始）
const infoContentOriginal = ref({
  id: '',
  name: '',
  position: [0, 0, 0],
  heading: 0,
  pitch: 0,
  roll: 0,
  fov: 0,
  aspectRatio: 0,
  distance: 0,
  opacity: 1,
  show: false,
})
const infoCameraPPSOriginal = ref(null)


// 摄像头列表
const cameraList = ref([])


/**
 * 飞到区域
 */
function flyToRegion(position, name) {
  // // 隐藏之前的摄像头，显示新的摄像头
  // cameraList.value.forEach(camera => {
  //   if (camera.stanceOption.name.startsWith(name)) {
  //     camera.postProcessStage.enabled = true
  //   } else {
  //     camera.postProcessStage.enabled = false
  //   }
  // })

  // 飞到指定位置
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 1,
  })
}

/**
 * 飞到对应摄像头
 */
function flyToCamera(position) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]+500),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 1,
  })
}

/**
 * 左侧设备列表区分
 */
function getXXX(name) {
  // 定义固定的 4 个 xxx 名称
  const xxxList = ['姜兴庄', '冯渠', '对岔', '李家寺']

  // 遍历 xxxList，找到当前 name 中匹配的 xxx
  return xxxList.find(xxx => name.startsWith(xxx)) || ''
}

/**
 * 显示信息的函数
 */
function showPopupInfo(id) {
  // 根据id获取摄像头信息
  const camera = cameraList.value.find(camera => camera.id === id)
  if (camera) {
    showInfoBox.value = true
    // 将摄像头信息赋值给infoContent
    infoContent.value = JSON.parse(JSON.stringify(cameraList.value.find(camera => camera.id === id).stanceOption))
    // 保存camera和postProcessStage
    infoCameraPPS.value = {
      camera: cameraList.value.find(camera => camera.id === id).camera,
      postProcessStage: cameraList.value.find(camera => camera.id === id).postProcessStage
    }
    // copy一份老的数据
    infoContentOriginal.value = JSON.parse(JSON.stringify(infoContent.value))
    infoCameraPPSOriginal.value = infoCameraPPS.value
  }
}

/**
 * 以固定步长调节摄像头坐标（本质是改变infoContent）
 */
function updateCameraPositionByStep(direction, distance) {
  const [lon, lat, height] = infoContent.value.position

  // 处理上下移动（高程）
  if (direction === 'up' || direction === 'down') {
    const movement = Number(distance * (direction === 'up' ? 1 : -1).toFixed(6))
    infoContent.value.position[2] += movement
    const cameraEntity = viewer.entities.getById('camera-position-' + infoContent.value.id)
    const iconEntity = viewer.entities.getById('camera-icon-' + infoContent.value.id)
    cameraEntity.position = Cesium.Cartesian3.fromDegrees(lon, lat, infoContent.value.position[2])
    iconEntity.position = Cesium.Cartesian3.fromDegrees(lon, lat, infoContent.value.position[2])
    return
  }

  // 处理东西南北移动（经纬度）
  const position = Cesium.Cartesian3.fromDegrees(lon, lat, height)
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position)

  const east = Cesium.Matrix4.getColumn(transform, 0, new Cesium.Cartesian3())
  const north = Cesium.Matrix4.getColumn(transform, 1, new Cesium.Cartesian3())

  let movement = new Cesium.Cartesian3();
  switch (direction) {
    case 'north':
      movement = Cesium.Cartesian3.multiplyByScalar(north, distance, movement)
      break
    case 'south':
      movement = Cesium.Cartesian3.multiplyByScalar(north, -distance, movement)
      break
    case 'east':
      movement = Cesium.Cartesian3.multiplyByScalar(east, distance, movement)
      break
    case 'west':
      movement = Cesium.Cartesian3.multiplyByScalar(east, -distance, movement)
      break
    default:
      return
  }

  const newPosition = Cesium.Cartesian3.add(position, movement, new Cesium.Cartesian3())
  const cartographic = Cesium.Cartographic.fromCartesian(newPosition)
  const newLon = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6))
  const newLat = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6))

  // 保持原有高度，更新经纬度
  infoContent.value.position = [newLon, newLat, infoContent.value.position[2]]

  // 更新实体位置
  const cameraEntity = viewer.entities.getById('camera-position-' + infoContent.value.id)
  const iconEntity = viewer.entities.getById('camera-icon-' + infoContent.value.id)
  cameraEntity.position = Cesium.Cartesian3.fromDegrees(newLon, newLat, infoContent.value.position[2])
  iconEntity.position = Cesium.Cartesian3.fromDegrees(newLon, newLat, infoContent.value.position[2])
}


/**
 * 更新摄像头参数
 */
function updateCamera(camera, position, postProcessStage) {
  camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(position.position[0], position.position[1], position.position[2]),
    orientation: {
      heading: Cesium.Math.toRadians(position.heading-90),
      pitch: Cesium.Math.toRadians(position.pitch-90),
      roll: Cesium.Math.toRadians(position.roll)
    }
  })

  camera.frustum = new Cesium.PerspectiveFrustum({
    fov: Cesium.Math.toRadians(position.fov),
    aspectRatio: position.aspectRatio,
    near: 0.01,
    far: position.distance
  })

  // 更新postProcessStage的opacity uniform
  postProcessStage.uniforms.opacity = position.opacity

  // 更新摄像头显示状态
  postProcessStage.enabled = position.show
}

/**
 * 深度监听 infoContent 变化
 */
watch(infoContent, (newValue, oldValue) => {
  if (infoCameraPPS.value) {
    updateCamera(infoCameraPPS.value.camera, newValue, infoCameraPPS.value.postProcessStage)
  }
}, { deep: true })


/**
 * 复原/更新姿态参数
 */
function restoreToOldStanceOption() {
  if (JSON.stringify(infoContent.value) === JSON.stringify(infoContentOriginal.value)) {
    ElMessage.warning('未修改任何参数!')
  } else {
    // 复原摄像头各参数
    infoContent.value = JSON.parse(JSON.stringify(infoContentOriginal.value))
    // 复原摄像头entity
    const cameraEntity = viewer.entities.getById('camera-position-' + infoContent.value.id)
    cameraEntity.position = Cesium.Cartesian3.fromDegrees(infoContentOriginal.value.position[0], infoContentOriginal.value.position[1], infoContentOriginal.value.position[2])
    const iconEntity = viewer.entities.getById('camera-icon-' + infoContent.value.id)
    iconEntity.position = Cesium.Cartesian3.fromDegrees(infoContentOriginal.value.position[0], infoContentOriginal.value.position[1], infoContentOriginal.value.position[2])

    ElMessage.success('复原成功!')
  }
}
async function updateToNewStanceOption() {
  if (JSON.stringify(infoContent.value) === JSON.stringify(infoContentOriginal.value)) {
    ElMessage.warning('未修改任何参数!')
    return
  }
  const index = cameraList.value.findIndex(c => c.id === infoContent.value.id);
  if (index !== -1) {
    cameraList.value[index] = {
      ...cameraList.value[index],
      stanceOption: infoContent.value
    }
    // 确保postProcessStage的uniform也被更新
    cameraList.value[index].postProcessStage.uniforms.opacity = infoContent.value.opacity
    infoContentOriginal.value = JSON.parse(JSON.stringify(infoContent.value))

    /**
     * 更新到数据库
     */
    try {
      const res = await axios.post('http://47.117.71.69:8989/updateCamera', infoContent.value)
      console.log(res)
    } catch (error) {
      console.error(error)
      ElMessage.error('更新失败!')
      return
    }

    // 提示更新成功
    ElMessage.success('更新成功!')
  }
}

/**
 * 在拾取到非摄像头debugPrimitive或者没有拾取到东西时，复原摄像头姿态参数（如果infoContent有变化）
 */
function restoreCameraDuringPicking() {
  const cameraListInfo = cameraList.value.find(c => c.id === infoContent.value.id)
  if (cameraListInfo && JSON.stringify(infoContent.value) !== JSON.stringify(infoContentOriginal.value)) {
    updateCamera(infoCameraPPS.value.camera, infoContentOriginal.value, infoCameraPPS.value.postProcessStage)
    // 清空infoContent和camera
    infoContent.value = infoContentOriginal.value
    infoCameraPPS.value = infoCameraPPSOriginal.value

    // 复原摄像头entity
    const cameraEntity = viewer.entities.getById('camera-position-' + infoContent.value.id)
    cameraEntity.position = Cesium.Cartesian3.fromDegrees(infoContent.value.position[0], infoContent.value.position[1], infoContent.value.position[2])
    const iconEntity = viewer.entities.getById('camera-icon-' + infoContent.value.id)
    iconEntity.position = Cesium.Cartesian3.fromDegrees(infoContent.value.position[0], infoContent.value.position[1], infoContent.value.position[2])
  }
}

/**
 * 监听是否显示视锥体
 */
watch(() => frustumShow.value, (newVal) => {
  toggleDebugCameraPrimitives(viewer, newVal)

  if (!newVal) {
    showInfoBox.value = false
    // 当关闭视锥体时，恢复摄像头参数并清除选中ID
    restoreCameraDuringPicking()
    pickedCameraID.value = ''

    toggleCameraEntities(viewer, newVal)
  }
})


onMounted(async () => {
  // 获取cameraList
  cameraList.value = await getCameraConfig()
  // 去除status为0的摄像头
  cameraList.value = cameraList.value.filter(camera => camera.status === 1)
  // 去除show为false的摄像头
  cameraList.value = cameraList.value.filter(camera => camera.stanceOption.show === true)
  console.log(cameraList.value)

  // 确定是否为管理员
  console.log(adminStore.isAdmin)

  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MGMyMWM0YS1lNDEyLTRjNWYtYTY3OS1jOTZkOWM1OThjYTEiLCJpZCI6MTkxMTMxLCJpYXQiOjE3MDU5MDY1ODN9.Tq3eObtuZJiqt4rDl-srQkMfz-WP9_EvKEPa_UvOI5s'

  viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    terrainProvider: Cesium.createWorldTerrain()
  })
  viewer._cesiumWidget._creditContainer.style.display = 'none'
  viewer.clock.shouldAnimate = true
  viewer.scene.globe.depthTestAgainstTerrain = true

  /**
   * 影像图层与地形图层
   */
  // 吉林一号
  const jilin2023Layer = new Cesium.UrlTemplateImageryProvider({
    url: 'https://api.jl1mall.com/getMap/{z}/{x}/{reverseY}?mk=73ad26c4aa6957eef051ecc5a15308b4&tk=8c7cc72e35c8f91255a07175a328b3b2'
  })
  // 天地图
  const tdtAnnoLayer = new Cesium.WebMapTileServiceImageryProvider({
    url: 'http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=7b13a4031f051b6317cdcca67ae391f1',
    layer: 'tdtAnnoLayer',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible',
    show: false,
  })
  // viewer.imageryLayers.addImageryProvider(jilin2023Layer)
  // viewer.imageryLayers.addImageryProvider(tdtAnnoLayer)


  /**
   * 遍历cameraList添加视频
   */
  cameraList.value.forEach(camera => {
    // 创建视频元素
    let videoEle = document.createElement('video')
    videoEle.setAttribute('muted', true)
    videoEle.setAttribute('loop', true)
    videoEle.setAttribute('autoplay', true)
    document.body.appendChild(videoEle)
    videoEle.style.cssText = 'position:absolute;left:0px;top:0px;width:320px;height:240px;display:none'
    // videoEle.setAttribute("src", "/lukou.mp4")

    // 使用hls.js播放视频
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(camera.videoUrl)
      hls.attachMedia(videoEle)
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        videoEle.play().then(() => {
          console.log('Video playing')
        })
      })
    } else if (videoEle.canPlayType('application/vnd.apple.mpegurl')) {
      videoEle.src = camera.videoUrl
      videoEle.addEventListener('loadedmetadata', function () {
        videoEle.play().then(() => {
          console.log('Video playing')
        })
      })
    }

    // 视频加载完成后创建 3D 视频对象
    videoEle.addEventListener('loadeddata', () => {
      // let p = camera.stanceOption.position
      // let p1 = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2])
      const { camera: createdCamera, postProcessStage } = createVideo3D(viewer, videoEle, camera.id, camera.stanceOption)

      // 将获得的 camera 保存到 cameraList 中
      const index = cameraList.value.findIndex(c => c.id === camera.id)
      if (index !== -1) {
        cameraList.value[index] = {
          ...cameraList.value[index],
          camera: createdCamera,
          postProcessStage: postProcessStage
        }
      }

      // 先隐藏不需要的
      if (!camera.stanceOption.name.startsWith(initialRegion)) {
        postProcessStage.enabled = false
      }

      // 如果该摄像头的show是false，则隐藏融合区域
      if (!camera.stanceOption.show) {
        postProcessStage.enabled = false
      }
    })
  })

  // 飞到默认位置
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(regionCoordinate[initialRegion][0], regionCoordinate[initialRegion][1], regionCoordinate[initialRegion][2]),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 1,
  })

  /**
   * 监听事件
   */
  viewer.scene.canvas.addEventListener('click', (event) => {
    // 获取鼠标点击位置
    const screenPosition = new Cesium.Cartesian2(event.clientX, event.clientY)

    // 从屏幕坐标拾取场景对象
    const pickedObject = viewer.scene.pick(screenPosition)

    if (Cesium.defined(pickedObject)) {
      // 检查是否点击到了 DebugCameraPrimitive（frustum）
      if (pickedObject.primitive instanceof Cesium.DebugCameraPrimitive) {
        const id = pickedObject.primitive.id
        console.log("DebugCameraPrimitive id:", id)
        // 如果和上一个不同
        if (id !== pickedCameraID.value) {
          // 如果上一个未更新，则复原
          restoreCameraDuringPicking()
        }
        pickedCameraID.value = id // 保存当前选中摄像头ID
        showPopupInfo(id)
      } else {
        showInfoBox.value = false

        // 拾取到非摄像头debugPrimitive，也要复原
        restoreCameraDuringPicking()

        // 重置选中摄像头ID
        pickedCameraID.value = ''
      }
    } else {
      // 如果没有拾取到任何对象，隐藏信息框
      showInfoBox.value = false

      // 没有拾取到东西，也要复原
      restoreCameraDuringPicking()

      // 重置选中摄像头ID
      pickedCameraID.value = ''
    }
  })


  /**
   * 摄像头距离排序显示
   */
  let frameRequested = false
  function updateNearestCameraIconEntities() {
    const cameraPosition = viewer.camera.position

    // 获取所有cameraIcon实体并计算距离
    const cameraIconEntities = viewer.entities.values.filter(e =>
      e.id && e.id.startsWith('camera-icon-') && e.position
    ).map(entity => {
      try {
        const position = entity.position.getValue(viewer.clock.currentTime)
        return {
          entity: entity,
          id: entity.id,
          distance: Cesium.Cartesian3.distance(cameraPosition, position)
        }
      } catch(e) {
        return null
      }
    }).filter(Boolean)

    // 按距离排序并取前 fusionCameraNumber 个
    cameraIconEntities.sort((a, b) => a.distance - b.distance)
    const nearest = cameraIconEntities.slice(0, fusionCameraNumber.value)

    // 更新摄像头entity（蓝）显示状态
    // cameraIconEntities.forEach(item => {
    //   item.entity.show = !nearest.includes(item)
    // })
    // 更新摄像头entity（红）显示状态
    if (frustumShow.value) {
      const cameraEntities = viewer.entities.values.filter(e =>
        e.id && e.id.startsWith('camera-position-') && e.position
      )
      const nearestEntitiesUpdateID = nearest.map(item => item.id.replace('camera-icon-', 'camera-position-'))
      cameraEntities.forEach(entity => {
        entity.show = nearestEntitiesUpdateID.includes(entity.id)
      })
    }

    // 更新融合区域的显示/隐藏
    cameraList.value.forEach(camera => {
      if (camera.postProcessStage) {
        if (nearest.map(item => item.id).includes('camera-icon-' + camera.id)) {
          camera.postProcessStage.enabled = true
        } else {
          camera.postProcessStage.enabled = false
        }
      }
    })

    frameRequested = false
  }

  // 使用防抖优化性能
  viewer.scene.postRender.addEventListener(() => {
    if (!frameRequested) {
      frameRequested = true
      requestAnimationFrame(updateNearestCameraIconEntities)
    }
  })
  // 初始化时执行一次
  updateNearestCameraIconEntities()
})
</script>

<style scoped lang="scss">
#cesiumContainer {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.left-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 10px 20px 10px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 5px;
  width: 400px;
  max-height: calc(100vh - 100px);
  
  overflow-y: auto;
  overflow-x: hidden;
  /* 整个滚动条轨道 */
  &::-webkit-scrollbar {
    width: 8px; /* 滚动条宽度 */
  }

  /* 滚动条轨道 */
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2); /* 比面板底色稍亮的半透明黑色 */
    border-radius: 4px;
  }

  /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3); /* 半透明白色滑块 */
    border-radius: 4px;
  }

  /* 鼠标悬停在滑块上的样式 */
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5); /* 更明显的白色 */
  }

  .title {
    font-size: 23px;
    font-weight: 700;
    line-height: 23px;
    margin-top: 5px;
    margin-bottom: 20px;
    // 居中
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .subtitle {
    font-size: 20px;
    font-weight: 700;
    line-height: 16px;
  }

  .table {
    margin-top: 15px;

    .table-item {
      // margin-bottom: 8px;
      margin-left: 25px;
      display: flex;
      align-items: center;
      font-size: 16px;

      img {
        width: 18px;
        height: 18px;
        margin-right: 8px;
      }

      span {
        cursor: pointer;
      }

      span:hover {
        color: #409eff;
      }
    }

    .header {
      margin-bottom: 8px;
      font-weight: 700;
      font-size: 17px;
    }
  }

  .help {
    cursor: pointer;
    display: flex;
    line-height: 17px;
    font-size: 17px;
    margin-top: 15px;

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

.info-box {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 10px 20px 10px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 5px;

  max-height: calc(100vh - 40px);
  overflow-y: auto;
  overflow-x: hidden;
  /* 整个滚动条轨道 */
  &::-webkit-scrollbar {
    width: 8px; /* 滚动条宽度 */
  }

  /* 滚动条轨道 */
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2); /* 比面板底色稍亮的半透明黑色 */
    border-radius: 4px;
  }

  /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3); /* 半透明白色滑块 */
    border-radius: 4px;
  }

  /* 鼠标悬停在滑块上的样式 */
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5); /* 更明显的白色 */
  }
}

.panel-block {
  width: 400px;
  display: flex;
  align-items: center;

  .slider {
    margin-top: 0;
    flex: 3;
  }

  .demonstration {
    font-size: 14px;
    color: white;
    line-height: 30px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0;
  }
}

.camera-basic-setting {
  display: flex;
  align-items: center;
  width: 400px;

  .demonstration {
    width: 34%;
    margin-right: 10px;
    font-size: 14px;
    color: white;
    line-height: 30px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.bottom-panel {
  position: fixed;
  bottom: 0;
  width: 100vw;
  height: 2.5vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;

  .cesium-info {
    flex: 8;
    width: 500px;
    height: 100%;
    display: flex;
    justify-content: center;
    color: white;
  }
}

.title {
  font-size: 18px;
  font-weight: 700;
  line-height: 20px;
}

.direction {
  margin-left: 5px;
}

:deep(.el-slider__input) {
  width: 95px !important;
}

.setting-btn {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  align-items: center;


  .logout {
    cursor: pointer;
  }
  .go-setting {
    width: 40px;
    height: 40px;
    cursor: pointer;
    margin-left: 15px;
  }
}
</style>
