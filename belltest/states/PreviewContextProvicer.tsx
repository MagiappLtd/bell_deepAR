import { Publisher } from 'opentok-react/types/opentok'
import {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from 'react'

type PreviewPublisherObjCtxType = {
  previewPublisherObj: Publisher | null
  setPreviewPublisherObj: Dispatch<SetStateAction<Publisher | null>>
}

export const PreviewPublisherObjContext =
  createContext<PreviewPublisherObjCtxType>({} as PreviewPublisherObjCtxType)

export default function PreviewContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const [previewPublisherObj, setPreviewPublisherObj] =
    useState<Publisher | null>(null) // 入室前のプレビュー用Publisher

  return (
    <PreviewPublisherObjContext.Provider
      value={{ previewPublisherObj, setPreviewPublisherObj }}
    >
      {children}
    </PreviewPublisherObjContext.Provider>
  )
}
