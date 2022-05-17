import { useContext } from 'react'
import { useEffect } from 'react'
import Modal from 'react-modal'

import bowingPerson from '../../images/bowing.png'
import { PublisherObjContext } from '../../states/MainContextProvider'
import styles from './WaitingEnter.module.scss'
import { REQUEST_ENTER } from '../../enums/SignalEventType'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function WaitingEnter() {
  const { publisherObj } = useContext(PublisherObjContext)
  useEffect(() => {
    const session = publisherObj!.session

    // 入室リクエスト送信
    session.signal(
      {
        type: REQUEST_ENTER,
      },
      (err) => {
        if (err) {
          alert(
            'エラーが発生しました。\n担当者にお問い合わせいただくか、再度お試しください。'
          )
        }
      }
    )
  }, [publisherObj])

  return (
    <Modal
      ariaHideApp={true}
      isOpen={true}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
    >
      <section className={styles.innerModal}>
        <img className="mb-20" src={bowingPerson} alt="お辞儀" />

        <h3>いらっしゃいませ</h3>

        <div>
          <p>すぐに担当のものが参りますので</p>
          <p>しばらくお待ちください</p>
        </div>
      </section>
    </Modal>
  )
}
