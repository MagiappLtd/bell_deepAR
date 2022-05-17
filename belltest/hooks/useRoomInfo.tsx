import { useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import qs from 'query-string'
import { getRoomInfo, putRoomInfo } from '../libs/request'
import { RoomDocument } from '../../server/models/Room'
import { UserTypeEnum } from '../enums/UserType'
import { roomInfoState, canGetRoomInfoState } from '../states/atoms'

export default function useRoomInfo(roomName: string) {
  const [roomInfo, setRoomInfo] = useRecoilState(roomInfoState)
  const setCanGetRoomInfo = useSetRecoilState(canGetRoomInfoState)

  useEffect(() => {
    if (roomInfo) {
      return // roomInfoがある場合は何もしない
    }

    // トークンが有効か
    function isValidToken(roomDocument: RoomDocument) {
      return new Date().getTime() < new Date(roomDocument.expireAt).getTime()
    }

    async function initRoom() {
      // DBにルーム名をもとにドキュメント取得
      const roomDocument = await getRoomInfo(roomName)
      if (!roomDocument) {
        alert(`通話先が見つかりません。\nURLが正しいかご確認ください。`)
        return (location.href = '/notfound')
      }

      // ホストであればルームのトークン更新
      const password = qs.parse(location.search).password || ''
      if (password === roomDocument.hostPassword) {
        const updatedRoom = await putRoomInfo(roomName)
        return setRoomInfo({
          sessionId: updatedRoom.sessionId,
          name: updatedRoom.name,
          token: updatedRoom.token,
          userType: UserTypeEnum.HOST,
        })
      }

      if (isValidToken(roomDocument)) {
        return setRoomInfo({
          sessionId: roomDocument.sessionId,
          name: roomDocument.name,
          token: roomDocument.token,
          userType:
            password === roomDocument.staffPassword
              ? UserTypeEnum.STAFF
              : UserTypeEnum.CUSTOMER,
        })
      }
      //roomInfoが取得できていない場合
      setCanGetRoomInfo(false)
    }

    initRoom()
    return () => setRoomInfo(null)
  }, [])
  return roomInfo
}
