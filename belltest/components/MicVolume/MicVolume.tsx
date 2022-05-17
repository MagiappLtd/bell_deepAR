import { useEffect, useState } from 'react'

// import styles from './MicVolume.module.scss'

import micOff from '../../images/mic-off_white.png'
import mic0 from '../../images/mic_white.png'
import mic25 from '../../images/mic_25_percent.png'
import mic50 from '../../images/mic_50_percent.png'
import mic75 from '../../images/mic_75_percent.png'
import mic100 from '../../images/mic_100_percent.png'
import {
  AudioLevelUpdatedEvent,
  Publisher,
  Subscriber,
} from 'opentok-react/types/opentok'

type Props = {
  videoObj: Publisher | Subscriber
}

export default function MicVolume({ videoObj }: Props) {
  const [micIcon, setMicIcon] = useState<string>(micOff)

  useEffect(() => {
    // @ts-ignore
    videoObj.on('audioLevelUpdated', (event: AudioLevelUpdatedEvent) => {
      // @ts-ignore (通話参加中でミュートになった場合)
      if (event.target.stream && !event.target.stream.hasAudio) {
        return setMicIcon(micOff)
      }

      const currentAudioLevel = event.audioLevel
      switch (true) {
        case currentAudioLevel < 0.05:
          return setMicIcon(mic0)
        case currentAudioLevel < 0.3:
          return setMicIcon(mic25)
        case currentAudioLevel < 0.55:
          return setMicIcon(mic50)
        case currentAudioLevel < 0.8:
          return setMicIcon(mic75)
        case currentAudioLevel <= 1:
          return setMicIcon(mic100)
      }
    })

    // アンマウント時にイベント解除
    return () => {
      videoObj.off('audioLevelUpdated')
    }
  }, [videoObj])

  return <img src={micIcon} alt="マイク音量のアイコン" />
}
