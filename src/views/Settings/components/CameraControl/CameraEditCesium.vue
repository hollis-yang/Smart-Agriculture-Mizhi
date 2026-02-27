<template>
  <div>
    <div id="cesium-container" v-if="cameraEditID"></div>
    <div class="edit-panel">
      <div class="cesium-right">
        <div class="title">Cesium视频融合编辑</div>
        <div class="change-menu">
          <div
            class="item"
            :class="{ active: selectMenu === '当前设备详情' }"
            @click="selectMenu = '当前设备详情'">
            当前设备详情
          </div>
          <div
            class="item"
            :class="{ active: selectMenu === '所有设备列表' }"
            @click="selectMenu = '所有设备列表'">
            所有设备列表
          </div>
        </div>
        <div class="content">
          <!-- 当前设备详情 -->
          <CesiumRightPanel
            v-if="selectMenu === '当前设备详情' && cameraCurrentEdit"
            :cameraCurrentEdit="cameraCurrentEdit"
            :cameraList="cameraList"
            :updateCameraList="updateCameraList"
            :updateCameraCurrentEdit="updateCameraCurrentEdit"
            :updateCameraCurrentShowFrustum="updateCameraCurrentShowFrustum"></CesiumRightPanel>
          <!-- 所有设备列表 -->
          <div v-show="selectMenu === '所有设备列表'">
            <div class="content table">
              <el-table
                :data="cameraList"
                style="width: 100%; font-size: 16px;"
                stripe
                border>
                <el-table-column
                  class-name="column"
                  prop="stanceOption.name"
                  label="设备名称"
                  min-width="50%">
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="设备状态"
                  min-width="25%"
                  class-name="column">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.status === 1 ? 'success' : 'danger'"
                      effect="plain">
                      {{ row.status === 1 ? '正常' : '异常' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <!-- <el-table-column
                  prop="id"
                  label="序列号"
                  min-width="35%"
                  class-name="column">
                </el-table-column> -->
                <el-table-column
                  prop="id"
                  label="操作"
                  min-width="25%"
                  class-name="column">
                  <template #default="{ row }">
                    <el-button
                      @click="editNewCamera(row.id)"
                      plain
                      size="small"
                      type="primary"
                      >编辑</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="close-cross">
      <el-icon :size="25" class="close-btn" @click="closeAndDestroyViewer"
        ><Close
      /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'
import { ref, onMounted, watch } from 'vue'
import * as Cesium from 'cesium'
import { createVideo3D } from '@/utils/addMultiVideo'
import Hls from 'hls.js'
import CesiumRightPanel from './CesiumRightPanel.vue'
import { ElMessage } from 'element-plus'

let viewer = null
const props = defineProps(['cameraEditShow', 'cameraEditID', 'cameraList'])
const cameraEditID = ref(props.cameraEditID)
const cameraList = ref(props.cameraList)
const cameraCurrentEdit = ref()  // 当前编辑设备详情
const cameraCurrentPPS = ref({
  camera: null,
  postProcessStage: null,
})  // 当前编辑设备的camera和postProcessStage

const selectMenu = ref('当前设备详情')  // 当前选中的菜单


function updateCameraList(newVal) {
  cameraList.value = newVal
  console.log('cameraList', cameraList.value)
}
function updateCameraCurrentEdit(newVal) {
  cameraCurrentEdit.value = newVal
  console.log('cameraCurrentEdit', cameraCurrentEdit.value)

  /**
   * 更新Cesium中的camera和postProcessStage
   */
  // 1. postProcessStage
  if (cameraCurrentPPS.value.postProcessStage) {
    cameraCurrentPPS.value.postProcessStage.enabled = newVal.stanceOption.show
    cameraCurrentPPS.value.postProcessStage.uniforms.opacity = newVal.stanceOption.opacity
  }

  if (cameraCurrentPPS.value.camera) {
    // 2-1. camera frustum
    cameraCurrentPPS.value.camera.frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.toRadians(newVal.stanceOption.fov),
      aspectRatio: newVal.stanceOption.aspectRatio,
      near: 0.01,
      far: newVal.stanceOption.distance,
    })

    // 2-2. camera position
    cameraCurrentPPS.value.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(newVal.stanceOption.position[0], newVal.stanceOption.position[1], newVal.stanceOption.position[2]),
      orientation: {
        heading: Cesium.Math.toRadians(newVal.stanceOption.heading-90),
        pitch: Cesium.Math.toRadians(newVal.stanceOption.pitch-90),
        roll: Cesium.Math.toRadians(newVal.stanceOption.roll),
      },
    })

    // 2-3 camera entity位置
    const cameraEntityRed = viewer.entities.getById('cameraEntityRed')
    if (cameraEntityRed) {
      cameraEntityRed.position = Cesium.Cartesian3.fromDegrees(newVal.stanceOption.position[0], newVal.stanceOption.position[1], newVal.stanceOption.position[2])
    }
  }

}
function updateCameraCurrentShowFrustum(newVal) {
  // 找到debugCameraPrimitive
  if (viewer) {
    viewer.scene.primitives._primitives.forEach(primitive => {
      if (primitive instanceof Cesium.DebugCameraPrimitive) {
        primitive.show = newVal
      }
    })
  }
}


