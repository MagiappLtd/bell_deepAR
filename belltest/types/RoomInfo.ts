import { UserType } from '../enums/UserType'

export type RoomInfo = {
  sessionId: string
  name: string
  token: string
  userType: UserType
}
