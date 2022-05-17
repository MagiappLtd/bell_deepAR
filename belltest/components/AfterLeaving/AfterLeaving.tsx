import { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { isCustomer, UserType } from '../../enums/UserType'

import bowingPerson from '../../images/bowing.png'
import { isOverInnerHeight } from '../../libs'
import styles from './AfterLeaving.module.scss'

Modal.setAppElement('#root') // アプリのルートを指定する必要

export default function AfterLeaving() {
  const [openModal, setOpenModal] = useState<boolean>(true)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [modalElement, setModalElement] = useState<HTMLDivElement>()

  useEffect(() => {
    // 退出後につきroomInfoから取得できないのでローカルストレージから取得
    const _userType = localStorage.getItem('userType') as UserType | null
    localStorage.removeItem('userType')
    setUserType(_userType)
  }, [])

  return (
    <Modal
      ariaHideApp={true}
      isOpen={openModal}
      className={`${styles.modal} ${
        modalElement && isOverInnerHeight(modalElement) && styles.topZero
      }`}
      overlayClassName={styles.modalOverlay}
      contentRef={(elm) => setModalElement(elm)}
    >
      <section className="text-center">
        {!userType || isCustomer(userType) ? (
          <>
            <img className="mb-20" src={bowingPerson} alt="お辞儀" />

            <div className={styles.boldText}>
              <p>本日はブランディアを</p>
              <p>ご利用いただき</p>
              <p>ありがとうございました</p>
            </div>

            <div className="mb-28">
              <p>後ほどLINEより</p>
              <p>メッセージをお送りいたします</p>
            </div>
          </>
        ) : (
          <p className="mb-28">退出しました</p>
        )}

        <button
          type="button"
          className="bell-button py-16"
          onClick={() => setOpenModal(false)}
        >
          画面を閉じる
        </button>
      </section>
    </Modal>
  )
}
