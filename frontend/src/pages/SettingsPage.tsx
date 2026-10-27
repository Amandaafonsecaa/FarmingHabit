import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from '../lib/toast';
import { MainLayout } from '../layouts/MainLayout';
import { SettingsHero } from '../components/settings/SettingsHero';
import { PixelSwitch } from '../components/settings/PixelSwitch';
import { SettingsGroup, SettingsRow } from '../components/settings/SettingsList';
import { PixelIcon, type PixelIconName } from '../components/PixelIcon';
import { useSettings } from '../hooks/useSettings';
import { useProfile } from '../hooks/useProfile';
import { CharacterCreator } from '../components/profile/CharacterCreator';
import { CollectibleCard } from '../components/profile/CollectibleCard';
import { exportBackup, importBackup } from '../lib/settings';
import { WIPE_FLASH_KEY, WipeDialog } from '../components/settings/WipeDialog';
import { JOURNEY_LENGTH } from '../lib/journey';
import { HARVEST_REWARD, WEEK_BONUS } from '../lib/harvestRewards';
import { loadPlayer, updatePlayerName, type Player } from '../services/api';
import { SignOutButton } from '../components/SignOutButton';
import type { AppPage } from '../types/navigation';

type Section = 'profile' | 'appearance' | 'data' | 'about';
const SECTIONS: { id: Section; label: string; icon: PixelIconName; hint: string }[] = [
  { id: 'profile', label: 'Perfil', icon: 'home', hint: 'Personagem, nome e conta' },
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
  const [avatar, setAvatar] = useState(profile.avatar);
  const [bio, setBio] = useState(profile.bio);
  const [section, setSection] = useState<Section>('profile');
  const [player, setPlayer] = useState<Player | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [name, setName] = useState('');
  const [farm, setFarm] = useState(settings.farmName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summary] = useState(localSummary);
  const [wiping, setWiping] = useState(false);
  // Avisos de ação aparecem como toast
  const setAnnouncement = toast;
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    loadPlayer()
      .then(user => { if (active) { setPlayer(user); setName(user.name); setServerOnline(true); } })
      .catch(() => { if (active) setServerOnline(false); });
    return () => { active = false; };
  }, []);

  // Depois de apagar a página recarrega: volta para "Dados e backup" e mostra o aviso
  useEffect(() => {
    let message: string | null = null;
    try { message = sessionStorage.getItem(WIPE_FLASH_KEY); sessionStorage.removeItem(WIPE_FLASH_KEY); } catch { /* modo privado */ }
    if (message) { setSection('data'); toast(message, 'success'); }
  }, []);

  // Se o perfil mudar por fora (ex.: refez as boas-vindas), o rascunho acompanha
  useEffect(() => { setAvatar(profile.avatar); setBio(profile.bio); }, [profile.avatar, profile.bio]);

  // Só habilita "Salvar" quando algo mudou, como em apps de verdade
  const dirty = (player !== null && name.trim() !== player.name) || farm.trim() !== settings.farmName || bio.trim() !== profile.bio
    || JSON.stringify(avatar) !== JSON.stringify(profile.avatar);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (saving || !dirty) return;
    const trimmedName = name.trim(), trimmedFarm = farm.trim();
    if (!trimmedFarm) { setAnnouncement('Dê um nome para o seu sítio.'); return; }
    if (player && !trimmedName) { setAnnouncement('Seu nome não pode ficar em branco.'); return; }
    setSaving(true);
    try {
      if (player && trimmedName !== player.name) setPlayer(await updatePlayerName(trimmedName));
      updateSettings({ farmName: trimmedFarm });
      updateProfile({ avatar, bio: bio.trim() });
      setSaved(true);
      setAnnouncement('Perfil salvo!');
      window.setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      setAnnouncement(`Não foi possível salvar: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    } finally { setSaving(false); }
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

  return <MainLayout page="settings" onNavigate={onNavigate} world={<SettingsHero playerName={player?.name ?? '…'} farmName={settings.farmName}/>}>
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

          {section === 'profile' && <form onSubmit={saveProfile}>
            {/* Carta colecionável: como o perfil aparece, já com as mudanças ainda não salvas */}
            <CollectibleCard data={{
              name: name.trim() || player?.name || 'Fazendeira', farm: farm.trim() || settings.farmName, bio: bio.trim(), avatar,
              level: player?.level ?? null, xp: player?.xp ?? 0, coins: player?.coins ?? null, goals: summary.goals, since: player?.createdAt ?? null,
            }}/>

            <SettingsGroup title="Personagem" footer="Sua personagem aparece na Casa e como exploradora no mapa das Missões.">
              <div className="settings-creator"><CharacterCreator value={avatar} onChange={setAvatar}/></div>
            </SettingsGroup>

            <SettingsGroup title="Identidade" footer={serverOnline === false ? 'O servidor está fora do ar: o seu nome só pode ser trocado com o backend rodando.' : 'O seu nome aparece no "Olá" da Casa. O nome do sítio aparece na plaquinha da fazenda.'}>
              <SettingsRow label="Seu nome" description="Salvo no servidor." htmlFor="settings-name">
                <input id="settings-name" className="settings-input" value={name} maxLength={40} disabled={!player} onChange={event=>setName(event.target.value)} placeholder="Como o sítio te chama?"/>
              </SettingsRow>
              <SettingsRow label="Nome do sítio" description="Salvo na sua conta." htmlFor="settings-farm">
                <input id="settings-farm" className="settings-input" value={farm} maxLength={30} onChange={event=>setFarm(event.target.value)} placeholder="Ex.: Sítio Girassol"/>
              </SettingsRow>
              <SettingsRow label="Frase do fazendeiro" description="Aparece no seu cartão. Opcional." htmlFor="settings-bio">
                <input id="settings-bio" className="settings-input" value={bio} maxLength={80} onChange={event=>setBio(event.target.value)} placeholder="Ex.: Devagar e sempre 🌱"/>
              </SettingsRow>
            </SettingsGroup>

            <SettingsGroup title="Conta" footer="Seus dados ficam guardados no servidor. Ao sair, este navegador esquece o sítio.">
              <SettingsRow label="E-mail" description="É com ele que você entra."><span className="settings-value">{player?.email ?? '–'}</span></SettingsRow>
              <SettingsRow label="Rever boas-vindas" description="Abre de novo a criação do personagem do começo.">
                <button type="button" className="pixel-button" onClick={()=>updateProfile({ onboarded: false })}>Abrir</button>
              </SettingsRow>
              <SettingsRow label="Sair da conta" description="Volta para a tela de entrada.">
                <SignOutButton/>
              </SettingsRow>
            </SettingsGroup>
            <div className="settings-save-bar">
              {saved && <span className="saved-stamp" aria-hidden="true">SALVO!</span>}
              {dirty && !saving && <span className="settings-dirty">Alterações não salvas</span>}
              <button type="button" className="pixel-button" disabled={!dirty || saving} onClick={()=>{ setName(player?.name ?? ''); setFarm(settings.farmName); setBio(profile.bio); setAvatar(profile.avatar); }}>Desfazer</button>
              <button type="submit" className="pixel-button primary-button" disabled={!dirty || saving} aria-busy={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
            </div>
          </form>}

          {section === 'appearance' && <>
            <SettingsGroup title="Movimento" footer="Se o seu sistema já pede menos movimento, o sítio respeita isso automaticamente.">
              <SettingsRow label="Modo calmo" description="Pausa todas as animações do sítio. Bom para quando você quer foco.">
                <PixelSwitch label="Modo calmo" checked={settings.calmMode} onChange={value=>updateSettings({ calmMode: value })}/>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Efeitos" footer="As mudanças valem na hora, em todas as abas.">
              <SettingsRow label="Celebrações" description="Partículas e moedas pulando ao colher metas, cumprir missões e ganhar XP.">
                <PixelSwitch label="Celebrações" checked={settings.celebrations} onChange={value=>updateSettings({ celebrations: value })}/>
              </SettingsRow>
              <SettingsRow label="Vida no cenário" description="Borboletas, passarinhos, peixes pulando e a galinha do galpão.">
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
              <SettingsRow label="Onde fica guardado" description="Metas, diário, aventuras, baús e preferências ficam salvos na sua conta, no servidor, e voltam sozinhos em qualquer navegador. Só a foto da motivação fica neste navegador."/>
            </SettingsGroup>
            <SettingsGroup title="Backup">
              <SettingsRow label="Baixar backup" description="Salva tudo o que está neste navegador num arquivo .json.">
                <button type="button" className="pixel-button" onClick={downloadBackup}><PixelIcon name="check" className="size-3"/>Baixar</button>
              </SettingsRow>
              <SettingsRow label="Restaurar backup" description="Substitui os dados deste navegador pelos do arquivo.">
                <button type="button" className="pixel-button" onClick={()=>fileRef.current?.click()}><PixelIcon name="plus" className="size-3"/>Escolher arquivo</button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={restoreBackup}/>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Zona do espantalho" tone="danger" footer="Não dá para desfazer. Faça um backup antes.">
              <SettingsRow label="Apagar dados" description="Você escolhe o que vai embora: metas, diário, missões, loja, baús, motivação ou progresso.">
                <button type="button" className="pixel-button danger-button" onClick={()=>setWiping(true)}>Escolher…</button>
              </SettingsRow>
            </SettingsGroup>
            {wiping && <WipeDialog online={player !== null} examples={summary.examples} onBackup={downloadBackup} onClose={()=>setWiping(false)}/>}
          </>}

          {section === 'about' && <>
            <SettingsGroup title="Aplicativo">
              <SettingsRow label="Versão" description="FarmingHabit — um sítio aconchegante para cultivar hábitos."><span className="settings-value">v1.0.0</span></SettingsRow>
              <SettingsRow label="Servidor" description="Onde ficam missões, moedas e nível.">
                <span className={`server-status is-${serverOnline === null ? 'checking' : serverOnline ? 'online' : 'offline'}`}>{serverOnline === null ? 'Verificando…' : serverOnline ? 'Conectado' : 'Fora do ar'}</span>
              </SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Como o jogo funciona">
              <SettingsRow label="Níveis" description="Metas e missões dão XP."><span className="settings-value">100 XP por nível</span></SettingsRow>
              <SettingsRow label="Metas" description={`Cada meta cumprida no dia (uma vez por dia). Meta semanal batida: +${WEEK_BONUS.coins} moedas e +${WEEK_BONUS.xp} XP de bônus.`}><span className="settings-value">+{HARVEST_REWARD.coins} moedas · +{HARVEST_REWARD.xp} XP</span></SettingsRow>
              <SettingsRow label="Missões" description="Pagam bem mais que metas. Você escolhe o tamanho ao criar."><span className="settings-value">15 a 80+ moedas</span></SettingsRow>
              <SettingsRow label="Semana das metas" description="Metas semanais zeram a contagem."><span className="settings-value">Começa na segunda</span></SettingsRow>
              <SettingsRow label="Jornada das missões" description="4 capítulos até salvar a princesa; depois recomeça."><span className="settings-value">{JOURNEY_LENGTH} missões por volta</span></SettingsRow>
            </SettingsGroup>
            <SettingsGroup title="Atalhos">
              <SettingsRow label="Fechar menu e formulários"><kbd className="settings-kbd">Esc</kbd></SettingsRow>
            </SettingsGroup>
          </>}
        </div>
      </section>
    </div>
    <p role="status" className="world-status">{'Toda boa colheita começa com as ferramentas no lugar.'}</p>
  </MainLayout>;
}
