import { useEffect, useContext } from 'react'
import { OTStreams } from 'opentok-react'
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil'

import styles from './AllVideos.module.scss'
import MainVideo from '../MainVideo/MainVideo'
import PublisherVideo from '../PublisherVideo/PublisherVideo'
import SubscriberVideo from '../SubscriberVideo/SubscriberVideo'
import WaitingEnter from '../WaitingEnter/WaitingEnter'
import ControlAccess from '../ControlAccess/ControlAccess'
import { isCustomer, isHost, isStaff } from '../../enums/UserType'
import {
  PublisherObjContext,
  ScreeningPublisherObjContext,
} from '../../states/MainContextProvider'
import {
  audioState,
  canEnterState,
  displayingSubVideoState,
  participantsState,
  roomInfoState,
  tmpAudioState,
  tmpVideoState,
  videoState,
  hostDisconnectedCookieState,
  hostVideoDisabledState,
  customerVideoDisabledState,
} from '../../states/atoms'
import { startRecord } from '../../libs/request'
import useSetTimer from '../../hooks/useSetTimer'
import useSessionEventHandler from '../../hooks/useSessionEventHandler'
import useReceptionSignal from '../../hooks/useReceptionSignal'
import useTransmissionSignal from '../../hooks/useTransmissionSignal'
import RecordingAttention from '../RecordingAttention/RecordingAttention'
import HostReentry from '../HostReentry/HostReentry'
import VideoDisabled from '../VideoDisabled/VideoDisabled'

export default function AllVideos() {
  const { publisherObj } = useContext(PublisherObjContext)
  const { screeningPublisherObj } = useContext(ScreeningPublisherObjContext)

  const [canEnter, setCanEnter] = useRecoilState(canEnterState)
  const tmpAudio = useRecoilValue(tmpAudioState)
  const tmpVideo = useRecoilValue(tmpVideoState)
  const { name, userType } = useRecoilValue(roomInfoState)!
  const participants = useRecoilValue(participantsState)
  const displayingSubVideo = useRecoilValue(displayingSubVideoState)
  const hostVideoDisabled = useRecoilValue(hostVideoDisabledState)
  const customerVideoDisabled = useRecoilValue(customerVideoDisabledState)
  const hostDisconnectedCookie = useRecoilValue(hostDisconnectedCookieState)
  const setAudio = useSetRecoilState(audioState)
  const setVideo = useSetRecoilState(videoState)
  const setTimer = useSetTimer()
  const setSessionEventHandler = useSessionEventHandler()
  const setReceptionSignal = useReceptionSignal()
  const setTransmissionSignal = useTransmissionSignal()

  // sessionイベント受信時の処理
  useEffect(() => {
    setSessionEventHandler()
  }, [publisherObj])

  // イベント送信設定
  useEffect(() => {
    setTransmissionSignal()
  })

  // イベント受信設定
  useEffect(() => {
    setReceptionSignal()
  }, [publisherObj])

  // 顧客参加後の経過時間(s)
  useEffect(() => {
    setTimer()
  }, [participants])

  useEffect(() => {
    if (isHost(userType)) {
      startRecord(name)
    }

    // ホスト以外は初期値をミュートにする（カスタマーは入室待ち中にホストに声が届いてしまうのと、スタッフは常にミュートなので）
    setAudio(isHost(userType) ? tmpAudio : false)
    // スタッフは常にカメラオフ
    setVideo(isStaff(userType) ? false : tmpVideo)

    // お客様以外は自動入室
    setCanEnter(!isCustomer(userType))
  }, [])

  return (
    <>
      {!canEnter && publisherObj && <WaitingEnter />}

      <MainVideo />

      <section
        className={styles.subVideosWrap}
        style={{ display: displayingSubVideo ? 'block' : 'none' }}
        id="subVideos"
      >
        <PublisherVideo />

        {/* 入室許可されるまでは他参加者は非表示 */}
        {canEnter && (
          <OTStreams>
            <SubscriberVideo />
          </OTStreams>
        )}
      </section>

      {/* 入室直後に録画中テキスト表示 */}
      {isCustomer(userType) && canEnter && <RecordingAttention />}

      {/* ホスト側のネット切断後、ホストが再入室した場合に表示 */}
      {isCustomer(userType) && hostDisconnectedCookie && <HostReentry />}

      {/* ホスト側のビデオ非表示後、顧客側にテキスト表示 */}
      {isCustomer(userType) && hostVideoDisabled && (
        <VideoDisabled displayText="ネットワークが不安定のため画像を停止中です。接続が切れた場合は再接続をお願い致します。" />
      )}

      {/* 顧客側のビデオ非表示後、顧客側にテキスト表示  */}
      {isCustomer(userType) && customerVideoDisabled && (
        <VideoDisabled displayText="ネットワークが不安定のため画像を停止中です。接続が切れた場合は再接続をお願い致します。" />
      )}

      {/* ホスト側のビデオ非表示後、ホスト側にテキスト表示 */}
      {isHost(userType) && hostVideoDisabled && (
        <VideoDisabled displayText="接客員のネットワークが不安定のため画像を停止中です。接続環境を確認し、お客様へ適切な対応をしてください。" />
      )}

      {/* 顧客側のビデオ非表示後、ホスト側にテキスト表示  */}
      {isHost(userType) && customerVideoDisabled && (
        <VideoDisabled displayText="ネットワークが不安定のため画像を停止中です。" />
      )}

      {/* 画面共有時に無限表示させないため、共有時はこれで全て覆う表示 */}
      {screeningPublisherObj && <div className={styles.blurAllContents}></div>}

      {/* 入室時の通知モーダル */}
      {isHost(userType) && publisherObj && <ControlAccess />}
    </>
  )
}
