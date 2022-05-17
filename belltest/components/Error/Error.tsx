import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { errorState } from '../../states/atoms'
import { useCookie } from 'react-use'

import styles from './Error.module.scss'

type Props = {
  roomName: string
}

export default function Error({ roomName }: Props) {
  // ユーザーに表示する用のテキスト
  const [errorText, setErrorText] = useState<string>('')
  const error = useRecoilValue(errorState)
  const [value, updateCookie, deleteCookie] = useCookie(
    `unknown_error_occurred_${roomName}`
  )

  useEffect(() => {
    switch (true) {
      case error === '':
        return setErrorText('')
      case !!error.match(/OT_MEDIA_ERR_ABORTED/):
        return setErrorText(
          'お使いのイヤホンとの接続に失敗しました。\n再接続、または端末の再起動後にページを再読み込みしてください。\nそれでも通話ができない場合は接客員にお問い合わせください。'
        )
      case !!error.match(/OT_USER_MEDIA_ACCESS_DENIED/):
        return setErrorText(
          'ビデオ, カメラの読み込みに失敗しました。\nお使いのブラウザでこれらが許可されていることをご確認ください。'
        )

      // 原因不明のエラーは一時的なエラーの可能性もあるので一度cookieを使ってリロード
      default:
        if (value) {
          deleteCookie()
          return setErrorText(
            '原因不明のエラーが発生しました。ページの再読み込み、または端末の再起動をしてください。\nそれでも通話ができない場合は接客員にお問い合わせください。'
          )
        }

        // ※有効期限は1日
        updateCookie('1', {
          expires: 1,
        })
        location.reload()
    }
  }, [error])

  return (
    <div className={styles.wrap}>
      {errorText.split('\n').map((_errTxt, i) => (
        <p key={i}>{_errTxt}</p>
      ))}
    </div>
  )
}
