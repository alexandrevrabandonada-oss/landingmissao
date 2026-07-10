import styles from "./world.module.css";

interface WorldBootShellProps {
  fullscreen?: boolean;
  hidden?: boolean;
  announce?: boolean;
}

export function WorldBootShell({
  fullscreen = false,
  hidden = false,
  announce = true,
}: WorldBootShellProps) {
  return (
    <div
      className={styles.sceneBoot}
      data-fullscreen={fullscreen}
      data-hidden={hidden}
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
      aria-atomic={announce ? true : undefined}
      aria-hidden={announce ? undefined : true}
    >
      <span className={styles.bootMark} aria-hidden="true" />
      <div className={styles.bootCopy}>
        <small>Distrito 01</small>
        <strong>Entre a Fábrica e o Jardim</strong>
        <p>Preparando o território…</p>
        {fullscreen ? <a href="/explorar?modo=leve">Usar modo leve</a> : null}
      </div>
    </div>
  );
}
