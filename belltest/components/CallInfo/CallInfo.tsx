import { Publisher, Subscriber } from 'opentok-react/types/opentok'
import { useContext, useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { isCustomer } from '../../enums/UserType'
import { roomInfoState } from '../../states/atoms'
import { MainVideoObjContext } from '../../states/MainContextProvider'
import MicVolume from '../MicVolume/MicVolume'
import ParticipantNum from '../ParticipantNum/ParticipantNum'
import PassedTime from '../PassedTime/PassedTime'
import ConnectionStrength from '../ConnectionStrength/ConnectionStrength'

import styles from './CallInfo.module.scss'

type Props = {
  videoObj: Publisher | Subscriber
}

export default function CallInfo({ videoObj }: Props) {
  const roomInfo = useRecoilValue(roomInfoState)
  const { mainVideoObj } = useContext(MainVideoObjContext)
  const [isMain, setIsMain] = useState(false)

  useEffect(() => {
    setIsMain(videoObj === mainVideoObj)
  }, [mainVideoObj])

  return (
    <div className={isMain ? styles.mainWrap : styles.subWrap}>
      <div style={{ display: isMain ? 'block' : 'none' }} className="mr-16">
        <PassedTime />
      </div>

      <div
        className={`mt-4 ${styles.connection} ` + (isMain ? 'mr-16' : 'mr-8')}
      >
        <ConnectionStrength videoObj={videoObj} />
      </div>

      <div className={`mt-4 ${styles.mic} ` + (isMain ? 'mr-16' : '')}>
        <MicVolume videoObj={videoObj} />
      </div>

      {!isCustomer(roomInfo!.userType) && isMain && (
        <div className="mr-20 mt-4">
          <ParticipantNum />
        </div>
      )}
    </div>
  )
}
