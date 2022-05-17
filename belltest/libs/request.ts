// 外部サーバーにリクエストする処理まとめ
import axios from 'axios'
import { RecordDocument } from '../../server/models/Record'
import { RoomDocument } from '../../server/models/Room'
const { REACT_APP_API_BASE_URL } = process.env

export async function getRoomInfo(
  roomName: string
): Promise<RoomDocument | null> {
  const res = await axios.get<RoomDocument | null>(
    `${REACT_APP_API_BASE_URL}/api/rooms/${roomName}/info`
  )
  return res.data
}

export async function putRoomInfo(roomName: string): Promise<RoomDocument> {
  const res = await axios.put<RoomDocument>(
    `${REACT_APP_API_BASE_URL}/api/rooms/${roomName}`
  )

  return res.data
}

export async function startRecord(roomName: string): Promise<RecordDocument> {
  const res = await axios.post<RecordDocument>(
    `${REACT_APP_API_BASE_URL}/api/rooms/${roomName}/records/start`
  )

  return res.data
}

export async function saveRecord(roomName: string): Promise<void> {
  await axios.post<void>(
    `${REACT_APP_API_BASE_URL}/api/rooms/${roomName}/records/save`
  )
}

export async function uploadRecordsToS3(): Promise<void> {
  await axios.put<void>(
    `${REACT_APP_API_BASE_URL}/api/rooms/all/records/upload`
  )
}
