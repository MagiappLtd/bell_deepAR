import { useContext } from 'react'
import { useSetRecoilState, useRecoilValue } from 'recoil'
import { Publisher, Subscriber } from 'opentok-react/types/opentok'
import { useLatest } from 'react-use'
import CallInfo from '../CallInfo/CallInfo'

import styles from './ShareScreenButton.module.scss'
import {
  getScreenShareCapability,
  replaceMainVideo,
  getWidthByDevice,
  getHeightByDevice,
} from '../../libs/index'

import shareBtn from '../../images/share.png'
import sharingBtn from '../../images/share_white.png'
import zoomOutWhite from '../../images/zoom-out_white.png'
import { UserTypeEnum } from '../../enums/UserType'
import { ParticipantType } from '../../types/Participants'
import {
  MainVideoObjContext,
  ScreeningPublisherObjContext,
} from '../../states/MainContextProvider'
import { participantsState, roomInfoState } from '../../states/atoms'
import { ENTERED_ROOM } from '../../enums/SignalEventType'

const { REACT_APP_API_KEY } = process.env

export default function ShareScreenButton() {
  const { screeningPublisherObj, setScreeningPublisherObj } = useContext(
    ScreeningPublisherObjContext
  )
  const latestScreeningPublisherObjState = useLatest<Publisher | null>(
    screeningPublisherObj
  )
  const { mainVideoObj, setMainVideoObj } = useContext(MainVideoObjContext)
  const latestMainVideoObjState = useLatest<Publisher | Subscriber | null>(
    mainVideoObj
  )
  const setParticipants = useSetRecoilState(participantsState)
  const roomInfo = useRecoilValue(roomInfoState)

  function stopSharing() {
    const currentScreeningObj = latestScreeningPublisherObjState.current!
    if (currentScreeningObj.stream) {
      // 共有がキャンセルされた時、streamが存在しないためsetParticiantsを発火させない
      setParticipants((_prevParticipants: ParticipantType[]) =>
        _prevParticipants.filter(
          (_prevParticipant) =>
            _prevParticipant.streamId !== currentScreeningObj.stream.streamId
        )
      )
    }
    // 画面共有がメインビデオなら削除する
    if (
      latestMainVideoObjState.current?.stream.streamId ===
      currentScreeningObj.stream.streamId
    ) {
      setMainVideoObj(null)
    }
    currentScreeningObj.destroy()
    setScreeningPublisherObj(null)
  }

  function onStream(
    sharingVideoWrapElm: HTMLElement,
    screeningPublisherObj: Publisher
  ) {
    sharingVideoWrapElm.id = screeningPublisherObj.stream.streamId // メインビデオ切り替え用にid付与
    document.getElementById('subVideos')?.appendChild(sharingVideoWrapElm)

    // 画面共有ビデオを入室扱いにする
    screeningPublisherObj.session.signal({
      type: ENTERED_ROOM,
      data: JSON.stringify({
        streamId: screeningPublisherObj.stream.streamId,
        userType: UserTypeEnum.SCREEN,
        canEnter: true,
      }),
    })

    setScreeningPublisherObj(screeningPublisherObj)
    replaceMainVideo(latestMainVideoObjState.current, screeningPublisherObj)
    setMainVideoObj(screeningPublisherObj)
  }

  function shareScreen() {
    if (screeningPublisherObj) {
      return stopSharing()
    }

    const screenShareCapability = getScreenShareCapability()

    const sharingVideoElm = document.getElementById('sharingVideo')!

    screenShareCapability
      .then(() => {
        const initScreeningPublisherObj = OT.initPublisher(sharingVideoElm, {
          audioBitrate: 30000,
          publishAudio: true,
          publishVideo: true,
          videoSource: 'screen',
          fitMode: 'contain',
          width: getWidthByDevice(),
          height: getHeightByDevice(),
          insertMode: 'append',
          style: {
            archiveStatusDisplayMode: 'auto',
            audioLevelDisplayMode: 'off', // 音声の大きさ表示
            buttonDisplayMode: 'off', // 自分の音声切り替えボタンを非表示
          },
        })

        initScreeningPublisherObj.on('mediaStopped', stopSharing) // 画面共有オフ
        initScreeningPublisherObj.on('accessDenied', stopSharing) // 画面共有キャンセル
        initScreeningPublisherObj.on('streamCreated', () =>
          // 画面共有が全員に共有された時
          onStream(sharingVideoElm.parentElement!, initScreeningPublisherObj)
        )

        OT.initSession(REACT_APP_API_KEY!, roomInfo!.sessionId).publish(
          initScreeningPublisherObj
        )
      })
      .catch((err) => alert(err.message))
  }

  function replaceSharingVideoToMain() {
    replaceMainVideo(latestMainVideoObjState.current, screeningPublisherObj!)
    setMainVideoObj(screeningPublisherObj)
  }

  return (
    <>
      <button
        className={screeningPublisherObj ? styles.sharing : ''}
        type="button"
        onClick={shareScreen}
      >
        {screeningPublisherObj ? (
          <img src={sharingBtn} alt="画面共有中" />
        ) : (
          <img src={shareBtn} alt="画面共有開始" />
        )}
      </button>

      <div
        style={{ display: screeningPublisherObj ? 'block' : 'none' }}
        className="subVideo"
      >
        {screeningPublisherObj && <CallInfo videoObj={screeningPublisherObj} />}

        {/* ここに一時的に画面共有ビデオを置く */}
        <div id="sharingVideo"></div>

        <button onClick={replaceSharingVideoToMain}>
          <img src={zoomOutWhite} alt="ズームアウト" />
        </button>
      </div>
    </>
  )
}
