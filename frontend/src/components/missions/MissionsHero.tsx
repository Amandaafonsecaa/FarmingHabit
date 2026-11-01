import { useEffect, useState } from 'react';
import { CoinHud } from '../home/CoinHud';
import { GuideDialog } from './GuideDialog';
import { SailingShip } from './SailingShip';
import { loadPlayer } from '../../services/api';

/** Topo das Missões: placa minimalista, contador de moedas e o navio do Capitão no mar */
export function MissionsHero({ completed, openCount = 0, traveling = 0, coins }: {
  completed: number; openCount?: number; traveling?: number; coins: number | null;
}) {
  const [talking, setTalking] = useState(false);
  const [playerName, setPlayerName] = useState('aventureira');
  // Nome do jogador para o Capitão cumprimentar
  useEffect(() => { let active = true; loadPlayer().then(player => { if (active) setPlayerName(player.name); }).catch(() => {}); return () => { active = false; }; }, []);

  return <section className="missions-hero is-sea" aria-labelledby="missions-title">
    <SailingShip onTalk={()=>setTalking(true)}/>
    <div className="missions-hero-top">
      {/* Título acessível, sem placa sobre o cenário */}
<h1 id="missions-title" className="sr-only">Quadro de Missões</h1>
    </div>
    <CoinHud coins={coins}/>
    {talking && <GuideDialog onClose={()=>setTalking(false)} context={{ name: playerName, completed, openMissions: openCount, traveling }}/>}
  </section>;
}
