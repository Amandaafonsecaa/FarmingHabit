import { useEffect, useRef, useState } from 'react';
import { DEFAULT_AVATAR } from '../../lib/avatar';
import { readSettings, saveSettings } from '../../lib/settings';
import { useProfile } from '../../hooks/useProfile';
import { loadPlayer, updatePlayerName, type Player } from '../../services/api';
import { PixelAvatar } from '../PixelAvatar';
import { CharacterCreator } from './CharacterCreator';
import { ChoiceCards } from '../dialogs/GameDialog';
import { useGoalTracker } from '../../hooks/useGoalTracker';

const STEPS = ['Quem é você?', 'Seu personagem', 'Seu diário', 'Tudo pronto!'];
const DIARY_CHOICES: { value: 'yes' | 'no'; label: string; hint: string }[] = [
  { value: 'yes', label: 'Sim', hint: 'Ele aparece no menu e escrever conta como meta.' },
  { value: 'no', label: 'Não', hint: 'Dá para ligar depois nas Configurações.' },
];

/**
 * Primeira visita de cada conta: nome, sítio e personagem (o jogador já entrou com e-mail e senha).
 */
export function WelcomeWizard() {
  const [profile, updateProfile] = useProfile();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [farm, setFarm] = useState(readSettings().farmName);
  const [avatar, setAvatar] = useState(profile.avatar ?? DEFAULT_AVATAR);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  // Diário opcional: começa em "Não"; "Sim" planta a meta do Diário ao entrar no sítio
  const [diary, setDiary] = useState<'yes' | 'no'>('no');
  const { setDiaryEnabled } = useGoalTracker();
  // Fecha o wizard só depois que a meta do Diário foi gravada (o efeito de gravação do tracker roda antes deste)
  const [entering, setEntering] = useState(false);
  useEffect(() => { if (entering) updateProfile({ avatar, onboarded: true }); }, [entering]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dialogRef.current?.showModal();
    loadPlayer().then(user => { setPlayer(user); setName(user.name); }).catch(() => {});
  }, []);

  function next() {
    if (step === 0 && !farm.trim()) { setError('Dê um nome para o seu sítio.'); return; }
    setError('');
    setStep(current => current + 1);
  }

  async function finish() {
    if (saving) return;
    setSaving(true);
    try {
      if (player && name.trim() && name.trim() !== player.name) await updatePlayerName(name.trim());
    } catch { /* servidor fora do ar: o nome pode ser trocado depois em Configurações */ }
    saveSettings({ ...readSettings(), farmName: farm.trim() || readSettings().farmName });
    if (diary === 'yes') setDiaryEnabled(true);
    setEntering(true);
  }

  const skip = () => updateProfile({ onboarded: true });

  return <dialog ref={dialogRef} className="pixel-dialog pixel-frame game-dialog welcome-dialog" aria-labelledby="welcome-title" onCancel={event=>event.preventDefault()}>
    <header className="panel-heading">
      <h2 id="welcome-title">🌻 Boas-vindas ao sítio!</h2>
      <button type="button" className="welcome-skip" onClick={skip}>Pular</button>
    </header>
    <ol className="welcome-steps" aria-label="Etapas">{STEPS.map((label, index) => <li key={label} className={index < step ? 'is-done' : index === step ? 'is-current' : ''} aria-current={index === step ? 'step' : undefined}><span>{index < step ? '✓' : index + 1}</span>{label}</li>)}</ol>

    <div key={step} className="welcome-body">
      {step === 0 && <div className="space-y-4">
        <p className="text-sm">Antes de começar a cultivar, conta pra gente como te chamar.</p>
        <label className="form-label" htmlFor="welcome-name">Seu nome<input id="welcome-name" value={name} maxLength={40} disabled={!player} onChange={event=>setName(event.target.value)} placeholder={player ? 'Como o sítio te chama?' : 'Servidor fora do ar: dá para trocar depois'}/></label>
        <label className="form-label" htmlFor="welcome-farm">Nome do sítio<input id="welcome-farm" value={farm} maxLength={30} onChange={event=>setFarm(event.target.value)} placeholder="Ex.: Sítio Girassol"/></label>
      </div>}
      {step === 1 && <CharacterCreator value={avatar} onChange={setAvatar}/>}
      {step === 2 && <div className="space-y-4">
        <p className="text-sm font-bold">Quer escrever no diário todo dia?</p>
        <ChoiceCards name="welcome-diary" value={diary} options={DIARY_CHOICES} onChange={setDiary}/>
      </div>}
      {step === 3 && <div className="welcome-done">
        <div className="welcome-hero"><PixelAvatar avatar={avatar} className="welcome-avatar"/><span className="creator-grass" aria-hidden="true"/></div>
        <p className="welcome-done-title">Prontinho, {name.trim() || 'fazendeira'}!</p>
        <p className="text-sm">O <strong>{farm.trim()}</strong> está esperando por você. Plante a primeira meta e parta na primeira aventura.</p>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm font-bold text-[#8c3027]">{error}</p>}
    </div>

    <footer className="welcome-actions">
      {step > 0 && <button type="button" className="pixel-button" onClick={()=>setStep(current => current - 1)}>Voltar</button>}
      {step < STEPS.length - 1
        ? <button type="button" className="pixel-button primary-button" onClick={next}>Continuar</button>
        : <button type="button" className="pixel-button primary-button" disabled={saving} onClick={finish}>{saving ? 'Preparando o sítio...' : 'Entrar no sítio'}</button>}
    </footer>
  </dialog>;
}
