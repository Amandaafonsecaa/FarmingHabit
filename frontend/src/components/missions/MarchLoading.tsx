import { GuideWarrior } from './GuideWarrior';

/**
 * Carregando o quadro: o Capitão Bússola marcha de um lado para o outro da trilha, vira na volta e segue procurando.
 * Com movimento reduzido ele fica parado na trilha.
 */
export function MarchLoading() {
  return <div className="quest-board-note march-loading" role="status">
    <div className="march-track" aria-hidden="true">
      <span className="march-walker"><span className="march-face"><span className="march-step"><GuideWarrior className="size-full"/></span></span></span>
    </div>
    <p>Procurando pergaminhos…</p>
  </div>;
}
