import { Device } from 'opentok-react/types/opentok.js'
import { Publisher, Subscriber } from 'opentok-react/types/opentok'
import { detect } from 'detect-browser'
import { UserType } from '../enums/UserType'

// 一部のiPadを判定するために条件が多少複雑
export function isIOS() {
  const ua = navigator.userAgent.toLowerCase()
  return /ipod|ipad|iphone|macintosh/.test(ua) && 'ontouchend' in document
}

export function isMobilePhone() {
  const browser = detect()
  return (
    isIOS() ||
    browser?.os === 'Android OS' ||
    window.matchMedia('only screen and (max-width: 480px)').matches // iOSでもAndroidでもない場合は画面幅でSPかどうか判定
  )
}

export function isIOSSafari() {
  const browser = detect()
  return isIOS() && browser && /ios|safari/.test(browser.name)
}

export function isDesktopChrome() {
  const browser = detect()
  return !isMobilePhone() && browser?.name === 'chrome'
}

// iOS Safariかつカメラが2つ以外の時はビデオselectタグ非表示（※エラーになるので）
export function displayVideoSelect(videoDevices: Device[]): boolean {
  return !(isIOSSafari() && videoDevices.length !== 2)
}

export function getDevices(kind = 'all'): Promise<Device[]> {
  return new Promise<Device[]>((resolve, reject) => {
    OT.getDevices((error, devices) => {
      if (error) return reject(error)
      devices = devices.filter(
        (device) => device.kind === kind || kind === 'all'
      )
      return resolve(devices)
    })
  })
}

// 画面共有できるか判定
export function getScreenShareCapability(): Promise<void> {
  const PUB_SCREEN_ERROR_CODES = {
    accessDenied: 1500,
    extNotInstalled: 'OT0001',
    extNotRegistered: 'OT0002',
    notSupported: 'OT0003',
    errPublishingScreen: 'OT0004',
  }

  return new Promise<void>((resolve, reject) => {
    OT.checkScreenSharingCapability((response) => {
      if (!response.supported) {
        reject({
          code: PUB_SCREEN_ERROR_CODES.notSupported,
          message: '画面共有に未対応のブラウザです。',
        })
      } else if (response.extensionRegistered === false) {
        reject({
          code: PUB_SCREEN_ERROR_CODES.extNotRegistered,
          message: '画面共有に未対応のブラウザです。',
        })
      } else if (
        response.extensionRequired !== undefined &&
        response.extensionInstalled === false
      ) {
        reject({
          code: PUB_SCREEN_ERROR_CODES.extNotInstalled,
          message: '画面共有に必要な拡張機能をインストールしてください。',
        })
      } else {
        resolve()
      }
    })
  })
}

// 引数で渡されたビデオオブジェクトをメインビデオからを削除
export function removeMainVideo(mainVideoObj: Publisher | Subscriber) {
  mainVideoObj.element!.style.width = `${getWidthByDevice()}px`
  mainVideoObj.element!.style.height = `${getHeightByDevice()}px`
  mainVideoObj.element!.style.position = 'static'
  mainVideoObj.element!.style.transform = 'none'

  const mainVideoElm = document.getElementById(mainVideoObj.stream.streamId)!
  mainVideoElm.style.marginBottom = '25px'
  mainVideoElm.remove()
  document.getElementById('subVideos')?.appendChild(mainVideoElm)
}

/**
 * @param mainVideoObj [置き換え前のビデオ]
 * @param targetVideoObj [置き換え予定のビデオ]
 */
