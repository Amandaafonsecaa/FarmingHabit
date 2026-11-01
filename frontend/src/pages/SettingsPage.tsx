import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { toast } from '../lib/toast';
import { MainLayout } from '../layouts/MainLayout';
import { SettingsHero } from '../components/settings/SettingsHero';
import { PixelSwitch } from '../components/settings/PixelSwitch';
import { SettingsGroup, SettingsRow } from '../components/settings/SettingsList';
import { PixelIcon, type PixelIconName } from '../components/PixelIcon';
import { useSettings } from '../hooks/useSettings';
import { useProfile } from '../hooks/useProfile';
import { CollectibleCard } from '../components/profile/CollectibleCard';
import { ProfileDialog, type ProfileChanges } from '../components/profile/ProfileDialog';
import { useGoalTracker, useToday } from '../hooks/useGoalTracker';
import { playerStreak } from '../lib/goalLogic';
import { areasThisWeek, bestArea } from '../lib/weekMetrics';
import { areaLabel } from '../lib/goalAreas';
import { exportBackup, importBackup } from '../lib/settings';
import { WIPE_FLASH_KEY, WipeDialog } from '../components/settings/WipeDialog';
import { HARVEST_REWARD, WEEK_BONUS } from '../lib/harvestRewards';
import { loadPlayer, updatePlayerName, type Player } from '../services/api';
import type { AppPage } from '../types/navigation';

type Section = 'profile' | 'appearance' | 'data' | 'about';
const SECTIONS: { id: Section; label: string; icon: PixelIconName; hint: string }[] = [
  { id: 'profile', label: 'Perfil', icon: 'home', hint: 'Sua carta e conta' },
  { id: 'appearance', label: 'Aparência', icon: 'sun', hint: 'Animações e efeitos' },
  { id: 'data', label: 'Dados e backup', icon: 'book', hint: 'Guardar, restaurar e limpar' },
  { id: 'about', label: 'Sobre', icon: 'leaf', hint: 'Versão e como o jogo funciona' },
];

const readJson = (key: string) => { try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; } };

/** Resumo do que está guardado neste navegador */
function localSummary() {
  const goals = readJson('farminghabit.goals.v1');
  const diary = readJson('farminghabit.diary.v1') ?? {};
  const adventures = readJson('farminghabit.adventures.v1') ?? [];
  const goalList: { id: string }[] = Array.isArray(goals?.goals) ? goals.goals : [];
  return { goals: goalList.length, examples: goalList.filter(goal => goal.id.startsWith('exemplo-')).length, pages: Object.keys(diary).length, adventures: Array.isArray(adventures) ? adventures.length : 0 };
}

