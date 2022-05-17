import { useEffect, useState, useContext } from 'react'
import Modal from 'react-modal'
import { PublisherObjContext } from '../../states/MainContextProvider'

import styles from './ControlAccess.module.scss'
import chimeSound from '../../sounds/chime.wav'
import { ALLOW_ENTER, REQUEST_ENTER } from '../../enums/SignalEventType'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function ControlAccess() {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const { publisherObj } = useContext(PublisherObjContext)

  // 入室申請を受信したら通知音を鳴らしてモーダル表示
  useEffect(() => {
    publisherObj!.session.on('signal:' + REQUEST_ENTER, () => {
      setOpenModal(true)
      const audio = new Audio(chimeSound)
      audio.volume = 0.1
      audio.play()
    })
  }, [publisherObj])

  // 入室許可シグナルを送る
  function allowEnterRoom() {
    publisherObj!.session.signal(
      {
        type: ALLOW_ENTER,
      },
      (err) => {
        if (err) {
          return alert(
            `エラーが発生しました。\nお客様に再度入室をいただくようにお願いします。`
          )
        }
        setOpenModal(false)
      }
    )
  }

  return (
    <Modal
      ariaHideApp={true}
      isOpen={openModal}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
    >
      <section className={styles.innerModal}>
        <h3>お客様が入室されました</h3>

        <button
          type="button"
          className="bell-button py-16"
          onClick={allowEnterRoom}
        >
          入室を許可する
        </button>

        <button
          type="button"
          className="py-16"
          onClick={() => setOpenModal(false)}
        >
          許可しない
        </button>
      </section>
    </Modal>
  )
}
