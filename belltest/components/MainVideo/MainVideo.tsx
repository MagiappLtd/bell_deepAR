import { useContext } from 'react'
import { useSetRecoilState, useRecoilValue } from 'recoil'

import AudioButton from '../AudioButton/AudioButton'
import CameraButton from '../CameraButton/CameraButton'
import ShareScreenButton from '../ShareScreenButton/ShareScreenButton'
import SettingButtonPC from '../SettingButtonPC/SettingButtonPC'
import SettingButtonSP from '../SettingButtonSP/SettingButtonSP'
import CycleVideoButton from '../CycleVideoButton/CycleVideoButton'
import LeaveButton from '../LeaveButton/LeaveButton'
import ZoomButton from '../ZoomButton/ZoomButton'
import ForceLeavingButton from '../ForceLeavingButton/ForceLeavingButton'

import styles from './MainVideo.module.scss'
import { isMobilePhone } from '../../libs/index'
import { PublisherObjContext } from '../../states/MainContextProvider'
import {
  audioState,
  canEnterState,
  roomInfoState,
  videoState,
} from '../../states/atoms'
import { isCustomer, isHost, isStaff } from '../../enums/UserType'
import DisplaySubVideoButton from '../DisplaySubVideoButton/DisplaySubVideoButton'

export default function MainVideo() {
  const { publisherObj } = useContext(PublisherObjContext)

  const canEnter = useRecoilValue(canEnterState)
  const setAudio = useSetRecoilState(audioState)
  const setVideo = useSetRecoilState(videoState)
  const roomInfo = useRecoilValue(roomInfoState)

  return (
    // 入室許可されたユーザーのみ表示
    <div
      id="mainVideo"
      className={styles.mainVideo}
      style={{ display: canEnter ? 'block' : 'none' }}
    >
      {publisherObj && (
        <div className={styles.buttonWrapper}>
          {/* PCとSPでボタンの種類を分ける（スタッフには退出ボタン以外非表示） */}
          {isMobilePhone() ? (
            <div>
              {!isStaff(roomInfo!.userType) && (
                <div className={styles.spRightTop}>
                  <CycleVideoButton />

                  <SettingButtonSP />
                </div>
              )}

              {!isCustomer(roomInfo!.userType) && (
                <div className={styles.spLeftTop}>
                  <DisplaySubVideoButton />
                </div>
              )}

              <div className={styles.spRightBottom}>
                {!isStaff(roomInfo!.userType) && (
                  <>
                    <AudioButton
                      onClick={() => setAudio((prev: boolean) => !prev)}
                    />

                    <CameraButton
                      onClick={() => setVideo((prev: boolean) => !prev)}
                    />
                  </>
                )}

                {isHost(roomInfo!.userType) && <ForceLeavingButton />}

                <LeaveButton />
              </div>
            </div>
          ) : (
            <div className={styles.pcButtonWrapper}>
              {!isStaff(roomInfo!.userType) && (
                <>
                  <AudioButton
                    onClick={() => setAudio((prev: boolean) => !prev)}
                  />

                  <CameraButton
                    onClick={() => setVideo((prev: boolean) => !prev)}
                  />

                  {isHost(roomInfo!.userType) && <ShareScreenButton />}

                  <ZoomButton />

                  <SettingButtonPC />
                </>
              )}

              {!isCustomer(roomInfo!.userType) && <DisplaySubVideoButton />}

              {isHost(roomInfo!.userType) && <ForceLeavingButton />}

              <LeaveButton />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