export function SettingsPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const [settings, updateSettings] = useSettings();
  const [profile, updateProfile] = useProfile();
  const [section, setSection] = useState<Section>('profile');
  const [player, setPlayer] = useState<Player | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [editingCard, setEditingCard] = useState(false);
  const [summary] = useState(localSummary);
  const [wiping, setWiping] = useState(false);
  // Avisos de ação aparecem como toast
  const setAnnouncement = toast;
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    loadPlayer()
      .then(user => { if (active) { setPlayer(user); setServerOnline(true); } })
      .catch(() => { if (active) setServerOnline(false); });
    return () => { active = false; };
  }, []);

  // Depois de apagar a página recarrega: volta para "Dados e backup" e mostra o aviso
  useEffect(() => {
    let message: string | null = null;
    try { message = sessionStorage.getItem(WIPE_FLASH_KEY); sessionStorage.removeItem(WIPE_FLASH_KEY); } catch { /* modo privado */ }
    if (message) { setSection('data'); toast(message, 'success'); }
  }, []);

  // A carta mostra a constância: sequência de dias e a área mais cuidada na semana
  const { goals, log } = useGoalTracker();
  const today = useToday();
  const topArea = bestArea(areasThisWeek(goals, log, today));

  /** Único jeito de salvar o perfil: o "Salvar" do modal da carta */
  async function saveCard({ name, farm, avatar }: ProfileChanges) {
    if (player && name !== player.name) setPlayer(await updatePlayerName(name));
    updateSettings({ farmName: farm });
    updateProfile({ avatar });
    setAnnouncement('Carta atualizada!');
  }

  function downloadBackup() {
    const url = URL.createObjectURL(new Blob([exportBackup()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `farminghabit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setAnnouncement('Backup baixado! Guarde o arquivo num lugar seguro.');
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !window.confirm('Restaurar este backup vai substituir as metas, o diário e as preferências deste navegador. Continuar?')) return;
    try {
      importBackup(await file.text());
      window.location.reload();
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'Não foi possível ler o arquivo.');
    }
  }

  const current = SECTIONS.find(item => item.id === section)!;

  return <MainLayout page="settings" onNavigate={onNavigate} world={<SettingsHero/>}>
    <div className="settings-shell">
      {/* Menu de seções (vira abas no celular) */}
      <nav className="settings-nav pixel-frame" aria-label="Seções das configurações">
        <p className="settings-nav-title">Ajustes</p>
        <ul>{SECTIONS.map(item => <li key={item.id}>
          <button type="button" className="settings-nav-item" aria-current={section === item.id ? 'page' : undefined} onClick={()=>setSection(item.id)}>
            <span className="settings-nav-icon"><PixelIcon name={item.icon} className="size-4"/></span>
            <span className="settings-nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>
          </button>
        </li>)}</ul>
      </nav>

      <section className="world-panel pixel-frame settings-content" aria-labelledby="settings-section-title">
        <header className="panel-heading"><h2 id="settings-section-title"><PixelIcon name={current.icon} className="size-5"/>{current.label}</h2><span className="panel-tag">{current.hint}</span></header>
        {/* key por seção: o conteúdo entra com animação ao trocar */}
        <div key={section} className="settings-body">

          {section === 'profile' && <>
            <CollectibleCard onEdit={()=>setEditingCard(true)} data={{
              name: player?.name ?? 'Fazendeira', farm: settings.farmName, avatar: profile.avatar, level: player?.level ?? null, xp: player?.xp ?? 0,
              streak: playerStreak(goals, log, today), area: topArea && topArea.area !== 'nenhuma' ? areaLabel(topArea.area) : null, since: player?.createdAt ?? null,
            }}/>
            <SettingsGroup title="Conta">
              <SettingsRow label="E-mail"><span className="settings-value">{player?.email ?? '–'}</span></SettingsRow>
            </SettingsGroup>
            {editingCard && <ProfileDialog nameLocked={!player} onSave={saveCard} onClose={()=>setEditingCard(false)}
              initial={{ name: player?.name ?? '', farm: settings.farmName, avatar: profile.avatar }}/>}
          </>}

          {section === 'appearance' && <>
            <SettingsGroup title="Movimento">
              <SettingsRow label="Modo calmo" description="Pausa todas as animações.">
                <PixelSwitch label="Modo calmo" checked={settings.calmMode} onChange={value=>updateSettings({ calmMode: value })}/>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Efeitos">
              <SettingsRow label="Celebrações" description="Partículas e moedas ao colher e cumprir.">
                <PixelSwitch label="Celebrações" checked={settings.celebrations} onChange={value=>updateSettings({ celebrations: value })}/>
              </SettingsRow>
              <SettingsRow label="Vida no cenário" description="Borboletas, passarinhos e peixes.">
                <PixelSwitch label="Vida no cenário" checked={settings.critters} onChange={value=>updateSettings({ critters: value })}/>
              </SettingsRow>
            </SettingsGroup>
          </>}

          {section === 'data' && <>
            <SettingsGroup title="Armazenamento" footer="Missões, moedas e nível ficam no servidor e não entram no backup.">
              <ul className="data-crates">
                <li><strong>{summary.goals}</strong><span>metas</span></li>
                <li><strong>{summary.pages}</strong><span>páginas do diário</span></li>
                <li><strong>{summary.adventures}</strong><span>aventuras</span></li>
              </ul>
            </SettingsGroup>
            <SettingsGroup title="Backup">
              <SettingsRow label="Baixar backup">
                <button type="button" className="pixel-button" onClick={downloadBackup}><PixelIcon name="check" className="size-3"/>Baixar</button>
              </SettingsRow>
              <SettingsRow label="Restaurar backup">
                <button type="button" className="pixel-button" onClick={()=>fileRef.current?.click()}><PixelIcon name="plus" className="size-3"/>Escolher arquivo</button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={restoreBackup}/>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Zona do espantalho" tone="danger" footer="Não dá para desfazer. Faça um backup antes.">
              <SettingsRow label="Apagar dados">
                <button type="button" className="pixel-button danger-button" onClick={()=>setWiping(true)}>Escolher…</button>
              </SettingsRow>
            </SettingsGroup>
            {wiping && <WipeDialog online={player !== null} examples={summary.examples} onBackup={downloadBackup} onClose={()=>setWiping(false)}/>}
          </>}

          {section === 'about' && <>
            <SettingsGroup title="Aplicativo">
              <SettingsRow label="Versão"><span className="settings-value">v1.0.0</span></SettingsRow>
              <SettingsRow label="Servidor">
                <span className={`server-status is-${serverOnline === null ? 'checking' : serverOnline ? 'online' : 'offline'}`}>{serverOnline === null ? 'Verificando…' : serverOnline ? 'Conectado' : 'Fora do ar'}</span>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Boas-vindas">
              <SettingsRow label="Rever boas-vindas">
                <button type="button" className="pixel-button" onClick={()=>updateProfile({ onboarded: false })}>Abrir</button>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Como o jogo funciona">
              <SettingsRow label="Níveis"><span className="settings-value">100 XP por nível</span></SettingsRow>
              <SettingsRow label="Metas" description={`Semana batida: +${WEEK_BONUS.coins} moedas · +${WEEK_BONUS.xp} XP`}><span className="settings-value">+{HARVEST_REWARD.coins} moedas · +{HARVEST_REWARD.xp} XP</span></SettingsRow>
              <SettingsRow label="Missões" description="Você escolhe o tamanho ao criar."><span className="settings-value">15 a 80+ moedas</span></SettingsRow>
              <SettingsRow label="Semana das metas"><span className="settings-value">Começa na segunda</span></SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Atalhos">
              <SettingsRow label="Fechar menu e formulários"><kbd className="settings-kbd">Esc</kbd></SettingsRow>
            </SettingsGroup>
          </>}
        </div>
      </section>
    </div>
  </MainLayout>;
}
