import { useSetRecoilState } from 'recoil'

// import styles from './SettingButtonPC.module.scss'
import SettingModal from '../SettingModal/SettingModal'
import settingPC from '../../images/setting.png'
import { showModalState } from '../../states/atoms'
import { useContext } from 'react'
import { PublisherObjContext } from '../../states/MainContextProvider'

export default function SettingButtonPC() {
  const { publisherObj } = useContext(PublisherObjContext)
  const setShowModal = useSetRecoilState(showModalState)

  return (
    <>
      <button type="button" onClick={() => setShowModal(true)}>
        <img src={settingPC} alt="PC用設定ボタン" />
      </button>
      {publisherObj && <SettingModal />}
    </>
  )
}
