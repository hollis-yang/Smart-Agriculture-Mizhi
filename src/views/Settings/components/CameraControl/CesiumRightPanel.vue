<template>
  <!-- 当前设备详情-->
  <div class="current-device" v-if="cameraCurrentEditData">
    <!-- 基本信息 -->
    <div class="section basic-info">
      <div class="title">
        <el-icon><CaretBottom /></el-icon>
        <div>基本信息</div>
      </div>
      <div class="item name">
        <div class="left">名称：</div>
        <el-input
          v-model="cameraCurrentEditData.stanceOption.name"
          class="right"></el-input>
      </div>
      <div class="item id">
        <div class="left">序列号：</div>
        <el-input
          v-model="cameraCurrentEditData.stanceOption.id"
          disabled
          class="right"></el-input>
      </div>
      <div class="item status">
        <div class="left">设备状态：</div>
        <el-select v-model="statusLabel" class="right">
          <el-option
            v-for="item in ['正常', '异常']"
            :key="item"
            :label="item"
            :value="item" />
        </el-select>
      </div>
      <div class="item hls">
        <div class="left">推流地址：</div>
        <el-input
          v-model="cameraCurrentEditData.videoUrl"
          class="right"></el-input>
      </div>
      <div class="item frustum">
        <div class="left">视锥体显示：</div>
        <el-switch
          v-model="cameraCurrentShowFrustum"
          class="right"
          style="--el-switch-on-color: green;"></el-switch>
      </div>
      <div class="item fusion">
        <div class="left">融合区显示：</div>
        <el-switch
          v-model="cameraCurrentEditData.stanceOption.show"
          class="right"
          style="--el-switch-on-color: green;"></el-switch>
      </div>
    </div>
    <!-- 坐标信息 -->
    <div class="section coord-info">
      <div class="title">
        <el-icon><CaretBottom /></el-icon>
        <div>坐标信息</div>
      </div>
      <div class="item coord">
        <div class="left">经度：</div>
        <!-- <el-input
          v-model="cameraCurrentEditData.stanceOption.position[0]"
          :formatter="(value) => `${value}°E`"
          :parser="(value) => value.replace(/\s?°E/g, '')"
          class="right"></el-input> -->
        <div class="right">
          {{ cameraCurrentEditData.stanceOption.position[0] }}°E
        </div>
      </div>
      <div class="item coord">
        <div class="left">纬度：</div>
        <!-- <el-input
          v-model="cameraCurrentEditData.stanceOption.position[1]"
          :formatter="(value) => `${value}°N`"
          :parser="(value) => value.replace(/\s?°N/g, '')"
          class="right"></el-input> -->
        <div class="right">
          {{ cameraCurrentEditData.stanceOption.position[1] }}°N
        </div>
      </div>
      <div class="item coord">
        <div class="left">高程：</div>
        <!-- <el-input
          v-model="cameraCurrentEditData.stanceOption.position[2]"
          :formatter="(value) => `${value}m`"
          :parser="(value) => value.replace(/\s?m/g, '')"
          class="right"></el-input> -->
        <div class="right">
          {{ cameraCurrentEditData.stanceOption.position[2] }}m
        </div>
      </div>
      <div class="item" style="margin-top: 8px;">
        <div class="left">经纬度调整：</div>
        <div class="right">
          <el-button
            v-for="item in lnglatDirection"
            :key="item[0]"
            type="primary"
            circle
            :icon="item[1]"
            color="rgb(27, 153, 97)"
            @click="updateCameraPositionByStep(item[0], cameraMoveDistance)" />
        </div>
      </div>
      <div class="item" style="margin-top: 8px;">
        <div class="left">高程调整：</div>
        <div class="right">
          <el-button
            v-for="item in heightDirection"
            :key="item[0]"
            type="primary"
            circle
            :icon="item[1]"
            color="rgb(27, 153, 97)"
            @click="updateCameraPositionByStep(item[0], cameraMoveDistance)" />
        </div>
      </div>
      <div class="item" style="margin-top: 8px;">
        <div class="left">调整步长：</div>
        <div class="right">
          <el-input-number v-model="cameraMoveDistance">
            <template #suffix>
              <span>m</span>
            </template>
          </el-input-number>
        </div>
      </div>
    </div>
    <!-- 姿态信息 -->
    <div class="section posi-info">
      <div class="title">
        <el-icon><CaretBottom /></el-icon>
        <div>姿态信息</div>
      </div>
      <div
        v-for="(value, key) in stanceList"
        class="item"
        style="margin-bottom: 10px;">
        <div class="left">{{ stanceOptionCN[key] }}</div>
        <el-slider
          v-model="cameraCurrentEditData.stanceOption[key]"
          show-input
          size="small"
          :min="value[0]"
          :max="value[1]"
          :step="value[2]"
          class="right"></el-slider>
      </div>
    </div>
    <div class="section btns">
      <el-button
        type="primary"
        color="rgb(27, 153, 97)"
        @click="restoreToOriginal('manual')"
        >复原</el-button
      >
      <el-button
        type="primary"
        color="rgb(27, 153, 97)"
        @click="updateCameraList"
        >更新</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, triggerRef, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import { Top, Bottom, Right, Back, CaretTop, CaretBottom, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps(['cameraCurrentEdit', 'cameraList', 'updateCameraCurrentEdit', 'updateCameraCurrentShowFrustum', 'updateCameraList'])
const cameraCurrentEditData = ref(props.cameraCurrentEdit)  // 当前编辑设备详情
watch(() => props.cameraCurrentEdit, (newVal) => {
  cameraCurrentEditData.value = newVal
}, { deep: true })

/**
 * cameraCurrentEdit变化时
 * 1.需要改变statusLabel
 * 2.将新的currentEdit传给父组件用于更新Cesium
 */
watch(() => cameraCurrentEditData.value, (newVal) => {
  props.updateCameraCurrentEdit(newVal)

  statusLabel.value = newVal.status === 1 ? '正常' : '异常'
}, { deep: true })


const cameraCurrentShowFrustum = ref(true)  // 当前编辑设备是否显示视锥体
// 是否显示视锥体变化时，通知父组件更新Cesium
watch(() => cameraCurrentShowFrustum.value, (newVal) => {
  props.updateCameraCurrentShowFrustum(newVal)
}, {deep: true})


const statusLabel = ref(cameraCurrentEditData.value.status === 1 ? '正常' : '异常')  // 当前编辑设备状态
watch(() => statusLabel.value, (newVal) => {
  statusLabel.value = newVal
  // 更新到cameraCurrentEditData
  cameraCurrentEditData.value.status = newVal === '正常' ? 1 : 0
})

const cameraMoveDistance = ref(5)  // 摄像头移动步长
const lnglatDirection = [['north', Top], ['south', Bottom], ['west', Back], ['east', Right]]
const heightDirection = [['up', CaretTop], ['down', CaretBottom]]

// 摄像头参数最大最小值
const stanceList = {
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


/**
 * 以固定步长调节摄像头坐标（本质是改变cameraCurrentEdit）
 */
function updateCameraPositionByStep(direction, distance) {
  const [lon, lat, height] = cameraCurrentEditData.value.stanceOption.position

  // 处理上下移动（高程）
  if (direction === 'up' || direction === 'down') {
    const movement = Number(distance * (direction === 'up' ? 1 : -1).toFixed(6))
    cameraCurrentEditData.value.stanceOption.position[2] += movement
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
  cameraCurrentEditData.value.stanceOption.position = [newLon, newLat, cameraCurrentEditData.value.stanceOption.position[2]]
}

/**
 * 复原按钮
 */
function restoreToOriginal(type) {
  // 默认将视锥体显示
  cameraCurrentShowFrustum.value = true
  props.updateCameraCurrentShowFrustum(true)

  // 从cameraList中找到当前编辑设备的原始数据
  const original = props.cameraList.find(item => item.id === cameraCurrentEditData.value.id)

  // 如果没有子项变化，不需要调用复原
  if (JSON.stringify(cameraCurrentEditData.value) === JSON.stringify(original)) {
    if (type === 'manual') {
      ElMessage.warning('未修改任何参数!')
    }
    return
  }

  cameraCurrentEditData.value = JSON.parse(JSON.stringify(original))
  props.updateCameraCurrentEdit(cameraCurrentEditData.value)

  // 更新状态标签
  statusLabel.value = original.status === 1 ? '正常' : '异常'

  // ElMessage提示复原成功
  if (type === 'manual') {
    ElMessage.success('复原成功!')
  } else if (type === 'auto') {
    ElMessage.success('已自动复原未更新参数!')
  }
}


/**
 * 更新按钮
 */
async function updateCameraList() {
  // 从cameraList中找到当前编辑设备的原始数据
  const original = props.cameraList.find(item => item.id === cameraCurrentEditData.value.id)

  // 如果没有子项变化，不需要调用更新
  // 1. cameraCurrentEditData, 2. statusLabel
  if (JSON.stringify(cameraCurrentEditData.value) === JSON.stringify(original)) {
    ElMessage.warning('未修改任何参数!')
    return
  }

  // 更新cameraList
  const index = props.cameraList.findIndex(item => item.id === cameraCurrentEditData.value.id)
  props.cameraList[index] = cameraCurrentEditData.value
  // 更新status
  props.cameraList[index].status = statusLabel.value === '正常' ? 1 : 0

  // 更新到数据库
  try {
    let data = {
      status: props.cameraList[index].status,
      hls: props.cameraList[index].videoUrl,
      ...props.cameraList[index].stanceOption
    }
    const res = await axios.post('http://47.117.71.69:8989/updateCamera', data)
    console.log(res)
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败!')
    return
  }

  // ElMessage提示更新成功
  ElMessage.success('更新成功!')
}

onMounted(() => {
  console.log('onMounted CesiumRightPanel')
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount CesiumRightPanel')
  restoreToOriginal('auto')
})
</script>

<style lang="scss" scoped>
.current-device {
  .section {
    margin-bottom: 3.5vh;

    &:last-child {
      margin-bottom: 0;
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;

      display: flex;
      align-items: center;

      div {
        margin-left: 5px;
      }
    }

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      margin-bottom: 3px;

      .left {
        flex: 3.5;
      }

      .right {
        flex: 6.5;
      }

      &.coord {
        margin-bottom: 10px;
      }
    }
  }

  .btns {
    margin-top: 20px;
  }
}

input[aria-hidden=true] {
  display: none !important;
}
</style>
