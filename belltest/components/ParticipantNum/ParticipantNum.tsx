import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { participantsState } from '../../states/atoms'

import styles from './ParticipantNum.module.scss'
import usersWhite from '../../images/users_white.png'

export default function ParticipantNum() {
  const [participantNum, setParticipantNum] = useState<number>(0)
  const participants = useRecoilValue(participantsState)

  useEffect(() => {
    // 入室済み参加者
    const enteredParticipants = participants.filter(
      (_participant) => _participant.canEnter
    )!

    setParticipantNum(enteredParticipants.length)
  }, [participants])

  return (
    <div className={styles.wrap}>
      <span>{participantNum}</span>
      <img src={usersWhite} alt="参加者のアイコン" />
    </div>
  )
}