/**
 * 所有设备列表--编辑按钮
 */
function editNewCamera(id) {
  // 如果选中了当前正在编辑的设备
  if (id === cameraEditID.value) {
    ElMessage.warning('当前设备已正在编辑!')
    return
  }

  /**
   * 选中了新设备
   */
  // 0. 保存老的cameraid并删除 camera-position-oldid, camera-icon-oldid 这两个entity
  const oldCameraId = cameraEditID.value
  viewer.entities.removeById(`camera-position-${oldCameraId}`)
  viewer.entities.removeById(`camera-icon-${oldCameraId}`)
  // 1. 从cameraList中找到新设备
  const newCameraData = cameraList.value.find((item) => item.id === id)
  // 2. 更新cameraEditID
  cameraEditID.value = id
  // 3. 更新cameraCurrentEdit
  cameraCurrentEdit.value = JSON.parse(JSON.stringify(newCameraData))
  // 4. 将当前选中变更为当前设备详情
  selectMenu.value = '当前设备详情'
  // 5. 飞到新设备位置
  const position = cameraCurrentEdit.value.stanceOption.position
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2] + 500),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 1,
  })
  // 6. 先将当前编辑设备的camera和postProcessStage隐藏
  if (cameraCurrentPPS.value.postProcessStage) {
    cameraCurrentPPS.value.postProcessStage.enabled = false
  }
  // 7. 删除当前编辑设备的cameraEntityRed
  viewer.entities.removeById('cameraEntityRed')
  // 8. 删除当前编辑设备的debugCameraPrimitive
  viewer.scene.primitives._primitives.forEach(primitive => {
    if (primitive instanceof Cesium.DebugCameraPrimitive) {
      viewer.scene.primitives.remove(primitive)
    }
  })

  
  // 9. 新建一个video
  let videoEle = document.createElement('video')
  videoEle.setAttribute('muted', true)
  videoEle.setAttribute('loop', true)
  videoEle.setAttribute('autoplay', true)
  document.body.appendChild(videoEle)
  videoEle.style.cssText = 'position:absolute;left:0px;top:0px;width:320px;height:240px;display:none'

  /**
   * 当推流地址可以正常播放时，否则使用本地的test视频
   */
  if (Hls.isSupported()) {
    const hls = new Hls()
    hls.on(Hls.Events.ERROR, function (event, data) {
      // HLS 播放失败时设置回退
      if (data.fatal) {
        console.error(`HLS Error: ${data.type}`, data)
        
        // 如果是网络错误或重定向问题，切换到本地视频
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR || data.type === Hls.ErrorTypes.OTHER_ERROR) {
          console.warn('网络或其他错误，加载本地视频...')
          loadLocalVideo()
        }
      }
    })
    hls.loadSource(cameraCurrentEdit.value.videoUrl)
    hls.attachMedia(videoEle)
  } else if (videoEle.canPlayType('application/vnd.apple.mpegurl')) {
    videoEle.src = cameraCurrentEdit.value.videoUrl
    videoEle.addEventListener('error', function () {
      // Safari HLS 播放失败时回退
      console.warn('HLS 视频无法播放，加载本地视频...')
      loadLocalVideo()
    })
  } else {
    // 不支持 HLS 时直接使用本地视频
    console.warn('浏览器不支持 HLS，加载本地视频...')
    loadLocalVideo()
  }

  // 加载本地视频的通用方法
  function loadLocalVideo() {
    videoEle.src = "/lukou.mp4" // 替换为你的本地视频路径
    videoEle.play().catch(err => console.error('本地视频播放失败:', err))
  }

  /**
   * 显示摄像头位置和debugCameraPrimitive
   */
  videoEle.addEventListener('loadedmetadata', function () {
    const { camera, postProcessStage } = createVideo3D(viewer, videoEle, cameraCurrentEdit.value.id, cameraCurrentEdit.value.stanceOption)
    cameraCurrentPPS.value.camera = camera
    cameraCurrentPPS.value.postProcessStage = postProcessStage

    const debugCameraPrimitive = new Cesium.DebugCameraPrimitive({
      id: 'debugCameraPrimitive',
      camera: camera,
      color: Cesium.Color.RED,
      show: true
    })
    viewer.scene.primitives.add(debugCameraPrimitive)
    const position = Cesium.Cartesian3.fromDegrees(cameraCurrentEdit.value.stanceOption.position[0], cameraCurrentEdit.value.stanceOption.position[1], cameraCurrentEdit.value.stanceOption.position[2])
    viewer.entities.add({
      id: 'cameraEntityRed',
      position: position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
      },
      show: true,
    })

    // 隐藏camera-icon-...的entity
    viewer.entities.values.forEach(entity => {
      if (entity.id && entity.id.startsWith('camera-icon')) {
        entity.show = false
      }
    })
  })


  // 10. 弹出切换成功提示
  ElMessage.success('切换成功!')
}


function closeAndDestroyViewer() {
  props.cameraEditShow()
  viewer = null
}

