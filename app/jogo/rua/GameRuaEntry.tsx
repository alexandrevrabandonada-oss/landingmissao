"use client";

import dynamic from "next/dynamic";

const GameRuaExperience = dynamic(() => import("@/src/features/game-rua/GameRuaExperience"), {
  ssr: false,
  loading: () => (
    <div className="runner-loading card">
      <p className="runner-loading__eyebrow">Rua em Movimento</p>
      <h2 className="runner-loading__title">Preparando a rua, as faixas e a escuta.</h2>
      <p className="runner-loading__text">
        O runner carrega só nesta rota para manter a landing leve.
      </p>
    </div>
  ),
});

type GameRuaEntryProps = {
  refId: string;
  debug: boolean;
  playtest: boolean;
  shareUrl: string;
  appUrl: string;
  signupUrl: string;
  missionUrl: string;
  exitUrl: string;
};

export function GameRuaEntry(props: GameRuaEntryProps) {
  return <GameRuaExperience {...props} />;
}
