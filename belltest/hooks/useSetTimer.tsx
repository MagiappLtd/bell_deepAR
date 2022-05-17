import { useRecoilValue, useSetRecoilState } from 'recoil'
import {
  canEnterState,
  participantsState,
  passedSecondsState,
  timerIsStartedState,
} from '../states/atoms'
import { isCustomer } from '../enums/UserType'

export default function useSetTimer() {
  const participants = useRecoilValue(participantsState)
  // 顧客参加後の経過時間(s)
  const setPassedSeconds = useSetRecoilState<number>(passedSecondsState)
  const setTimerIsStarted = useSetRecoilState(timerIsStartedState)
  const canEnter = useRecoilValue(canEnterState)

  // 経過時間の計測
  function setTimer() {
    // 顧客がいない or 自身が入室済みでなければ何もしない
    const enteredCustomer = participants.find(
      (_participant) =>
        isCustomer(_participant.userType) && _participant.canEnter
    )!

    if (!canEnter || !enteredCustomer) {
      return
    }

    setTimerIsStarted((prevTimerIsStarted) => {
      // 未計測ならカウント開始
      if (!prevTimerIsStarted) {
        setInterval(() => setPassedSeconds((prev) => prev + 1), 1000)
        return !prevTimerIsStarted
      }

      return prevTimerIsStarted
    })
  }

  return setTimer
}
