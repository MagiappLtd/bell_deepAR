import { useState, useRef, useContext } from 'react'
import { OTPublisher, OTPublisherRef } from 'opentok-react'
import { Publisher, Error } from 'opentok-react/types/opentok'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import { useLatest } from 'react-use'
import CallInfo from '../CallInfo/CallInfo'

// import styles from './PublisherVideo.module.scss'

import {
  replaceMainVideo,
  getWidthByDevice,
  getHeightByDevice,
} from '../../libs/index'
import {
  MainVideoObjContext,
  PublisherObjContext,
} from '../../states/MainContextProvider'
import {
  videoState,
  audioState,
  canEnterState,
  roomInfoState,
  participantsState,
  errorState,
} from '../../states/atoms'
import zoomOutWhite from '../../images/zoom-out_white.png'
import { isCustomer, isScreen, UserTypeEnum } from '../../enums/UserType'
import { ALLOW_ENTER } from '../../enums/SignalEventType'

export default function PublisherVideo() {
  const setError = useSetRecoilState(errorState)
  const [streamId, setStreamId] = useState<string>('')
  const { setPublisherObj } = useContext(PublisherObjContext)
  const { mainVideoObj, setMainVideoObj } = useContext(MainVideoObjContext)
  const video = useRecoilValue(videoState)
  const audio = useRecoilValue(audioState)
  const [canEnter, setCanEnter] = useRecoilState(canEnterState)
  const latestCanEnter = useLatest<boolean>(canEnter)
  const roomInfo = useRecoilValue(roomInfoState)
  const participants = useRecoilValue(participantsState)

  const publisherRef = useRef<OTPublisherRef>(null)

  const style = {
    audioLevelDisplayMode: 'off', // 音声の大きさ表示
    archiveStatusDisplayMode: 'auto', // （未検証）通話録画時にその旨を表示
    buttonDisplayMode: 'off', // 自分の音声切り替えボタンを非表示
  } as const

  function replacePublishVideoToMain(publisherObj: Publisher) {
    replaceMainVideo(mainVideoObj, publisherObj)
    setMainVideoObj(publisherObj)
  }

  function handlePublish() {
    const currentPublisherObj = publisherRef.current?.getPublisher()
    if (!currentPublisherObj) {
      return alert('ビデオの読み込みに失敗しました')
    }

    setPublisherObj(currentPublisherObj)
    setStreamId(currentPublisherObj.stream.streamId)
    replacePublishVideoToMain(currentPublisherObj)

    // 入室許可イベントが届いたらそのユーザーの入室許可設定にし、ミュートから初期設定値にする
    currentPublisherObj.session.on('signal:' + ALLOW_ENTER, () => {
      // 未入室の場合のみ、イベント受信設定をする
      if (!latestCanEnter.current) {
        setCanEnter(true)
      }
    })
  }

  // 誰かが画面共有している時はユーザータイプによって表示を切り替える
  function isDisplay(): boolean {
    const sharingVideo = participants.find((_participant) =>
      isScreen(_participant.userType)
    )

    // 画面共有してない場合は常に表示
    if (!sharingVideo) {
      return true
    }

    switch (roomInfo!.userType) {
      // ホスト, 顧客: 非表示
      case UserTypeEnum.HOST:
      case UserTypeEnum.CUSTOMER:
        return false

      // スタッフ: 常に表示
      case UserTypeEnum.STAFF:
        return true

      // 例外
      default:
        return true
    }
  }

  return (
    <div
      id={streamId}
      className="subVideo"
      // 画面共有中は自身を非表示
      style={{ display: isDisplay() ? 'block' : 'none' }}
    >
      {publisherRef.current?.getPublisher() && (
        <CallInfo videoObj={publisherRef.current.getPublisher()} />
      )}

      <OTPublisher
        properties={{
          audioBitrate: 30000,
          publishAudio: audio,
          publishVideo: video,
          videoSource: true,
          fitMode: 'cover',
          width: getWidthByDevice(),
          height: getHeightByDevice(),
          // カスタマー以外は負荷軽減のため解像度, フレームレートを低くする
          frameRate: isCustomer(roomInfo!.userType) ? 30 : 15,
          resolution: isCustomer(roomInfo!.userType) ? '1280x720' : '640x480',
          maxResolution: {
            height: isCustomer(roomInfo!.userType) ? 1920 : 480,
            width: isCustomer(roomInfo!.userType) ? 1920 : 640,
          },
          style,
        }}
        ref={publisherRef}
        eventHandlers={{
          accessDenied: () => alert('ビデオ, マイクの許可をしてください。'),
        }}
        onError={(err: Error) => setError(err.name)}
        onPublish={handlePublish}
      />

      <button
        onClick={() =>
          replacePublishVideoToMain(publisherRef.current?.getPublisher()!)
        }
      >
        <img src={zoomOutWhite} alt="ズームアウト" />
      </button>
    </div>
  )
}
