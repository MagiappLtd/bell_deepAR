import { Publisher, Subscriber } from 'opentok-react/types/opentok'
import {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from 'react'

type PublisherObjCtxType = {
  publisherObj: Publisher | null
  setPublisherObj: Dispatch<SetStateAction<Publisher | null>>
}

export const PublisherObjContext = createContext<PublisherObjCtxType>(
  {} as PublisherObjCtxType
)

type MainVideoObjCtxType = {
  mainVideoObj: Publisher | Subscriber | null
  setMainVideoObj: Dispatch<SetStateAction<Publisher | Subscriber | null>>
}

export const MainVideoObjContext = createContext<MainVideoObjCtxType>(
  {} as MainVideoObjCtxType
)

type ScreeningPublisherObjCtxType = {
  screeningPublisherObj: Publisher | null
  setScreeningPublisherObj: Dispatch<SetStateAction<Publisher | null>>
}

export const ScreeningPublisherObjContext =
  createContext<ScreeningPublisherObjCtxType>(
    {} as ScreeningPublisherObjCtxType
  )

export default function MainContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const [publisherObj, setPublisherObj] = useState<Publisher | null>(null) // 通話参加中のPublisher(自分自身)
  const [mainVideoObj, setMainVideoObj] = useState<
    Publisher | Subscriber | null
  >(null) // 拡大表示されるストリーム(ビデオ)
  const [screeningPublisherObj, setScreeningPublisherObj] =
    useState<Publisher | null>(null) // 画面共有中の一時的なpublisherObj

  return (
    <PublisherObjContext.Provider value={{ publisherObj, setPublisherObj }}>
      <MainVideoObjContext.Provider value={{ mainVideoObj, setMainVideoObj }}>
        <ScreeningPublisherObjContext.Provider
          value={{ screeningPublisherObj, setScreeningPublisherObj }}
        >
          {children}
        </ScreeningPublisherObjContext.Provider>
      </MainVideoObjContext.Provider>
    </PublisherObjContext.Provider>
  )
}
