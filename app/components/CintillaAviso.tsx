import styles from './CintillaAviso.module.css'

export default function CintillaAviso() {
  return (
    <aside className={styles.cintilla} aria-label="Aviso de dominio">
      <span className={styles.icono}>✨</span>
      <p className={styles.texto}>
        Próximamente nuevo dominio oficial:{" "}
        <strong className={styles.dominio}>www.glamour.tdt.ar</strong>
      </p>
    </aside>
  )
}