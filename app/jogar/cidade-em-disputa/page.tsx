import type { Metadata } from 'next';
import GameBeta from '@/src/components/game-beta/GameBeta';
const url='https://www.alexandrevrabandonada.online/jogar/cidade-em-disputa';
export const metadata:Metadata={title:{absolute:'VR: Cidade em Disputa — Beta'},description:'RPG urbano de investigação, memória e território em uma interpretação de Volta Redonda. Beta pública para jogar no navegador.',alternates:{canonical:url},openGraph:{title:'VR: Cidade em Disputa — Beta',description:'Explore a cidade. Encontre histórias. Conecte pistas.',url,images:[{url:'/game-beta/cidade.webp',width:1280,height:720,alt:'Captura real de VR: Cidade em Disputa'}]},twitter:{card:'summary_large_image',images:['/game-beta/cidade.webp']}};
export default function Page(){return <GameBeta/>}
