import { useEffect, useRef, useState } from 'react';
import { DEFAULT_AVATAR } from '../../lib/avatar';
import { readSettings, saveSettings } from '../../lib/settings';
import { useProfile } from '../../hooks/useProfile';
import { loadPlayer, updatePlayerName, type Player } from '../../services/api';
import { PixelAvatar } from '../PixelAvatar';
import { CharacterCreator } from './CharacterCreator';

const STEPS = ['Quem é você?', 'Seu personagem', 'Tudo pronto!'];

/**
 * Primeira visita: nome, sítio e personagem. Hoje faz o papel da "criação de conta";
 * quando o login existir, estes mesmos passos entram no cadastro.
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
      if (player && name.trim() && name.trim() !== player.name) await updatePlayerName(player.id, name.trim());
    } catch { /* servidor fora do ar: o nome pode ser trocado depois em Configurações */ }
    saveSettings({ ...readSettings(), farmName: farm.trim() || readSettings().farmName });
    updateProfile({ avatar, onboarded: true });
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
      {step === 2 && <div className="welcome-done">
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
