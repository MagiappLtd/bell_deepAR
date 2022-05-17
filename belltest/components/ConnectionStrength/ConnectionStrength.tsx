// import styles from './ConnectionStrength.module.scss'

import {
  Error,
  Publisher,
  PublisherStats,
  Subscriber,
  SubscriberStats,
} from 'opentok-react/types/opentok'
import { useEffect, useRef, useState } from 'react'

import radio_0 from '../../images/radio-0.png'
import radio_1 from '../../images/radio-1.png'
import radio_2 from '../../images/radio-2.png'
import radio_3 from '../../images/radio-3.png'
import radio_4 from '../../images/radio-4.png'
import radio_5 from '../../images/radio-5.png'

type Props = {
  videoObj: Publisher | Subscriber
}

export default function ConnectionStrength({ videoObj }: Props) {
  const [radioIcon, setRadioIcon] = useState<string>(radio_0)
  const packetsLostVSumRef = useRef<number>(0) // 現在までの消失パケット総数への参照（Video）
  const packetsLostASumRef = useRef<number>(0) // 現在までの消失パケット総数への参照（Audio）
  // 直近1秒間の消失パケット数
  const [currentPacketsLost, setCurrentPacketsLost] = useState<number | null>(0)
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (intervalRef.current) {
      // videoObjが変更された場合
      clearInterval(intervalRef.current)
      packetsLostVSumRef.current = 0
      packetsLostASumRef.current = 0
    }
    // 1秒ごとに実行
    intervalRef.current = window.setInterval(() => {
      // 統計量の取得
      videoObj.getStats(
        (
          error: Error | undefined,
          stats: PublisherStats[] | SubscriberStats
        ) => {
          if (error) {
            console.log(error)
            setCurrentPacketsLost(null)
            return
          }
          // videoObjがPublisherの場合は長さ1の配列、Subscriberの場合はオブジェクトが返される
          const objStats = Array.isArray(stats) ? stats[0].stats : stats

          // 1秒前までの消失パケット総数
          const prevPacketsLostVSum = packetsLostVSumRef.current
          const prevPacketsLostASum = packetsLostASumRef.current

          // 現在までの消失パケット総数
          // @ts-ignore (ドット記法ではtsエラー[Property 'video' does not exist], ブラケット記法ではundefindが返される)
          packetsLostVSumRef.current = objStats.video.packetsLost
          // @ts-ignore (ドット記法ではtsエラー[Property 'audio' does not exist], ブラケット記法ではundefindが返される)
          packetsLostASumRef.current = objStats.audio // @ts-ignore
            ? objStats.audio.packetsLost
            : 0

          // 直近1秒間の消失パケット数
          const currentPacketsLostV =
            packetsLostVSumRef.current - prevPacketsLostVSum
          const currentPacketsLostA =
            packetsLostASumRef.current - prevPacketsLostASum
          setCurrentPacketsLost(currentPacketsLostV + currentPacketsLostA)
        }
      )
    }, 1000)

    // アンマウント時の処理
    return () => clearInterval(intervalRef.current)
  }, [videoObj])

  useEffect(() => {
    switch (true) {
      case currentPacketsLost === null:
        return setRadioIcon(radio_0)
      case currentPacketsLost! > 100:
        return setRadioIcon(radio_1)
      case currentPacketsLost! > 50:
        return setRadioIcon(radio_2)
      case currentPacketsLost! > 20:
        return setRadioIcon(radio_3)
      case currentPacketsLost! > 0:
        return setRadioIcon(radio_4)
      case currentPacketsLost === 0:
        return setRadioIcon(radio_5)
    }
  }, [currentPacketsLost])

  return <img src={radioIcon} alt="接続強度" />
}
