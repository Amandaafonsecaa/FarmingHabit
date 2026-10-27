import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { signIn, signUp } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { prefersCalm } from '../../hooks/useRollingNumber';
import { Toaster } from '../Toaster';
import { AuthScene } from './AuthScene';

type AuthMode = 'signin' | 'signup';
const TABS: { mode: AuthMode; label: string }[] = [{ mode: 'signin', label: 'Entrar' }, { mode: 'signup', label: 'Criar conta' }];

/** Brotinho do selo no topo da plaquinha */
function SproutEmblem() {
  return <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
    <path d="M5 5h2v5H5Z" fill="#3f6b35"/>
    <path d="M1 2h3v1H1Zm0 1h4v2H1Zm1 2h3v1H2Zm6-5h3v1H8ZM7 1h4v2H7Zm0 2h3v1H7Z" fill="#6d9b45"/>
    <path d="M2 3h1v1H2Zm6-2h1v1H8Z" fill="#d3dda0"/>
    <path d="M2 10h8v2H2Z" fill="#8a5838"/><path d="M3 10h6v1H3Z" fill="#b07a4c"/>
  </svg>;
}

/** Ícones pixelados dos campos: carta (e-mail) e cadeado (senha) */
function FieldIcon({ kind }: { kind: 'mail' | 'lock' }) {
  return kind === 'mail'
    ? <svg viewBox="0 0 10 8" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M0 0h10v8H0Z" fill="#3b2418"/><path d="M1 1h8v6H1Z" fill="#fff1c7"/>
      <path d="M1 1h1v1H1Zm1 1h1v1H2Zm1 1h1v1H3Zm1 1h2v1H4Zm2-1h1v1H6Zm1-1h1v1H7Zm1-1h1v1H8Z" fill="#b96845"/>
    </svg>
    : <svg viewBox="0 0 8 10" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 0h4v1H2ZM1 1h1v3H1Zm5 0h1v3H6ZM0 4h8v6H0Z" fill="#3b2418"/>
      <path d="M1 5h6v4H1Z" fill="#e7b84b"/><path d="M1 5h6v1H1Z" fill="#ffe38b"/><path d="M3 6h2v2H3Z" fill="#3b2418"/>
    </svg>;
}

/** Entrada do sítio: plaquinha de madeira no meio da praça, na porteira da fazenda. Erros saem como toast. */
export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const sceneRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<AuthMode, HTMLButtonElement | null>>({ signin: null, signup: null });
  const frame = useRef(0);
  const configured = supabase !== null;

  function switchMode(next: AuthMode) {
    if (next === mode || busy) return;
    setMode(next);
    setConfirm('');
  }

  // Abas acessíveis: setas trocam de aba e levam o foco junto
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = mode === 'signin' ? 'signup' : 'signin';
    switchMode(next);
    tabRefs.current[next]?.focus();
  }

  // Paralaxe leve: céu, morros e árvores acompanham o mouse em velocidades diferentes
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || prefersCalm()) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      sceneRef.current?.style.setProperty('--px', (clientX / window.innerWidth * 2 - 1).toFixed(3));
      sceneRef.current?.style.setProperty('--py', (clientY / window.innerHeight * 2 - 1).toFixed(3));
    });
  }
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) { toast('Preencha e-mail e senha.', 'error'); return; }
    if (mode === 'signup' && password.length < 6) { toast('A senha precisa ter pelo menos 6 caracteres.', 'error'); return; }
    if (mode === 'signup' && password !== confirm) { toast('As senhas não são iguais.', 'error'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        window.location.reload();
        return;
      }
      const signedIn = await signUp(email.trim(), password);
      if (signedIn) { window.location.reload(); return; }
      // Com a confirmação de e-mail ligada no Supabase, a conta só entra depois do link
      toast('Conta criada! Confirme o e-mail que enviamos e depois entre.', 'success');
      setMode('signin');
      setPassword('');
      setConfirm('');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Não foi possível entrar.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return <main ref={sceneRef} className="auth-screen" onPointerMove={onPointerMove}>
    <AuthScene/>

    <div className="auth-layout">
      <section className="auth-card" aria-labelledby="auth-title">
        <span className="auth-nail is-tl" aria-hidden="true"/><span className="auth-nail is-tr" aria-hidden="true"/>
        <span className="auth-nail is-bl" aria-hidden="true"/><span className="auth-nail is-br" aria-hidden="true"/>
        <div className="auth-emblem"><SproutEmblem/></div>

        <header className="auth-heading">
          <h1 id="auth-title">Sítio FarmingHabit</h1>
        </header>

        <div className="auth-body">
          <div className="auth-tabs" role="tablist" aria-label="Entrar ou criar conta" data-mode={mode}>
            <span className="auth-tab-marker" aria-hidden="true"/>
            {TABS.map(tab => <button key={tab.mode} ref={element => { tabRefs.current[tab.mode] = element; }} type="button" role="tab" id={`auth-tab-${tab.mode}`}
              className="auth-tab" aria-selected={mode === tab.mode} aria-controls="auth-panel" tabIndex={mode === tab.mode ? 0 : -1}
              onClick={()=>switchMode(tab.mode)} onKeyDown={onTabKey}>{tab.label}</button>)}
          </div>

          {configured
            ? <form key={mode} id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${mode}`} className={`auth-form is-${mode}`} onSubmit={submit} aria-busy={busy} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-email">E-mail</label>
                <span className="auth-input"><FieldIcon kind="mail"/>
                  <input id="auth-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="voce@exemplo.com" required/>
                </span>
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-password">Senha</label>
                <div className="auth-input-row">
                  <span className="auth-input"><FieldIcon kind="lock"/>
                    <input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6}
                      value={password} onChange={event=>setPassword(event.target.value)} required/>
                  </span>
                  <button type="button" className="pixel-button auth-reveal" aria-pressed={showPassword} aria-controls="auth-password" onClick={()=>setShowPassword(value => !value)}>
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>
              {mode === 'signup' && <div className="auth-field">
                <label className="auth-label" htmlFor="auth-confirm">Repita a senha</label>
                <span className="auth-input"><FieldIcon kind="lock"/>
                  <input id="auth-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} value={confirm} onChange={event=>setConfirm(event.target.value)} required/>
                </span>
              </div>}
              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? 'Abrindo a porteira...' : mode === 'signin' ? 'Entrar no sítio' : 'Criar minha conta'}
              </button>
            </form>
            : <p className="auth-config">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env para entrar.</p>}
        </div>
      </section>
    </div>
    <Toaster/>
  </main>;
}
