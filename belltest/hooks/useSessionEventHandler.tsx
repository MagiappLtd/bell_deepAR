import { useContext } from 'react'
import { useRecoilValue } from 'recoil'
import { roomInfoState } from '../states/atoms'
import { isCustomer, isHost } from '../enums/UserType'
import { PublisherObjContext } from '../states/MainContextProvider'
import { useCookies } from 'react-cookie'
import { HostSessionType } from '../types/HostSession'
import { HOST_DISCONNECTED } from '../enums/CookieNameType'

// sessionイベント受信時の処理を定義したCustom hook
export default function useSessionEventHandler() {
  const { publisherObj } = useContext(PublisherObjContext)
  const roomInfo = useRecoilValue(roomInfoState)
  // eslint-disable-next-line
  const [cookies, setCookie] = useCookies<string, HostSessionType>()

  function setSessionEventHandler() {
    if (!publisherObj) {
      return
    }
    // ネット接続切断のイベントを検知
    // eslint-disable-next-line
    publisherObj.session.on('sessionDisconnected', (e: any) => {
      if (e.reason !== 'networkDisconnected') {
        return
      }

      // 顧客のネット接続が切断された場合
      if (isCustomer(roomInfo!.userType)) {
        alert(
          'ネットワークが不安定のため接続が切れました。再接続をお願い致します。'
        )
      }

      // ホストのネット接続が切断された場合
      if (isHost(roomInfo!.userType)) {
        // Cookieを設定
        // ネット接続切断後にsessionDisconnectedイベントが検知可能となり、sessionがなくsignalが使えないためCookieを使用
        setCookie(HOST_DISCONNECTED, true)
        alert(
          '接客員のネットワークが不安定のため接続が切れました。接続環境を確認し、お客様へ適切な対応をしてください。'
        )
      }
      location.reload()
    })
  }

  return setSessionEventHandler
}
