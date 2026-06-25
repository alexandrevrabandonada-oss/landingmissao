interface LaunchActionStripProps {
  participateUrl: string;
  appUrl: string;
  missionUrl: string;
  viralHref?: string;
}

export function LaunchActionStrip({
  participateUrl,
  appUrl,
  missionUrl,
  viralHref = "#sec-viral",
}: LaunchActionStripProps) {
  return (
    <div className="launch-action-strip" role="region" aria-label="Ações rápidas de participação">
      <p className="launch-action-strip__text">A landing chama. O app organiza. A missão transforma escuta em ação.</p>
      <div className="launch-action-strip__actions" role="group" aria-label="Botões de ação rápida">
        <a href={participateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Participar do grupo de voluntários da pré-campanha
        </a>
        <a href={appUrl} className="btn btn-secondary">
          Entrar no app Missão ÉLuta
        </a>
        <a href={missionUrl} className="btn btn-ghost">
          Receber minha primeira missão
        </a>
        <a href={viralHref} className="btn btn-ghost" aria-label="Ir para compartilhar convite">
          Chamar mais 3 pessoas
        </a>
      </div>
    </div>
  );
}
