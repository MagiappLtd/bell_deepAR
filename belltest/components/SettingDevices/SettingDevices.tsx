import { useContext, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import styles from './SettingDevices.module.scss'

import DeviceSelects from '../DeviceSelects/DeviceSelects'
import micOff_white from '../../images/mic-off_white.png'
import mic50 from '../../images/mic_50_percent.png'
import camera_white from '../../images/video_white.png'
import cameraOff_white from '../../images/camera-off_white.png'
import userIcon from '../../images/user.png'
import { Device, Publisher } from 'opentok-react/types/opentok'
import { getDevices, isDesktopChrome } from '../../libs'
import {
  tmpAudioState,
  tmpVideoState,
  tmpMicDeviceIdState,
  tmpVideoDeviceIdState,
  tmpSpeakerDeviceIdState,
  speakerDeviceIdState,
  micDevicesState,
  videoDevicesState,
  speakerDevicesState,
} from '../../states/atoms'
import { PublisherObjContext } from '../../states/MainContextProvider'

export default function SettingDevices() {
  const { publisherObj } = useContext(PublisherObjContext)

  const setMicDevices = useSetRecoilState(micDevicesState)
  const setVideoDevices = useSetRecoilState(videoDevicesState)
  const setSpeakerDevices = useSetRecoilState(speakerDevicesState)
  const [tmpAudio, setTmpAudio] = useRecoilState(tmpAudioState)
  const [tmpVideo, setTmpVideo] = useRecoilState(tmpVideoState)
  const setTmpMicDeviceId = useSetRecoilState(tmpMicDeviceIdState)
  const setTmpVideoDeviceId = useSetRecoilState(tmpVideoDeviceIdState)
  const setTmpSpeakerDeviceId = useSetRecoilState(tmpSpeakerDeviceIdState)
  const speakerDeviceId = useRecoilValue(speakerDeviceIdState)

  const previewVideoElm = useRef<HTMLDivElement>(null!)

  // TODO: PrevSettingDevicesと同じなので共通化したい
  async function setUpDevicesData(publisherObj: Publisher) {
    // マイク
    await getDevices('audioInput').then((micDevicesData: Device[]) => {
      const publisherMicDevice = publisherObj.getAudioSource()
      const currentMicDevice = micDevicesData.find(
        (micDevice: Device) => micDevice.label === publisherMicDevice?.label
      )
      setTmpMicDeviceId(
        currentMicDevice
          ? currentMicDevice.deviceId
          : micDevicesData[0].deviceId
      )
      setMicDevices(micDevicesData)
    })

    //カメラ設定
    await getDevices('videoInput').then((videoDevicesData: Device[]) => {
      // @ts-ignore
      const publisherVideo = publisherObj.getVideoSource() // カメラはIDで比較する
      const currentVideoDevice = videoDevicesData.find(
        (cameraDevice: Device) =>
          cameraDevice.deviceId === publisherVideo.deviceId
      )
      setTmpVideoDeviceId(
        currentVideoDevice
          ? currentVideoDevice.deviceId
          : videoDevicesData[0].deviceId
      )
      setVideoDevices(videoDevicesData)
    })

    // スピーカー設定（PC Chromeのみ）
    if (isDesktopChrome()) {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const speakerDevices = devices.filter(
        (device) => device.kind === 'audiooutput'
      )
      setSpeakerDevices(speakerDevices)
      setTmpSpeakerDeviceId(
        speakerDeviceId === '' ? speakerDevices[0].deviceId : speakerDeviceId
      )
    }
  }

  // 関数内では最新のtmpVideoを参照してくれないので変数として渡す
  // 入室後プレビュー用にはアバター画像を用いる（ブラウザによってはエラーになるので）
  function previewAvatar(prevVideoPrm: boolean) {
    // 小ノード削除
    previewVideoElm.current.childNodes.forEach((_elm) => _elm.remove())

    // アバター作成（カメラオフの場合は真っ黒にする）
    const div = document.createElement('div')

    if (prevVideoPrm) {
      div.style.backgroundImage = `url(${userIcon})`
      div.style.backgroundSize = 'contain'
      div.style.backgroundPosition = 'center'
    } else {
      div.style.backgroundColor = 'black'
    }
    div.classList.add(styles.avatar)
    previewVideoElm.current.append(div)
  }

  useEffect(() => {
    setUpDevicesData(publisherObj!)
    previewAvatar(tmpVideo)
  }, [])

  return (
    <>
      <div className={styles.previewVideoSection}>
        <div
          id="previewVideo"
          className={styles.previewVideo}
          ref={previewVideoElm}
        ></div>
        <div className={`${styles.buttonWrapper}`}>
          <button
            type="button"
            onClick={() => setTmpAudio((prev: boolean) => !prev)}
          >
            {/* 音量は通話中のPublisherに依存しており、ミュート時では変化しないためマイクオン時にも画像を使っている */}
            {tmpAudio ? (
              <img src={mic50} alt="マイクオン" />
            ) : (
              <img src={micOff_white} alt="マイクオフ" />
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setTmpVideo((prev: boolean) => {
                previewAvatar(!prev)
                return !prev
              })
            }
          >
            {tmpVideo ? (
              <img src={camera_white} alt="カメラオン" />
            ) : (
              <img src={cameraOff_white} alt="カメラオフ" />
            )}
          </button>
        </div>
      </div>

      <DeviceSelects isSettingAfterEnter />
    </>
  )
}
