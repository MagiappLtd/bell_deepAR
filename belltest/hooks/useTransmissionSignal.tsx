import { useContext } from 'react'
import { useRecoilValue, useRecoilState } from 'recoil'

import { isCustomer } from '../enums/UserType'
import {
  PublisherObjContext,
  ScreeningPublisherObjContext,
} from '../states/MainContextProvider'
import {
  canEnterState,
  roomInfoState,
  videoDisabledUserTypeState,
} from '../states/atoms'
import { UserTypeEnum } from '../enums/UserType'
import { useCookies } from 'react-cookie'
import {
  HOST_DISCONNECTED_COOKIE_INFO,
  ENTERED_ROOM,
  REQUEST_ENTER,
  HOST_VIDEO_DISABLED,
  CUSTOMER_VIDEO_DISABLED,
} from '../enums/SignalEventType'
import { HOST_DISCONNECTED } from '../enums/CookieNameType'
import { HostSessionType } from '../types/HostSession'

// イベント送信設定用Custom hook
// 入室許可ユーザーとして入室したら、入室した通知を送る。
// それを他参加者が受け取ったら自身の情報を渡す。
// 既存のparticipantsに重複なしで追加する。
export default function useTransmissionSignal() {
  const { publisherObj } = useContext(PublisherObjContext)
  const { screeningPublisherObj } = useContext(ScreeningPublisherObjContext)

  const canEnter = useRecoilValue(canEnterState)
  const roomInfo = useRecoilValue(roomInfoState)
  const [videoDisabledUserType, setVideoDisabledUserType] = useRecoilState(
    videoDisabledUserTypeState
  )
  // eslint-disable-next-line
  const [cookies, setCookie, removeCookie] = useCookies<string, HostSessionType>()

  function setTransmissionSignal() {
    if (!publisherObj?.stream) {
      return
    }

    // 既に待機中の顧客がいれば、再度入室リクエストを送信
    if (isCustomer(roomInfo!.userType) && !canEnter) {
      return publisherObj.session.signal(
        {
          type: REQUEST_ENTER,
        },
        (err) => {
          if (err) {
            alert(
              `エラーが発生しました。\n担当者にお問い合わせいただくか、再度お試しください。`
            )
          }
        }
      )
    }
    // ビデオ非表示シグナルを送信
    switch (videoDisabledUserType) {
      case UserTypeEnum.HOST:
        setVideoDisabledUserType(null)
        return publisherObj.session.signal({
          type: HOST_VIDEO_DISABLED,
        })
      case UserTypeEnum.CUSTOMER:
        setVideoDisabledUserType(null)
        return publisherObj.session.signal({
          type: CUSTOMER_VIDEO_DISABLED,
        })
    }

    // 自分自身の情報を全員宛に共有
    publisherObj.session.signal({
      type: ENTERED_ROOM,
      data: JSON.stringify({
        streamId: publisherObj.stream.streamId,
        userType: roomInfo!.userType,
        canEnter,
      }),
    })

    // ホスト側のネット接続が切断されたことを示すcookie情報を送信
    if (cookies.hostDisconnected) {
      publisherObj.session.signal({
        type: HOST_DISCONNECTED_COOKIE_INFO,
      })
      //一度送ったらcookieを削除
      removeCookie(HOST_DISCONNECTED)
    }

    // 画面共有中であればその情報を全員宛に共有
    if (screeningPublisherObj?.session) {
      // ブラウザの共有停止ボタンの場合のみsessionがnullでエラーを吐くためifで分岐
      screeningPublisherObj.session.signal({
        type: ENTERED_ROOM,
        data: JSON.stringify({
          streamId: screeningPublisherObj.stream?.streamId,
          userType: UserTypeEnum.SCREEN,
          canEnter,
        }),
      })
    }
  }

  return setTransmissionSignal
}
