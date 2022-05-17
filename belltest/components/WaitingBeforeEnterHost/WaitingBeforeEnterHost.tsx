import Modal from 'react-modal'

import bowingPerson from '../../images/bowing.png'
import styles from './WaitingBeforeEnterHost.module.scss'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function WaitingBeforeEnterHost() {
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
          <p>開始時間になりましたら、再度読み込みを行い入室してください。</p>
          <a href="" className={`bell-button ${styles.button}`}>
            再読み込みする
          </a>
        </div>
      </section>
    </Modal>
  )
}
