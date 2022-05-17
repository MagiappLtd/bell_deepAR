import { useContext, useState } from 'react'
import Modal from 'react-modal'

import forceLeavingBtn from '../../images/users_white.png'
import leaveBtn from '../../images/log-out_white.png'
import { PublisherObjContext } from '../../states/MainContextProvider'
import styles from './ForceLeavingButton.module.scss'
import { FORCE_CUSTOMER_LEAVING } from '../../enums/SignalEventType'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function ForceLeavingButton() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const { publisherObj } = useContext(PublisherObjContext)

  async function forceLeavingRoom() {
    // 強制退出イベントを送信
    publisherObj!.session.signal(
      {
        type: FORCE_CUSTOMER_LEAVING,
      },
      (e) => {
        if (e) {
          return alert(
            `退出処理に失敗しました。\nもう一度お試しいただくか管理者に次のエラー名をお問い合わせください。\nエラー名: ${e.name}`
          )
        }
        alert('強制退出処理に成功しました。')
        setShowModal(false)
      }
    )
  }

  return (
    <>
      <button
        type="button"
        className={styles.leaveBtn}
        onClick={() => setShowModal(true)}
      >
        <img src={forceLeavingBtn} alt="強制退出ボタン" />
      </button>

      <Modal
        ariaHideApp={true}
        isOpen={showModal}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
        onRequestClose={() => setShowModal(false)}
      >
        <section className={styles.innerModal}>
          <p>本当に実行しますか？</p>

          <ul>
            <li>
              通話に参加中の<strong>お客様全員</strong>を退出させます。
            </li>
            <li>ホスト、スタッフは対象ではありません。</li>
          </ul>

          <button
            type="button"
            className={`bell-button py-16 ${styles.leave}`}
            onClick={forceLeavingRoom}
          >
            <img src={leaveBtn} alt="退出させる" />
            退出させる
          </button>

          <button
            type="button"
            className={`py-16 ${styles.cancel}`}
            onClick={() => setShowModal(false)}
          >
            キャンセル
          </button>
        </section>
      </Modal>
    </>
  )
}
