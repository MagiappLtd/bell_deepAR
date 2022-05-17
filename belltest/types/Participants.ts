import { UserType } from '../enums/UserType'

export type ParticipantType = {
  streamId: string
  userType: UserType
  canEnter: boolean
}
