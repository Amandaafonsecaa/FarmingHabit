import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { DiaryHero } from '../components/diary/DiaryHero';
import { DiaryBook } from '../components/diary/DiaryBook';
import { MoodCalendar } from '../components/diary/MoodCalendar';
import { MemoryNotes } from '../components/diary/MemoryNotes';
import { MotivationCorner } from '../components/evolution/MotivationCorner';
import { useMotivation } from '../hooks/useMotivation';
import { loadPlayer } from '../services/api';
import { toast } from '../lib/toast';
import { useDiary } from '../hooks/useDiary';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { addDays, amountOn, isDoneOn, toKey } from '../lib/goalLogic';
import type { Mood } from '../lib/diary';
import type { AppPage } from '../types/navigation';

export function DiaryPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const diary = useDiary();
  const { goals, log } = useGoalTracker();
  const today = useToday();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [turn, setTurn] = useState<'next' | 'prev' | null>(null);
  const todayKey = toKey(today);
  const selectedKey = toKey(selected);
  const entry = diary.entryFor(selectedKey);
  // O cantinho da motivação precisa do jogador (a frase fica no servidor)
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => { let active = true; loadPlayer().then(() => { if (active) setPlayerReady(true); }).catch(() => {}); return () => { active = false; }; }, []);
  const motivation = useMotivation(playerReady);

  function open(date: Date) {
    const key = toKey(date);
    if (key > todayKey || key === selectedKey) return;
    setTurn(key > selectedKey ? 'next' : 'prev');
    setSelected(date);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  // Resumo do dia escolhido: metas cultivadas (do canteiro) e aventuras cumpridas (das missões)
  const harvests = goals.filter(goal => amountOn(goal, log, selectedKey) > 0).map(goal => ({ title: goal.title, done: isDoneOn(goal, log, selected) }));
  const adventures = diary.adventures.filter(item => item.date === selectedKey).map(item => item.title);

  // Humor que mais apareceu no mês atual
  const monthPrefix = todayKey.slice(0, 7);
  const counts = new Map<Mood, number>();
  Object.entries(diary.entries).forEach(([key, item]) => { if (key.startsWith(monthPrefix) && item.mood) counts.set(item.mood, (counts.get(item.mood) ?? 0) + 1); });
  const monthMood = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const hour = new Date().getHours();

  return <MainLayout page="diary" onNavigate={onNavigate}
    world={<DiaryHero todayMood={diary.entryFor(todayKey).mood} night={hour >= 18 || hour < 6} dateLabel={new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}
      written={diary.written.length} streak={diary.streak(today)} monthMood={monthMood}/>}>
    <div className="diary-layout">
      {/* Livro e, embaixo, o cantinho da motivação: juntos têm a altura da coluna de humor + memórias */}
      <div className="diary-main">
        <DiaryBook dateKey={selectedKey} date={selected} entry={entry} turn={turn} canNext={selectedKey < todayKey} harvests={harvests} adventures={adventures}
          onChange={patch=>diary.update(selectedKey, patch)} onPrev={()=>open(addDays(selected, -1))} onNext={()=>open(addDays(selected, 1))}/>
        <MotivationCorner motivation={motivation.motivation} disabled={!playerReady}
          onSave={async changes=>{ await motivation.save(changes); toast('Motivação salva! Ela vai estar no quadro todos os dias.'); }}/>
      </div>
      <div className="diary-aside">
        <MoodCalendar month={month} entries={diary.entries} selectedKey={selectedKey} todayKey={todayKey} onSelect={open}
          onMonth={delta=>setMonth(current=>new Date(current.getFullYear(), current.getMonth() + delta, 1))}/>
        <MemoryNotes entries={diary.entries} onOpen={key=>{ const [y, m, d] = key.split('-').map(Number); open(new Date(y, m - 1, d)); }}/>
      </div>
    </div>
    <p role="status" className="world-status">{entry.mood === 'stormy' ? 'Tempestades passam. Seja gentil com você hoje.' : 'Escrever também é cuidar da sua horta por dentro.'}</p>
  </MainLayout>;
}
