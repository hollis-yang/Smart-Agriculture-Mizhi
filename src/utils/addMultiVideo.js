import * as Cesium from 'cesium'
import httpInstance from '@/utils/http'

/**
 * axios获取camera配置信息
 */
export function getCameraConfig() {
  return httpInstance({
    url: '/getCamera',
  })
}

class CustomPrimitive {
  constructor(viewer, cameraID, stanceOption) {
    const { shadowMap, camera } = createShadowMap(
      viewer,
      cameraID,
      stanceOption
    )
    this.shadowMap = shadowMap
    this.camera = camera
  }

  isDestroyed() {
    return false
  }

  update(e) {
    e.shadowMaps.push(this.shadowMap)
  }
}

function createShadowMap(viewer, cameraID, stanceOption) {
  // 获得position
  let position = Cesium.Cartesian3.fromDegrees(
    stanceOption.position[0],
    stanceOption.position[1],
    stanceOption.position[2]
  )
  // 创建一个相机
  let camera = new Cesium.Camera(viewer.scene)
  // 设置相机的视角（方向）
  camera.setView({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(stanceOption.heading - 90),
      pitch: Cesium.Math.toRadians(stanceOption.pitch - 90),
      roll: Cesium.Math.toRadians(stanceOption.roll),
    },
  })
  camera.frustum = new Cesium.PerspectiveFrustum({
    fov: Cesium.Math.toRadians(stanceOption.fov),
    aspectRatio: stanceOption.aspectRatio,
    near: 0.01,
    far: stanceOption.distance,
  })

  let cameraPrimitive = new Cesium.DebugCameraPrimitive({
    camera: camera,
    color: Cesium.Color.RED,
    show: false,
  })
  // 绑定唯一的id用于pick拾取信息
  cameraPrimitive.id = cameraID

  viewer.scene.primitives.add(cameraPrimitive)
  viewer.entities.add({
    id: `camera-position-${cameraID}`,
    position: position,
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
    },
    show: false,
  })


  // 添加摄像头图标（也用于判断距离）
  // viewer.entities.add({
  //   id: `camera-icon-${cameraID}`,
  //   position: position,
  //   point: {
  //     pixelSize: 20,
  //     color: Cesium.Color.BLUE,
  //   },
  //   show: true,
  // })
  viewer.entities.add({
    id: `camera-icon-${cameraID}`,
    position: position,
    billboard: {
      image: './camera-icon-blue.png',
      width: 40,
      height: 40,
    },
    show: true,
  })

  let shadowMap = new Cesium.ShadowMap({
    lightCamera: camera,
    context: viewer.scene.context,
    isSpotLight: true,
    isPointLight: false,
    cascadesEnabled: false,
    darkness: 1,
  })

  // 返回 shadowMap 和 camera
  return { shadowMap, camera }
}

