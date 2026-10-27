import { AuthScene } from './AuthScene';

/**
 * Primeiro acesso da conta neste navegador: ainda não há nada guardado aqui para mostrar,
 * então a porteira aparece enquanto os dados da conta chegam (nas próximas aberturas o sítio abre na hora).
 */
export function BootSplash() {
  return <main className="auth-screen" aria-busy="true">
    <AuthScene/>
    <div className="auth-layout">
      <p className="boot-splash" role="status">Abrindo a porteira…</p>
    </div>
  </main>;
}