export function replaceMainVideo(
  mainVideoObj: Publisher | Subscriber | null,
  targetVideoObj: Publisher | Subscriber
): void {
  if (mainVideoObj == targetVideoObj) {
    return
  }

  const targetVideoElm = document.getElementById(targetVideoObj.stream.streamId)

  if (!targetVideoElm || !targetVideoObj.element) {
    return alert('エラーが発生しました') // TODO: 例外発生させてもいいかも
  }

  // サブビデオ => メインビデオ処理
  // サブビデオの縦横比を維持するため、端末によって表示を切り替える
  if (isMobilePhone()) {
    targetVideoObj.element.style.width = '100vw'
    targetVideoObj.element.style.height = `${Math.round(
      (innerWidth * getHeightByDevice()) / getWidthByDevice()
    )}px`
    targetVideoObj.element.style.position = 'absolute'
    targetVideoObj.element.style.top = ' 40vh'
    targetVideoObj.element.style.transform = 'translateY(-50%)'
  } else {
    targetVideoObj.element.style.height = '100vh'
    targetVideoObj.element.style.width = `${Math.round(
      (innerHeight * getWidthByDevice()) / getHeightByDevice()
    )}px`
    targetVideoObj.element.style.position = 'relative'
    targetVideoObj.element.style.marginRight = 'auto'
    targetVideoObj.element.style.marginLeft = 'auto'
  }

  targetVideoElm.style.marginBottom = '0'
  targetVideoElm.remove()
  document.getElementById('mainVideo')?.appendChild(targetVideoElm)

  // メインビデオがある場合は、メインビデオ => サブビデオリストの末尾へ移動処理
  if (mainVideoObj && mainVideoObj.element) {
    if (mainVideoObj.stream.videoType === 'screen') {
      // 画面共有がメインビデオの場合
      return removeSharingMainVideo(mainVideoObj as Publisher)
    }

    removeMainVideo(mainVideoObj)
  }
}

// 画面共有 => 任意のビデオオブジェクトに置き換え
export function removeSharingMainVideo(sharingVideoObj: Publisher) {
  sharingVideoObj.element!.style.width = `${getWidthByDevice()}px`
  sharingVideoObj.element!.style.height = `${getHeightByDevice()}px`
  sharingVideoObj.element!.style.position = 'static'
  sharingVideoObj.element!.style.transform = 'none'

  const mainVideoElm = document.getElementById(sharingVideoObj.stream.streamId)!
  mainVideoElm.style.marginBottom = '25px'
  mainVideoElm.getElementsByTagName('video')[0].style.position = 'static'
  // @ts-ignore （なぜかエラーが発生する）
  mainVideoElm.getElementsByClassName('OT_widget-container')[0].style.position =
    'static'

  mainVideoElm.remove()
  document.getElementById('subVideos')?.appendChild(mainVideoElm)
}

// デバイス(スマホ or PC)によってビデオの幅を切り替える
export function getWidthByDevice(): number {
  return isMobilePhone() ? 150 : 225
}

export function getHeightByDevice(): number {
  return isMobilePhone() ? 100 : 150
}

// デバイス(スマホ or PC)によって入室前プレビュー画面の幅を切り替える
export function getPreviewWidthByDevice() {
  return isMobilePhone() ? '160px' : '210px'
}

export function getPreviewHeightByDevice() {
  return isMobilePhone() ? '100px' : '135px'
}

/**
 * 外<=>内カメラとミラーリングON/OFFの切り替えを行う
 * @param publisherObj
 * @param newDeviceId [切り替え先のdeviceId（指定あれば）]
 */
export async function switchCamera(
  publisherObj: Publisher,
  newDeviceId?: string
): Promise<void> {
  if (isIOSSafari()) {
    return switchCameraForIOS(publisherObj)
  }

  const videoDevices = await getDevices('videoInput')
  const videoTag = document
    .getElementById(publisherObj.id)!
    .getElementsByTagName('video')[0]

  // @ts-ignore
  const publisherVideo = publisherObj.getVideoSource() // カメラはIDで比較する
  const currentCamera = videoDevices.find(
    (cameraDevice) => cameraDevice.deviceId === publisherVideo.deviceId
  )!

  // 内 => 外の場合
  if (isInnerCameraName(currentCamera.label)) {
    const newOutCamera = videoDevices.find(
      (cameraDevice) => !isInnerCameraName(cameraDevice.label)
    )!

    // @ts-ignore
    await publisherObj.setVideoSource(newDeviceId || newOutCamera.deviceId)
    videoTag.style.transform = 'none'
    return
  }

  // 外 => 内の場合
  const newInCamera = videoDevices.find((cameraDevice: Device) =>
    isInnerCameraName(cameraDevice.label)
  )!

  // @ts-ignore
  await publisherObj.setVideoSource(newDeviceId || newInCamera.deviceId)
  videoTag.style.transform = 'scale(-1, 1)'
}

