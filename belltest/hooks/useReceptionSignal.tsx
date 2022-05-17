import { useContext } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import {
  participantsState,
  roomInfoState,
  hostDisconnectedCookieState,
  hostVideoDisabledState,
  customerVideoDisabledState,
} from '../states/atoms'
import { isCustomer } from '../enums/UserType'
import { PublisherObjContext } from '../states/MainContextProvider'
import { ParticipantType } from '../types/Participants'
import { leaveFromSession } from '../libs'
import {
  ENTERED_ROOM,
  HOST_DISCONNECTED_COOKIE_INFO,
  FORCE_ALL_LEAVING,
  FORCE_CUSTOMER_LEAVING,
  CUSTOMER_VIDEO_DISABLED,
  HOST_VIDEO_DISABLED,
} from '../enums/SignalEventType'

// イベント受信設定用Custom hook
export default function useReceptionSignal() {
  const { publisherObj } = useContext(PublisherObjContext)
  const roomInfo = useRecoilValue(roomInfoState)
  const setParticipants = useSetRecoilState(participantsState)
  const setHostDisconnectedCookie = useSetRecoilState(
    hostDisconnectedCookieState
  )
  const setHostVideoDisabledState = useSetRecoilState(hostVideoDisabledState)
  const setCustomerVideoDisabledState = useSetRecoilState(
    customerVideoDisabledState
  )

  function setReceptionSignal() {
    if (!publisherObj) {
      return
    }

    // 入室受信
    // eslint-disable-next-line
    publisherObj.session.on('signal:' + ENTERED_ROOM, (e: any) => {
      const newParticipant = JSON.parse(e.data) as ParticipantType

      // 入室ユーザーが存在してなければ追加
      setParticipants((_prevParticipants: ParticipantType[]) => {
        const isEntered = _prevParticipants.find(
          (_prevParticipant) =>
            _prevParticipant.streamId === newParticipant.streamId
        )
        return isEntered
          ? _prevParticipants
          : _prevParticipants.concat(newParticipant)
      })
    })

    // ホスト側のビデオが非表示になったシグナル受信
    publisherObj.session.on('signal:' + HOST_VIDEO_DISABLED, () => {
      setHostVideoDisabledState(true)
    })

    // 顧客側のビデオが非表示になったシグナル受信
    publisherObj.session.on('signal:' + CUSTOMER_VIDEO_DISABLED, () => {
      setCustomerVideoDisabledState(true)
    })

    // ホスト側のネット接続が切断されたことを示すcookie情報を受信（Customerのみ）
    if (isCustomer(roomInfo!.userType)) {
      publisherObj.session.on('signal:' + HOST_DISCONNECTED_COOKIE_INFO, () => {
        setHostDisconnectedCookie(true)
      })
    }

    // 強制退出受信（Customerのみ）
    if (isCustomer(roomInfo!.userType)) {
      publisherObj.session.on('signal:' + FORCE_CUSTOMER_LEAVING, () => {
        publisherObj.session.disconnect()
        alert(`通話から退出しました。\n必要であれば再入室をお願いします。`)
        location.reload()
      })
    }

    // 強制退出（自身を含む全員）
    publisherObj.session.on('signal:' + FORCE_ALL_LEAVING, () => {
      leaveFromSession(publisherObj!, roomInfo!.userType)
    })
  }

  return setReceptionSignal
}
