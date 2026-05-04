interface LaunchActionStripProps {
  signupUrl: string;
  shareHref?: string;
}

export function LaunchActionStrip({
  signupUrl,
  shareHref = "#sec-viral",
}: LaunchActionStripProps) {
  return (
    <div className="launch-action-strip" role="region" aria-label="Ações rápidas de participação">
      <p className="launch-action-strip__text">Vai ser o primeiro passo da organização.</p>
      <div className="launch-action-strip__actions" role="group" aria-label="Botões de ação rápida">
        <a href={signupUrl} className="btn btn-primary">
          Quero participar
        </a>
        <a href={signupUrl} className="btn btn-secondary">
          Entrar no app
        </a>
        <a href={shareHref} className="btn btn-ghost" aria-label="Ir para compartilhar convite">
          Compartilhar
        </a>
      </div>
    </div>
  );
}
