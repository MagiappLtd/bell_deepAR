import { useEffect } from 'react'
import { Device } from 'opentok-react/types/opentok.js'
import Modal from 'react-modal'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'

import {
  displayVideoSelect,
  getAndroidVersion,
  getDevices,
  isDesktopChrome,
  isInnerCameraName,
  isIOSSafari,
  isMobilePhone,
  reflectSpeakerSetting,
  switchCamera,
} from '../../libs/index'
import styles from './SettingModal.module.scss'
import SettingDevices from '../SettingDevices/SettingDevices'
import { useContext } from 'react'
import { PublisherObjContext } from '../../states/MainContextProvider'
import {
  tmpAudioState,
  tmpMicDeviceIdState,
  tmpVideoState,
  tmpVideoDeviceIdState,
  tmpSpeakerDeviceIdState,
  audioState,
  videoState,
  speakerDeviceIdState,
  isInnerCameraState,
  showModalState,
  canEnterState,
} from '../../states/atoms'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function SettingModal() {
  const { publisherObj } = useContext(PublisherObjContext)

  const [tmpAudio, setTmpAudio] = useRecoilState(tmpAudioState)
  const [tmpVideo, setTmpVideo] = useRecoilState(tmpVideoState)
  const [showModal, setShowModal] = useRecoilState(showModalState)
  const [audio, setAudio] = useRecoilState(audioState)
  const [video, setVideo] = useRecoilState(videoState)
  const tmpMicDeviceId = useRecoilValue(tmpMicDeviceIdState)
  const tmpVideoDeviceId = useRecoilValue(tmpVideoDeviceIdState)
  const tmpSpeakerDeviceId = useRecoilValue(tmpSpeakerDeviceIdState)
  const canEnter = useRecoilValue(canEnterState)
  const setSpeakerDeviceId = useSetRecoilState(speakerDeviceIdState)
  const [isInnerCamera, setIsInnerCamera] = useRecoilState(isInnerCameraState)

  async function setUpInnerCameraInfo(videoDeviceId: string) {
    const videoDevices = await getDevices('videoInput')
    const cameraName = videoDevices.find(({ deviceId }: Device) => {
      return videoDeviceId === deviceId
    })

    setIsInnerCamera(isInnerCameraName(cameraName!.label))
  }

  // スマホのカメラ切り替えはミラーリング切り替えを伴うので処理を分ける
  async function setVideoSourceForSP() {
    // @ts-ignore (切り替え前のカメラの内外判定をするために取得: targetVideo)
    const currentVideoId = publisherObj.getVideoSource().deviceId as string
    const videoDevices = await getDevices('videoInput')
    const targetVideo = videoDevices.find(
      (_device) => _device.deviceId === currentVideoId
    )!

    // ※カメラの選択値が内<=>外に変化した場合
    if (isInnerCameraName(targetVideo.label) !== isInnerCamera) {
      await switchCamera(publisherObj!)
    }

    // 内<=>外は変わらないが、カメラ自体に変化があった場合(Androidのみ)
    if (!isIOSSafari() && currentVideoId !== tmpVideoDeviceId) {
      // @ts-ignore
      await publisherObj.setVideoSource(tmpVideoDeviceId)
    }
  }

  // 入室前初期設定が反映（このコンポーネントは入室後即レンダリングされることを利用）
  useEffect(() => {
    if (!canEnter) {
      return // canEnterがtrueになってから発火することで入室後の処理エラーを防止
    }

    setAudio(tmpAudio)
    ;(async () => {
      // マイク設定(PC, Android9以上のみ設定可能)
      if (!isMobilePhone() || getAndroidVersion() >= 9) {
        publisherObj!.setAudioSource(tmpMicDeviceId)
      }

      // スピーカー設定（PC Chromeのみ）
      if (isDesktopChrome()) {
        setSpeakerDeviceId(tmpSpeakerDeviceId)
      }

      // ビデオ設定
      try {
        if (isMobilePhone()) {
          await setVideoSourceForSP()
        } else {
          // @ts-ignore
          await publisherObj.setVideoSource(tmpVideoDeviceId)
        }
      } catch {
        alert('カメラの切り替えに失敗しました。')
      }

      await setUpInnerCameraInfo(tmpVideoDeviceId)
    })()
  }, [canEnter])

  // 設定画面用のtempAudioとtempVideoに、通話全体に適用中のaudioとvideoの値を反映
  useEffect(() => {
    // 入室後に制御してる理由は入室待ち時は強制的に音声OFFになり、それを検知するのを防ぐため
    if (canEnter) {
      setTmpAudio(audio)
      setTmpVideo(video)
    }
  }, [audio, video, showModal])

  async function setDevices(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    // @ts-ignore ボタン押下は一度のみ
    event.target.disabled = true

    // マイク設定(PC, Android9以上のみ設定可能)
    if (!isMobilePhone() || getAndroidVersion() >= 9) {
      publisherObj!.setAudioSource(tmpMicDeviceId)
    }

    // スピーカー設定（PC Chromeのみ）
    if (isDesktopChrome()) {
      reflectSpeakerSetting(tmpSpeakerDeviceId)
      setSpeakerDeviceId(tmpSpeakerDeviceId)
    }

    // ここからビデオ設定
    // ビデオselectタグ非表示の場合はここで処理を終える
    const videoDevices = await getDevices('videoInput')
    if (!displayVideoSelect(videoDevices)) {
      return setShowModal(false)
    }

    try {
      if (isMobilePhone()) {
        await setVideoSourceForSP()
      } else {
        // @ts-ignore
        await publisherObj.setVideoSource(tmpVideoDeviceId)
      }
    } catch {
      alert('カメラの切り替えに失敗しました。')
    }

    setShowModal(false)

    // !!この場所で実行しないとエラーになる!!
    // 音声設定
    setAudio(tmpAudio)
    // ビデオ設定
    setVideo(tmpVideo)
  }

  return (
    <Modal
      ariaHideApp={true}
      isOpen={showModal}
      onRequestClose={() => setShowModal(false)}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
    >
      <p className="text-center mb-20" style={{ fontSize: '20px' }}>
        設定
      </p>

      <SettingDevices />

      <button
        type="button"
        className={`bell-button ${styles.button}`}
        onClick={(event) => setDevices(event)}
      >
        完了
      </button>
    </Modal>
  )
}