onMounted(() => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0MGMyMWM0YS1lNDEyLTRjNWYtYTY3OS1jOTZkOWM1OThjYTEiLCJpZCI6MTkxMTMxLCJpYXQiOjE3MDU5MDY1ODN9.Tq3eObtuZJiqt4rDl-srQkMfz-WP9_EvKEPa_UvOI5s'

  viewer = new Cesium.Viewer('cesium-container', {
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

  // 当前编辑设备详情
  cameraCurrentEdit.value = JSON.parse(JSON.stringify(cameraList.value.find((item) => item.id === cameraEditID.value)))

  // 飞到数据对应位置
  const position = cameraCurrentEdit.value.stanceOption.position
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2] + 500),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
    duration: 1,
  })


  /**
   * 添加视频
   */
  let videoEle = document.createElement('video')
  videoEle.setAttribute('muted', true)
  videoEle.setAttribute('loop', true)
  videoEle.setAttribute('autoplay', true)
  document.body.appendChild(videoEle)
  videoEle.style.cssText = 'position:absolute;left:0px;top:0px;width:320px;height:240px;display:none'
  // videoEle.setAttribute("src", "/lukou.mp4")

  /**
   * 当推流地址可以正常播放时，否则使用本地的test视频
   */
  if (Hls.isSupported()) {
    const hls = new Hls()
    hls.on(Hls.Events.ERROR, function (event, data) {
      // HLS 播放失败时设置回退
      if (data.fatal) {
        console.error(`HLS Error: ${data.type}`, data)
        
        // 如果是网络错误或重定向问题，切换到本地视频
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR || data.type === Hls.ErrorTypes.OTHER_ERROR) {
          console.warn('网络或其他错误，加载本地视频...')
          loadLocalVideo()
        }
      }
    })
    hls.loadSource(cameraCurrentEdit.value.videoUrl)
    hls.attachMedia(videoEle)
  } else if (videoEle.canPlayType('application/vnd.apple.mpegurl')) {
    videoEle.src = cameraCurrentEdit.value.videoUrl
    videoEle.addEventListener('error', function () {
      // Safari HLS 播放失败时回退
      console.warn('HLS 视频无法播放，加载本地视频...')
      loadLocalVideo()
    })
  } else {
    // 不支持 HLS 时直接使用本地视频
    console.warn('浏览器不支持 HLS，加载本地视频...')
    loadLocalVideo()
  }

  // 加载本地视频的通用方法
  function loadLocalVideo() {
    videoEle.src = "/lukou.mp4" // 替换为你的本地视频路径
    videoEle.play().catch(err => console.error('本地视频播放失败:', err))
  }


  /**
   * 显示摄像头位置和debugCameraPrimitive
   */
  videoEle.addEventListener('loadedmetadata', function () {
    const { camera, postProcessStage } = createVideo3D(viewer, videoEle, cameraCurrentEdit.value.id, cameraCurrentEdit.value.stanceOption)
    cameraCurrentPPS.value.camera = camera
    cameraCurrentPPS.value.postProcessStage = postProcessStage

    const debugCameraPrimitive = new Cesium.DebugCameraPrimitive({
      id: 'debugCameraPrimitive',
      camera: camera,
      color: Cesium.Color.RED,
      show: true
    })
    viewer.scene.primitives.add(debugCameraPrimitive)
    const position = Cesium.Cartesian3.fromDegrees(cameraCurrentEdit.value.stanceOption.position[0], cameraCurrentEdit.value.stanceOption.position[1], cameraCurrentEdit.value.stanceOption.position[2])
    viewer.entities.add({
      id: 'cameraEntityRed',
      position: position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
      },
      show: true,
    })

    // 隐藏camera-icon-...的entity
    viewer.entities.values.forEach(entity => {
      if (entity.id && entity.id.startsWith('camera-icon')) {
        entity.show = false
      }
    })
  })


})
</script>

<style scoped lang="scss">
#cesium-container {
  height: 100%;
  width: 74%;
  z-index: 9;
}

.edit-panel {
  position: absolute;
  bottom: 0;
  right: 0;
  height: calc(100% - 65px);
  width: 26%;

  .cesium-right {
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    margin: 15px 5px 5px 15px;
    // background-color: red;

    .title {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 15px;
    }

    .change-menu {
      display: flex;
      justify-content: space-between;
      padding: 0 45px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 10px;

      .item {
        padding: 0 8px 4px 8px;

        &.active {
          color: green;
          border-bottom: 2px solid green;
        }
      }
    }

    .content {
      overflow-y: auto;
      max-height: calc(100% - 100px);
      padding-right: 5px;
      box-sizing: border-box;

      &.table {
        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 16px;
      }
    }
  }
}

.close-cross {
  position: absolute;
  top: 80px;
  right: 15px;
  z-index: 999;
  cursor: pointer;
}

:deep(.el-slider__input) {
  width: 90px !important;
}
:deep(.el-slider) {
  --el-slider-main-bg-color: rgb(27, 153, 97);
}
:deep(.column) {
  text-align: center;
}
</style>
