import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { DiaryHero } from '../components/diary/DiaryHero';
import { DiaryBook } from '../components/diary/DiaryBook';
import { MoodCalendar } from '../components/diary/MoodCalendar';
import { MemoryNotes } from '../components/diary/MemoryNotes';
import { useDiary } from '../hooks/useDiary';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { addDays, amountOn, dailyTarget, isDoneOn, toKey } from '../lib/goalLogic';
import { hasContent, type DiaryEntry, type Mood } from '../lib/diary';
import { diaryGoalToHarvest } from '../lib/diaryGoal';
import { settleCheckin } from '../lib/harvestRewards';
import type { AppPage } from '../types/navigation';

export function DiaryPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const diary = useDiary();
  const { goals, log, setAmount } = useGoalTracker();
  const today = useToday();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [turn, setTurn] = useState<'next' | 'prev' | null>(null);
  const todayKey = toKey(today);
  const selectedKey = toKey(selected);
  const entry = diary.entryFor(selectedKey);
  function open(date: Date) {
    const key = toKey(date);
    if (key > todayKey || key === selectedKey) return;
    setTurn(key > selectedKey ? 'next' : 'prev');
    setSelected(date);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  /**
   * Escreveu algo no diário de hoje: a meta "Escrever no diário", se existe e está ativa, é cumprida na hora,
   * com o check-in de sempre (o servidor confere e paga a colheita). Páginas de outros dias não marcam a meta.
   */
  function change(patch: Partial<DiaryEntry>) {
    diary.update(selectedKey, patch);
    if (selectedKey !== todayKey || !hasContent({ ...entry, ...patch })) return;
    const goal = diaryGoalToHarvest(goals, log, todayKey);
    if (goal) settleCheckin(goal.title, setAmount(goal.id, todayKey, dailyTarget(goal)));
  }

  // Resumo do dia escolhido: metas cultivadas (do canteiro) e aventuras cumpridas (das missões)
  const harvests = goals.filter(goal => amountOn(goal, log, selectedKey) > 0).map(goal => ({ title: goal.title, done: isDoneOn(goal, log, selected) }));
  const adventures = diary.adventures.filter(item => item.date === selectedKey).map(item => item.title);

  // Humor que mais apareceu no mês atual
  const monthPrefix = todayKey.slice(0, 7);
  const counts = new Map<Mood, number>();
  Object.entries(diary.entries).forEach(([key, item]) => { if (key.startsWith(monthPrefix) && item.mood) counts.set(item.mood, (counts.get(item.mood) ?? 0) + 1); });
  const monthMood = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return <MainLayout page="diary" onNavigate={onNavigate}
    world={<DiaryHero todayMood={diary.entryFor(todayKey).mood} dateLabel={new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}
      written={diary.written.length} streak={diary.streak(today)} monthMood={monthMood}/>}>
    <div className="diary-layout">
      <div className="diary-main">
        <DiaryBook dateKey={selectedKey} date={selected} entry={entry} turn={turn} canNext={selectedKey < todayKey} harvests={harvests} adventures={adventures}
          onChange={change} onPrev={()=>open(addDays(selected, -1))} onNext={()=>open(addDays(selected, 1))}/>
      </div>
      <div className="diary-aside">
        <MoodCalendar month={month} entries={diary.entries} selectedKey={selectedKey} todayKey={todayKey} onSelect={open}
          onMonth={delta=>setMonth(current=>new Date(current.getFullYear(), current.getMonth() + delta, 1))}/>
        <MemoryNotes entries={diary.entries} onOpen={key=>{ const [y, m, d] = key.split('-').map(Number); open(new Date(y, m - 1, d)); }}/>
      </div>
    </div>
  </MainLayout>;
}
