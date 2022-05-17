import { useEffect, useRef, useContext } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import styles from './PrevSettingDevices.module.scss'

import DeviceSelects from '../DeviceSelects/DeviceSelects'
import MicVolume from '../MicVolume/MicVolume'

import micOff_white from '../../images/mic-off_white.png'
import camera_white from '../../images/video_white.png'
import cameraOff_white from '../../images/camera-off_white.png'
import { Device, Publisher } from 'opentok-react/types/opentok'
import { PreviewPublisherObjContext } from '../../states/PreviewContextProvicer'
import {
  getDevices,
  isDesktopChrome,
  getPreviewHeightByDevice,
  getPreviewWidthByDevice,
} from '../../libs'
import {
  tmpAudioState,
  tmpVideoState,
  tmpMicDeviceIdState,
  tmpVideoDeviceIdState,
  tmpSpeakerDeviceIdState,
  speakerDeviceIdState,
  isInnerCameraState,
  micDevicesState,
  videoDevicesState,
  speakerDevicesState,
  isPreviewLoadedState,
  errorState,
} from '../../states/atoms'

export default function PrevSettingDevices() {
  const { previewPublisherObj, setPreviewPublisherObj } = useContext(
    PreviewPublisherObjContext
  )

  const [micDevices, setMicDevices] = useRecoilState(micDevicesState)
  const setVideoDevices = useSetRecoilState(videoDevicesState)
  const setSpeakerDevices = useSetRecoilState(speakerDevicesState)
  const [isPreviewLoaded, setIsPreviewLoaded] =
    useRecoilState(isPreviewLoadedState)
  const [tmpAudio, setTmpAudio] = useRecoilState(tmpAudioState)
  const [tmpVideo, setTmpVideo] = useRecoilState(tmpVideoState)
  const setTmpMicDeviceId = useSetRecoilState(tmpMicDeviceIdState)
  const setTmpVideoDeviceId = useSetRecoilState(tmpVideoDeviceIdState)
  const setTmpSpeakerDeviceId = useSetRecoilState(tmpSpeakerDeviceIdState)
  const setError = useSetRecoilState(errorState)
  const speakerDeviceId = useRecoilValue(speakerDeviceIdState)
  const isInnerCamera = useRecoilValue(isInnerCameraState)

  const previewVideoElm = useRef<HTMLDivElement>(null!)

  // TODO: SettingDevicesとほぼ同じなので共通化したい
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

  // 関数内では最新のtmpAudio. tmpVideoを参照してくれないので変数として渡す
  function previewTmpPublisher(prevAudioPrm: boolean, prevVideoPrm: boolean) {
    if (!previewVideoElm.current) {
      return // DOM描画後に埋め込み処理
    }

    const initPublisher = OT.initPublisher(
      previewVideoElm.current as HTMLElement,
      {
        audioBitrate: 6000, // 最低値
        publishAudio: prevAudioPrm,
        publishVideo: prevVideoPrm,
        videoSource: true,
        facingMode: isInnerCamera ? 'user' : 'environment',
        mirror: isInnerCamera,
        fitMode: 'cover',
        insertMode: 'append',
        width: getPreviewWidthByDevice(),
        height: getPreviewHeightByDevice(),
        style: {
          audioLevelDisplayMode: 'auto', // 音声の大きさ表示
          archiveStatusDisplayMode: 'off', // （未検証）通話録画時にその旨を表示
          buttonDisplayMode: 'off', // 自分の音声切り替えボタンを非表示
        },
      },
      (err) => !err || setError(err.name) // エラーがあればセット
    )
    setPreviewPublisherObj(initPublisher)
    // videoElementが作られてから、デバイス獲得処理を行い、そしてデバイスのセレクトボックスをレンダーさせるため
    initPublisher.on('videoElementCreated', async () => {
      // デバイス情報が未取得の場合のみ実行
      if (micDevices.length === 0) {
        await setUpDevicesData(initPublisher)
      }
      // 少し時間を置かないと入室後にエラーになる
      setTimeout(() => setIsPreviewLoaded(true), 700)
    })
  }

  useEffect(() => {
    setIsPreviewLoaded(false)
    previewPublisherObj?.destroy()
    previewTmpPublisher(tmpAudio, tmpVideo)
  }, [isInnerCamera])

  return (
    <>
      <div className={styles.previewVideoSection}>
        <div
          id="previewVideo"
          className={styles.previewVideo}
          ref={previewVideoElm}
        ></div>
        {previewVideoElm.current && (
          // プレビュー画面が読み込まれてから表示
          <div
            className={`${styles.buttonWrapper}`}
            style={{
              display: isPreviewLoaded ? 'block' : 'none',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsPreviewLoaded(false)
                previewPublisherObj?.destroy()
                setTmpAudio((prev: boolean) => {
                  previewTmpPublisher(!prev, tmpVideo)
                  return !prev
                })
              }}
            >
              {tmpAudio ? (
                <MicVolume videoObj={previewPublisherObj!} />
              ) : (
                <img src={micOff_white} alt="マイクオフ" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPreviewLoaded(false)
                previewPublisherObj?.destroy()
                setTmpVideo((prev: boolean) => {
                  previewTmpPublisher(tmpAudio, !prev)
                  return !prev
                })
              }}
            >
              {tmpVideo ? (
                <img src={camera_white} alt="カメラオン" />
              ) : (
                <img src={cameraOff_white} alt="カメラオフ" />
              )}
            </button>
          </div>
        )}
      </div>

      <DeviceSelects />
    </>
  )
}
