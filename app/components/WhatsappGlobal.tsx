'use client'
import styles from './WhatsappGlobal.module.css'

export default function WhatsappGlobal() {
  const phone = "5491167914366"
  const text = "Hola Glamour! "
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.float}>
      <img src="/icons/whats.png" alt="WhatsApp" className={styles.icon} />
    </a>
  )
}