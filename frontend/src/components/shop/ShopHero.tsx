import { useEffect, useState } from 'react';
import { PixelIcon } from '../PixelIcon';

const PHRASES = ['Bem-vinda ao armazém!', 'Tudo fresquinho hoje!', 'Juntou moedinhas? 🪙', 'Mimos para quem se cuida.', 'Volte sempre!'];
const JARS: [number, number, string][] = [[70, 150, '#ee6996'], [96, 150, '#f2c453'], [122, 150, '#72ad32'], [148, 150, '#5fa8d3'], [70, 194, '#e8954a'], [96, 194, '#9b7fd4'], [122, 194, '#f2c453'], [148, 194, '#bf5837']];

/** Interior do armazém: placa balançando, sininho, prateleiras, caixa registradora e o gato Bigode no balcão */
export function ShopHero({ coins, items, bought, onCreate }: { coins: number | null; items: number; bought: number; onCreate: () => void }) {
  const [phrase, setPhrase] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setPhrase(index => (index + 1) % PHRASES.length), 4200); return () => window.clearInterval(timer); }, []);

  return <section className="shop-hero" aria-labelledby="shop-title">
    <svg className="shop-scene" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
      {/* Papel de parede listrado, lambri e piso xadrez */}
      <rect width="1000" height="240" fill="#e8c48a"/>{Array.from({ length: 34 }, (_, i) => <rect key={i} x={i * 30} width="14" height="240" fill="#dcb377"/>)}
      <rect y="180" width="1000" height="60" fill="#9a6638"/><rect y="178" width="1000" height="4" fill="#6b4426"/>
      <rect y="240" width="1000" height="80" fill="#c9a46a"/>{Array.from({ length: 50 }, (_, i) => <rect key={i} x={(i % 25) * 40 + (Math.floor(i / 25) % 2) * 20} y={240 + Math.floor(i / 25) * 40} width="20" height="40" fill="#b08850" opacity=".7"/>)}

      {/* Janela com sol e sininho da porta */}
      <rect x="230" y="40" width="130" height="110" fill="#6b4426"/><rect x="240" y="50" width="110" height="90" fill="#9fd8f0"/><rect x="293" y="50" width="4" height="90" fill="#6b4426"/><rect x="240" y="93" width="110" height="4" fill="#6b4426"/>
      <rect x="250" y="60" width="18" height="6" fill="#fff" opacity=".6"/><rect x="306" y="104" width="30" height="6" fill="#fff" opacity=".4"/>
      <g className="door-bell"><rect x="398" y="20" width="2" height="16" fill="#57311f"/><rect x="390" y="36" width="18" height="12" fill="#f2c453"/><rect x="388" y="46" width="22" height="3" fill="#a86d1c"/><rect x="397" y="49" width="4" height="4" fill="#a86d1c"/></g>

      {/* Placa ARMAZÉM pendurada no teto */}
      <g className="shop-sign"><rect x="574" y="0" width="2" height="22" fill="#57311f"/><rect x="684" y="0" width="2" height="22" fill="#57311f"/>
        <rect x="550" y="22" width="160" height="40" fill="#57311f"/><rect x="554" y="26" width="152" height="32" fill="#d9a05a"/><rect x="554" y="26" width="152" height="4" fill="#f2c27a"/>
        <text x="630" y="49" textAnchor="middle" className="shop-sign-text">ARMAZÉM</text></g>

      {/* Estante com potes coloridos */}
      <rect x="56" y="110" width="124" height="130" fill="#6b4426"/><rect x="62" y="116" width="112" height="118" fill="#4d2e1c"/>
      {[162, 206].map(y => <rect key={y} x="62" y={y} width="112" height="5" fill="#8a5838"/>)}
      {JARS.map(([x, y, color], i) => <g key={i} className="jar-glint" style={{ animationDelay: `${-i * 0.7}s` }}><rect x={x} y={y - 26} width="20" height="26" fill="#d8f0f6" opacity=".55"/><rect x={x + 2} y={y - 18} width="16" height="16" fill={color}/><rect x={x - 1} y={y - 30} width="22" height="5" fill="#8a5838"/><rect x={x + 3} y={y - 22} width="3" height="8" fill="#fff" opacity=".7"/></g>)}

      {/* Prateleira de sementes à direita */}
      <rect x="800" y="70" width="170" height="8" fill="#6b4426"/><rect x="800" y="130" width="170" height="8" fill="#6b4426"/>
      {[['#72ad32', 812], ['#ee6996', 846], ['#f2c453', 880], ['#bf5837', 914]].map(([color, x], i) => <g key={x as number} className="seed-packet" style={{ animationDelay: `${i * 0.3}s` }}><rect x={x as number} y="38" width="26" height="32" fill="#fff1d6"/><rect x={(x as number) + 4} y="44" width="18" height="14" fill={color as string}/><rect x={(x as number) + 4} y="62" width="18" height="3" fill="#c9a46a"/></g>)}
      {[818, 860, 902, 940].map((x, i) => <g key={x} className="shelf-plant" style={{ animationDelay: `${-i * 0.6}s` }}><rect x={x} y="114" width="16" height="16" fill="#b96845"/><path d={`M${x + 6} 100h4v14h-4Zm-6 4h4v8h-4Zm12 2h4v6h-4Z`} fill="#53922d"/></g>)}

      {/* Balcão, caixa registradora, pote de moedas e o gato Bigode */}
      <g className="shop-cat">
        <rect x="455" y="150" width="54" height="52" fill="#9aa3b2"/><rect x="455" y="150" width="54" height="10" fill="#7d8696"/>
        <rect x="459" y="118" width="46" height="36" fill="#9aa3b2"/><rect x="459" y="110" width="10" height="10" fill="#9aa3b2"/><rect x="495" y="110" width="10" height="10" fill="#9aa3b2"/><rect x="461" y="112" width="6" height="6" fill="#f2a6a6"/><rect x="497" y="112" width="6" height="6" fill="#f2a6a6"/>
        <rect x="465" y="122" width="6" height="2" fill="#7d8696"/><rect x="479" y="120" width="6" height="2" fill="#7d8696"/><rect x="493" y="122" width="6" height="2" fill="#7d8696"/>
        <g className="cat-eyes"><rect x="468" y="132" width="6" height="6" fill="#3b2418"/><rect x="490" y="132" width="6" height="6" fill="#3b2418"/><rect x="469" y="133" width="2" height="2" fill="#fff"/><rect x="491" y="133" width="2" height="2" fill="#fff"/></g>
        <rect x="479" y="140" width="6" height="4" fill="#e8576f"/><rect x="450" y="140" width="14" height="2" fill="#fff"/><rect x="500" y="140" width="14" height="2" fill="#fff"/>
        <rect x="463" y="162" width="38" height="40" fill="#fff1d6"/><rect x="463" y="162" width="38" height="4" fill="#bf5837"/><rect x="476" y="174" width="12" height="8" fill="#f2c453"/>
      </g>
      <rect x="380" y="200" width="300" height="60" fill="#8a5838"/><rect x="380" y="196" width="300" height="8" fill="#b07a4c"/><rect x="380" y="196" width="300" height="2" fill="#d9a05a"/>
      {[400, 480, 560, 640].map(x => <rect key={x} x={x} y="214" width="60" height="38" fill="#7a4a26"/>)}
      <g className="cash-register"><rect x="560" y="162" width="70" height="34" fill="#bf5837"/><rect x="566" y="150" width="58" height="14" fill="#8c3a22"/><rect x="572" y="153" width="46" height="8" fill="#c0e36b"/><text x="595" y="160" textAnchor="middle" className="register-text">$$</text>{[0, 1, 2].map(r => [0, 1, 2, 3].map(c => <rect key={`${r}${c}`} x={568 + c * 14} y={168 + r * 8} width="10" height="5" fill="#fff1d6"/>))}</g>
      <g className="register-drawer"><rect x="556" y="190" width="78" height="8" fill="#8c3a22"/><rect x="590" y="192" width="10" height="3" fill="#f2c453"/></g>
      <g><rect x="410" y="170" width="28" height="26" fill="#d8f0f6" opacity=".6"/><rect x="408" y="166" width="32" height="5" fill="#8a5838"/>{[[414, 186], [424, 182], [418, 178], [430, 188]].map(([x, y], i) => <rect key={i} className="coin-glint" x={x} y={y} width="8" height="6" fill="#f2c453" style={{ animationDelay: `${i * 0.4}s` }}/>)}</g>
      <g className="counter-bell"><rect x="652" y="188" width="16" height="8" fill="#f2c453"/><rect x="658" y="184" width="4" height="4" fill="#a86d1c"/></g>
    </svg>
    <p className="cat-bubble pixel-frame" aria-live="polite" key={phrase}>{PHRASES[phrase]}</p>

    <div className="shop-hero-top">
      <div className="shop-sign-board pixel-frame">
        <p className="eyebrow">Armazém do sítio</p>
        <h1 id="shop-title">Loja</h1>
        <p className="missions-motto">Troque suas moedas por mimos de verdade.</p>
        <button type="button" className="pixel-button primary-button" onClick={onCreate}><PixelIcon name="plus" className="size-2.5"/>Nova recompensa</button>
      </div>
      <dl className="goals-stats">
        <div className="hero-stat pixel-frame"><dt><span className="spin-coin"><PixelIcon name="coin" className="size-3"/></span>Moedas</dt><dd>{coins ?? '–'}</dd></div>
        <div className="hero-stat pixel-frame"><dt>Na vitrine</dt><dd>{items}</dd></div>
        <div className="hero-stat pixel-frame"><dt>Compras</dt><dd>{bought}</dd></div>
      </dl>
    </div>
  </section>;
}
