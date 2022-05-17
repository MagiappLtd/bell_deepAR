import { useState, useRef, useContext, useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { OTSubscriber, OTSubscriberRef } from 'opentok-react'
import { Subscriber } from 'opentok-react/types/opentok'
import { useLatest } from 'react-use'

import {
  connectToSpeakerForIOS15,
  getHeightByDevice,
  getWidthByDevice,
  reflectSpeakerSetting,
  replaceMainVideo,
} from '../../libs/index'
import zoomOutWhite from '../../images/zoom-out_white.png'
import { ParticipantType } from '../../types/Participants'
import { MainVideoObjContext } from '../../states/MainContextProvider'
import {
  participantsState,
  roomInfoState,
  speakerDeviceIdState,
  tmpSpeakerDeviceIdState,
  videoDisabledUserTypeState,
} from '../../states/atoms'
import {
  isCustomer,
  isScreen,
  isStaff,
  UserTypeEnum,
} from '../../enums/UserType'
import CallInfo from '../CallInfo/CallInfo'

export default function SubscriberVideo() {
  const subscriberRef = useRef<OTSubscriberRef>(null)
  const videoElm = useRef<HTMLDivElement>(null)
  const [streamId, setStreamId] = useState<string>('')
  const latestStreamId = useLatest<string>(streamId)
  const { mainVideoObj, setMainVideoObj } = useContext(MainVideoObjContext)
  const [participants, setParticipants] = useRecoilState(participantsState)
  const speakerDeviceId = useRecoilValue(speakerDeviceIdState)
  const tmpSpeakerDeviceId = useRecoilValue(tmpSpeakerDeviceIdState)
  const roomInfo = useRecoilValue(roomInfoState)
  const setVideoDisabledUserTypeState = useSetRecoilState(
    videoDisabledUserTypeState
  )

  const style = {
    audioLevelDisplayMode: 'off', // 音声の大きさ表示
    archiveStatusDisplayMode: 'auto', // （未検証）通話録画時にその旨を表示
    buttonDisplayMode: 'off', // 自分の音声切り替えボタンを非表示
  } as const
  // 画面共有ビデオが入室したらメインビデオに固定
  useEffect(() => {
    const targetParticipant = findTargetParticipant()
    if (targetParticipant && isScreen(targetParticipant.userType)) {
      replaceSubscriberVideoToMain(subscriberRef.current?.getSubscriber()!)
    }
  }, [participants, streamId])

  // ビデオ非表示を検知
  function detectVideoDisabled() {
    switch (roomInfo!.userType) {
      case UserTypeEnum.CUSTOMER:
        return setVideoDisabledUserTypeState('HOST')
      case UserTypeEnum.HOST:
        return setVideoDisabledUserTypeState('CUSTOMER')
    }
  }

  // このsubscriberをメインビデオに置き換え
  function replaceSubscriberVideoToMain(subscriberObj: Subscriber): void {
    replaceMainVideo(mainVideoObj, subscriberObj)
    setMainVideoObj(subscriberObj)
  }

  function deleteFromSession() {
    const currentStreamId = latestStreamId.current
    document.getElementById(currentStreamId)?.remove()
    setParticipants((_prevParticipants: ParticipantType[]) =>
      _prevParticipants.filter(
        (_prevParticipant) => _prevParticipant.streamId !== currentStreamId
      )
    )
  }

  // このサブスクライバー自身のparticipantを取得
  function findTargetParticipant(): ParticipantType | undefined {
    return participants.find(
      (_participant: ParticipantType) => _participant.streamId === streamId
    )
  }

  // 入室許可済み、またはスタッフ以外のユーザーか(スタッフは非表示)
  function isAllowedEnter(): boolean {
    const targetParticipant = findTargetParticipant()

    return (
      !!targetParticipant &&
      targetParticipant.canEnter &&
      !isStaff(targetParticipant.userType)
    )
  }

  function isNotCustomer() {
    const targetParticipant = findTargetParticipant()

    return (
      !!targetParticipant &&
      targetParticipant.canEnter &&
      !isCustomer(targetParticipant.userType)
    )
  }

  function isDisplay() {
    // 入室許可済みでないユーザーは常に非表示
    if (!isAllowedEnter()) {
      return false
    }

    const sharingVideo = participants.find((_participant: ParticipantType) =>
      isScreen(_participant.userType)
    )

    // 画面共有なしで、入室済みであれば表示
    if (!sharingVideo) {
      return true
    }

    // ここから誰かが画面共有している時
    const targetParticipant = findTargetParticipant()!

    switch (roomInfo!.userType) {
      // ホスト: 共有画面と顧客のみ表示
      case UserTypeEnum.HOST:
        return (
          sharingVideo.streamId === latestStreamId.current ||
          isCustomer(targetParticipant.userType)
        )

      // スタッフ: 常に全て表示
      case UserTypeEnum.STAFF:
        return true

      // 顧客: 共有画面のみ表示
      case UserTypeEnum.CUSTOMER:
        return sharingVideo.streamId === latestStreamId.current

      // 例外
      default:
        return false
    }
  }

  return (
    <div
      className="subVideo"
      id={streamId}
      ref={videoElm}
      // 画面共有中, または入室許可済みの場合のみ表示
      style={{
        display: isDisplay() ? 'block' : 'none',
      }}
    >
      {subscriberRef.current?.getSubscriber() && (
        <CallInfo videoObj={subscriberRef.current.getSubscriber()} />
      )}

      <OTSubscriber
        properties={{
          width: getWidthByDevice(),
          height: getHeightByDevice(),
          // カスタマー以外は負荷軽減のため解像度を低くする
          preferredResolution: isNotCustomer()
            ? {
                width: 320,
                height: 240,
              }
            : undefined,
          preferredFrameRate: isNotCustomer() ? 15 : undefined,
          style,
          audioVolume: 100,
        }}
        ref={subscriberRef}
        eventHandlers={{
          destroyed: deleteFromSession,
          videoElementCreated: (e) => {
            // @ts-ignore
            connectToSpeakerForIOS15(e.element.srcObject as MediaStream, 11)

            reflectSpeakerSetting(
              speakerDeviceId.length === 0
                ? tmpSpeakerDeviceId
                : speakerDeviceId
            ) // 既に参加者がいる場合は初期値を渡す
          },
          videoDisabled: (e) => {
            if (e.reason === 'quality') {
              detectVideoDisabled()
            }
          },
        }}
        onSubscribe={() =>
          setStreamId(subscriberRef.current?.getSubscriber().stream.streamId!)
        }
      />
      <button
        type="button"
        onClick={() =>
          replaceSubscriberVideoToMain(subscriberRef.current?.getSubscriber()!)
        }
      >
        <img src={zoomOutWhite} alt="ズームアウト" />
      </button>
    </div>
  )
}
