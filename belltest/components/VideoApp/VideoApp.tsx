import { OTSession } from 'opentok-react'
import { RouteComponentProps } from 'react-router'
import AllVideos from '../AllVideos/AllVideos'
import { Error } from 'opentok-react/types/opentok'
import { useRecoilState, useRecoilValue } from 'recoil'

import useRoomInfo from '../../hooks/useRoomInfo'
import PreparationForEnter from '../PreparationForEnter/PreparationForEnter'
import MainContextProvider from '../../states/MainContextProvider'
import PreviewContextProvider from '../../states/PreviewContextProvicer'
import {
  errorState,
  isReadyForEnterState,
  canGetRoomInfoState,
} from '../../states/atoms'
import WaitingBeforeEnterHost from '../WaitingBeforeEnterHost/WaitingBeforeEnterHost'
import ErrorComponent from '../Error/Error'

// import styles from './VideoApp.module.scss'

const { REACT_APP_API_KEY } = process.env

type Props = RouteComponentProps<{ roomName: string }>

export default function VideoApp({ match }: Props) {
  const roomInfo = useRoomInfo(match.params.roomName)
  const [error, setError] = useRecoilState(errorState)
  const isReadyForEnter = useRecoilValue(isReadyForEnterState)
  const canGetRoomInfo = useRecoilValue(canGetRoomInfoState)

  return (
    <>
      {/*
        ルーム情報が存在してエラーがない場合のみ通話開始
        ルーム情報がnull、エラーがない、roomInfoが取得できていない場合は再読み込み案内モーダルを表示
      */}
      {error === '' ? (
        roomInfo ? (
          <OTSession
            apiKey={REACT_APP_API_KEY!}
            sessionId={roomInfo.sessionId}
            token={roomInfo.token}
            onError={(err: Error) => setError(err.name)}
          >
            {isReadyForEnter ? (
              <MainContextProvider>
                <AllVideos />
              </MainContextProvider>
            ) : (
              <PreviewContextProvider>
                <PreparationForEnter />
              </PreviewContextProvider>
            )}
          </OTSession>
        ) : (
          !canGetRoomInfo && <WaitingBeforeEnterHost />
        )
      ) : (
        <ErrorComponent roomName={match.params.roomName} />
      )}
    </>
  )
}