// iOS Safariにおける外<=>内カメラとミラーリングON/OFFの切り替え
// ※バージョンによってはsetVideoSource()が使えないため分けている
export async function switchCameraForIOS(
  publisherObj: Publisher
): Promise<void> {
  const videoDevices = await getDevices('videoInput')

  // 内外以外のカメラがある場合はミラーリングの不整合が起こるのでカメラ切り替えのみ行う
  if (videoDevices.length !== 2) {
    return publisherObj.cycleVideo()
  }

  // カメラ切り替え
  await publisherObj.cycleVideo()

  // @ts-ignore
  const cameraDeviceId: string = publisherObj.getVideoSource().deviceId

  const targetVideo = videoDevices.find(
    (_video) => _video.deviceId === cameraDeviceId
  )

  // ミラーリング切り替え
  document
    .getElementById(publisherObj.id)!
    .getElementsByTagName('video')[0].style.transform = isInnerCameraName(
    targetVideo!.label
  )
    ? 'scale(-1, 1)'
    : 'none'
}

// Publisher(自分自身)がメインビデオか
export function isPublisherMainVideo(
  publisherObj: Publisher | null,
  mainVideoObj: Publisher | Subscriber | null
): boolean {
  if (
    !publisherObj ||
    !mainVideoObj ||
    !publisherObj.stream ||
    !mainVideoObj.stream
  ) {
    return false
  }

  return mainVideoObj.stream.streamId === publisherObj.stream.streamId
}

// スピーカー設定を全ての参加者(video)に反映(PC Chromeのみ)
export function reflectSpeakerSetting(speakerDeviceId: string): void {
  if (!isDesktopChrome()) {
    return
  }

  Promise.all(
    Array.from(document.getElementsByTagName('video')).map(
      // @ts-ignore setSinkIdが未定義
      async (elm) => await elm.setSinkId(speakerDeviceId)
    )
  )
}

export function isInnerCameraName(cameraName: string) {
  return !!cameraName.match(/内面|前面|内側|inner|inside|front/)
}

// 画面縦幅より小さいか？
export function isOverInnerHeight(elm: HTMLElement): boolean {
  return elm.clientHeight > innerHeight
}

export function getAndroidVersion(): number {
  const ua = navigator.userAgent
  if (ua.indexOf('Android') > 0) {
    const version = parseFloat(ua.slice(ua.indexOf('Android') + 8))
    return version
  }

  return 0 // アンドロイド以外は0を返す
}

// 通話から退出 => サンクスページ移動
export function leaveFromSession(
  publisherObj: Publisher,
  userType: UserType
): void {
  publisherObj.session.disconnect()
  // 退出後の判定に使うため、一時的にローカルストレージに保存
  localStorage.setItem('userType', userType)
  window.location.href = '/thanks'
}

// iOS 15以上の不具合（音量が小さい）対応用に音量を上げる（iPhoneかつ ios 15以上のみ）
export function connectToSpeakerForIOS15(
  remoteAudioStream: MediaStream,
  gain: number
): void {
  if (!isIOSSafari() || navigator.userAgent.indexOf('Version/15.') === -1) {
    return
  }

  // @ts-ignore
  window.AudioContext = AudioContext || webkitAudioContext
  const context = new AudioContext()

  const audioNode = context.createMediaStreamSource(remoteAudioStream)
  const gainNode: GainNode = context.createGain()
  gainNode.gain.value = gain
  audioNode.connect(gainNode)
  gainNode.connect(context.destination)
}
