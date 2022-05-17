import { useRecoilValue } from 'recoil'
import camera from '../../images/video.png'
import cameraOff from '../../images/camera-off.png'
import { videoState } from '../../states/atoms'
type Props = {
  onClick: () => void
}

export default function CameraButton({ onClick }: Props) {
  const video = useRecoilValue(videoState)
  return (
    <button type="button" onClick={onClick}>
      {video ? (
        <img src={camera} alt="カメラオン" />
      ) : (
        <img src={cameraOff} alt="カメラオフ" />
      )}
    </button>
  )
}
