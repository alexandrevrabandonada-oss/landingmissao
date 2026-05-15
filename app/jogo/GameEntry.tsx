"use client";

import dynamic from "next/dynamic";

const GameExperience = dynamic(() => import("@/src/features/game/GameExperience"), {
  ssr: false,
  loading: () => (
    <div className="game-loading card">
      <p className="game-loading__eyebrow">Missão relâmpago</p>
      <h2 className="game-loading__title">Preparando a cidade, o trajeto e a escuta.</h2>
      <p className="game-loading__text">
        O mini-jogo carrega só nesta rota para não pesar a landing.
      </p>
    </div>
  ),
});

type GameEntryProps = {
  refId: string;
  shareUrl: string;
  appUrl: string;
  signupUrl: string;
  missionUrl: string;
  exitUrl: string;
};

export function GameEntry(props: GameEntryProps) {
  return <GameExperience {...props} />;
}