export function createVideo3D(viewer, videoEle, cameraID, stanceOption) {
  let primitive = new CustomPrimitive(viewer, cameraID, stanceOption)
  viewer.scene.primitives.add(primitive)

  const shadowMap = primitive.shadowMap
  const camera = primitive.camera // 获取 camera

  let fragmentShader = `
    uniform sampler2D colorTexture;
    varying vec2 v_textureCoordinates;
    uniform sampler2D depthTexture;

    uniform sampler2D shadowMap_texture;
    uniform sampler2D videoTexture;
    uniform mat4 shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
    uniform float opacity;

    float czm_shadowVisibility(sampler2D shadowMap, vec4 shadowPosition, float depthBias, float darkness) {
        vec2 uv = shadowPosition.xy;
        float depth = shadowPosition.z - depthBias;
        float shadowDepth = texture2D(shadowMap, uv).r;
        return (shadowDepth < depth) ? darkness : 1.0;
    }

    void main() {
        vec4 color = texture2D(colorTexture, v_textureCoordinates);
        gl_FragColor = color;

        float depth = czm_unpackDepth(texture2D(depthTexture, v_textureCoordinates));
        if (depth >= 1.0) {
            return;
        }

        vec4 positionEC = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
        vec3 normalEC = vec3(1.0, 0.0, 0.0);

        vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz);
        float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0);

        vec4 shadowPosition = shadowMap_matrix * positionEC;
        shadowPosition /= shadowPosition.w;

        if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) {
            return;
        }

        float visibility = czm_shadowVisibility(
            shadowMap_texture,
            shadowPosition,
            shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z,
            shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w
        );
        
      if (visibility == 1.0) {
          vec2 videoUV = vec2(1.0 - shadowPosition.x, 1.0 - shadowPosition.y); // XY轴同步镜像
          vec4 videoColor = texture2D(videoTexture, videoUV);
          
          // 内置羽化参数（与原opacity联动）
          float edgeRange = 0.05 + 0.1 * (1.0 - opacity); // 羽化范围与透明度反向关联
          float alphaFactor = 1.0;

          // X轴边缘羽化
          alphaFactor *= smoothstep(0.0, 1.0, 
              min(shadowPosition.x / edgeRange, 
                  (1.0 - shadowPosition.x) / edgeRange));
          
          // Y轴边缘羽化
          alphaFactor *= smoothstep(0.0, 1.0,
              min(shadowPosition.y / edgeRange,
                  (1.0 - shadowPosition.y) / edgeRange));
                  
          // 最终透明度计算
          videoColor.a = opacity * alphaFactor; 
          
          gl_FragColor = mix(color, videoColor, videoColor.a);
      }
    }
  `

  let videoTexture = new Cesium.Texture({
    context: viewer.scene.context,
    source: videoEle,
  })

  let bias = shadowMap._primitiveBias
  let scratchTexelStepSize = new Cesium.Cartesian2()
  let uniforms = {
    shadowMap_texture: function () {
      return shadowMap._shadowMapTexture
    },
    shadowMap_textureCube: function () {
      return shadowMap._shadowMapTexture
    },
    shadowMap_matrix: function () {
      return shadowMap._shadowMapMatrix
    },
    shadowMap_cascadeSplits: function () {
      return shadowMap._cascadeSplits
    },
    shadowMap_cascadeMatrices: function () {
      return shadowMap._cascadeMatrices
    },
    shadowMap_lightDirectionEC: function () {
      return shadowMap._lightDirectionEC
    },
    shadowMap_lightPositionEC: function () {
      return shadowMap._lightPositionEC
    },
    shadowMap_cascadeDistances: function () {
      return shadowMap._cascadeDistances
    },
    shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
      var texelStepSize = scratchTexelStepSize
      texelStepSize.x = 1.0 / shadowMap._textureSize.x
      texelStepSize.y = 1.0 / shadowMap._textureSize.y

      return Cesium.Cartesian4.fromElements(
        texelStepSize.x,
        texelStepSize.y,
        bias.depthBias,
        bias.normalShadingSmooth,
        this.combinedUniforms1
      )
    },
    shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
      return Cesium.Cartesian4.fromElements(
        bias.normalOffsetScale,
        shadowMap._distance,
        shadowMap.maximumDistance,
        shadowMap._darkness,
        this.combinedUniforms2
      )
    },

    videoTexture: function () {
      return Cesium.Texture.create({
        context: viewer.scene.context,
        source: videoEle,
        pixelFormat: Cesium.PixelFormat.RGBA,
        pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
      })
    },
    combinedUniforms1: new Cesium.Cartesian4(),
    combinedUniforms2: new Cesium.Cartesian4(),
  }

  let postProcessStage = new Cesium.PostProcessStage({
    fragmentShader: fragmentShader,
    uniforms: {
      ...uniforms,
      opacity: stanceOption.opacity, // 初始化为摄像头配置中的opacity
    },
  })

  viewer.scene.postProcessStages.add(postProcessStage)

  // 返回 camera
  return { camera, postProcessStage }
}
