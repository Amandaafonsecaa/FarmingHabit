import { Fragment, useState, type ChangeEvent, type CSSProperties } from 'react';
import type { Motivation } from '../../services/api';
import { shrinkImage } from '../../lib/image';
import { GameDialog } from '../dialogs/GameDialog';

const MAX_TEXT = 160;
// Inclinações bem leves e alternadas: o giz parece escrito à mão, sem perder a leitura
const WOBBLE = [-1.6, .9, -.4, 1.3, -1, .5, -.7, 1.1];

/** Modal da motivação: a frase do quadro-negro e, se quiser, a foto do porta-retrato */
function MotivationDialog({ motivation, onSave, onClose }: {
  motivation: Motivation; onSave: (changes: { text: string; photo?: string | null }) => Promise<void>; onClose: () => void;
}) {
  const [text, setText] = useState(motivation.text);
  // undefined = mantém a foto atual; string = foto nova; null = remover
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState('');
  const preview = photo === undefined ? motivation.photoUrl : photo;

  async function pickPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try { setPhoto(await shrinkImage(file)); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível ler a imagem.'); }
  }

  async function submit() {
    const phrase = text.trim();
    if (!phrase) { setError('Escreva a sua motivação principal.'); return false; }
    try {
      await onSave({ text: phrase, ...(photo !== undefined && { photo }) });
      onClose();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar. Tente novamente.');
      return false;
    }
  }

  return <GameDialog title="Meu motivo" icon="flame" intro="O que te faz levantar e cumprir as metas? Vai ficar escrito a giz no seu cantinho."
    submitLabel="Salvar" error={error} onSubmit={submit} onClose={onClose}>
    <label className="form-label" htmlFor="motivation-text">Motivação principal
      <textarea id="motivation-text" rows={3} value={text} maxLength={MAX_TEXT} autoFocus onChange={event=>setText(event.target.value)} placeholder="Eu quero me tornar uma pessoa mais saudável, constante e feliz."/>
      <small className="text-right text-xs font-normal text-muted">{text.length}/{MAX_TEXT} caracteres</small>
    </label>
    <div className="form-label">Foto do porta-retrato <span className="optional-tag">(opcional)</span>
      <div className="motivation-photo-field">
        {/* Prévia já dentro de um porta-retrato igual ao da escrivaninha */}
        <span className="mini-frame">{preview ? <img src={preview} alt="Prévia da foto no porta-retrato"/> : <span className="mini-frame-empty" aria-hidden="true"/>}</span>
        <div className="flex flex-wrap gap-2">
          <label className="pixel-button motivation-upload">{preview ? 'Trocar foto' : 'Escolher foto'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event=>{ void pickPhoto(event); }}/></label>
          {preview && <button type="button" className="pixel-button" onClick={()=>setPhoto(null)}>Remover</button>}
        </div>
      </div>
    </div>
  </GameDialog>;
}

/**
 * "Este é o meu motivo": quadro-negro na parede com a frase a giz; escrivaninha com luminária, caderno, lápis e o porta-retrato.
 * O desenho inteiro se encaixa na moldura sem esticar (enquadramento 432×336 em volta dos itens);
 * parede e piso continuam além dele para preencher a sobra. Frase e foto ficam dentro do SVG, então sempre acompanham a escala.
 */
export function MotivationCorner({ motivation, onSave, disabled }: {
  motivation: Motivation | null; onSave: (changes: { text: string; photo?: string | null }) => Promise<void>; disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const current = motivation ?? { text: '', photoUrl: null, createdAt: null, updatedAt: null };
  const open = () => { if (!disabled) setEditing(true); };
  const words = current.text.split(/\s+/).filter(Boolean);
  // Frase longa usa giz mais fino para caber no quadro
  const chalkSize = current.text.length > 100 ? 15 : current.text.length > 45 ? 18 : 22;

  return <section className="motivation-window pixel-frame" aria-labelledby="motivation-heading">
    <h2 id="motivation-heading" className="sr-only">Meu motivo</h2>
    <div className="motivation-stage">
      <button type="button" className={`motivation-pencil ${words.length ? '' : 'is-calling'}`} disabled={disabled} onClick={open} aria-label="Editar meu motivo" title="Editar meu motivo">✎</button>
      <svg className="motivation-art" viewBox="92 4 432 336" preserveAspectRatio="xMidYMax meet" shapeRendering="crispEdges">
        <defs>
          {/* Luz quente da luminária espalhando pela parede e pela mesa */}
          <radialGradient id="lamp-light" cx="300" cy="196" r="330" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffd98a" stopOpacity=".55"/><stop offset=".45" stopColor="#ffc46b" stopOpacity=".18"/><stop offset="1" stopColor="#ffc46b" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g aria-hidden="true">
          {/* Parede de madeira, rodapé e piso: continuam bem além do enquadramento para preencher qualquer moldura */}
          <rect x="-2000" y="-2000" width="4600" height="2312" fill="#6b4a37"/>
          {Array.from({ length: 70 }, (_, i) => <rect key={i} x={-1200 + i * 40} y="-2000" width="2" height="2312" fill="#5c3f2f"/>)}
          <rect x="-2000" y="300" width="4600" height="12" fill="#4a3226"/><rect x="-2000" y="312" width="4600" height="2000" fill="#3b2a20"/>

          {/* Quadro-negro: moldura fina, superfície fosca, poeira de giz e bandejinha */}
          <rect x="104" y="40" width="252" height="164" fill="#a8743f"/><rect x="104" y="40" width="252" height="2" fill="#c9995a"/>
          <rect x="109" y="45" width="242" height="154" fill="#1f2a25"/>
          <rect x="120" y="54" width="70" height="3" fill="#ffffff" opacity=".05"/><rect x="290" y="180" width="50" height="4" fill="#ffffff" opacity=".05"/><rect x="128" y="176" width="34" height="2" fill="#ffffff" opacity=".06"/>
          <rect x="110" y="204" width="240" height="5" fill="#8a5838"/>
          <rect x="300" y="200" width="16" height="4" fill="#f6eedb"/><rect x="322" y="201" width="9" height="3" fill="#f3d9a6"/>
          {/* Preguinho e barbante segurando o quadro */}
          <path d="M230 14h2v2h-2Z M232 16l-72 24h2l70-22Zm0 0l72 24h-2l-70-22Z" fill="#3b2418" opacity=".7"/>

          {/* Escrivaninha pequena: tampo fino, gaveta e pernas delicadas */}
          <rect x="210" y="262" width="300" height="8" fill="#b07a4c"/><rect x="210" y="262" width="300" height="2" fill="#d6a46a"/>
          <rect x="216" y="270" width="288" height="14" fill="#8a5838"/><rect x="336" y="273" width="48" height="8" fill="#9a6538"/><rect x="358" y="276" width="4" height="2" fill="#e3b268"/>
          <rect x="220" y="284" width="6" height="48" fill="#6b4426"/><rect x="494" y="284" width="6" height="48" fill="#6b4426"/>
          <rect x="216" y="332" width="290" height="4" fill="#000000" opacity=".25"/>

          {/* Luminária de mesa (acesa) */}
          <rect x="234" y="258" width="26" height="4" fill="#2c2f36"/><rect x="246" y="214" width="3" height="44" fill="#2c2f36"/>
          <path d="M232 194h30l8 20h-46Z" fill="#c9995a"/><path d="M232 194h30l2 4h-34Z" fill="#e3b268"/>
          <rect x="243" y="214" width="8" height="3" fill="#fff6c2"/>

          {/* Caderno aberto e lápis */}
          <rect x="300" y="256" width="58" height="6" fill="#f3ead6"/><rect x="328" y="255" width="2" height="7" fill="#c9b994"/>
          <rect x="304" y="258" width="20" height="1" fill="#b9ad96"/><rect x="334" y="258" width="18" height="1" fill="#b9ad96"/>
          <rect x="366" y="259" width="30" height="3" fill="#f2c453"/><rect x="396" y="259" width="4" height="3" fill="#e8c48a"/><rect x="400" y="260" width="2" height="1" fill="#3b2418"/><rect x="363" y="259" width="3" height="3" fill="#e8576f"/>

          {/* Porta-retrato: moldura creme fina, de frente, com apoio e sombra na mesa */}
          <rect x="414" y="260" width="62" height="3" fill="#000000" opacity=".22"/>
          <rect x="440" y="246" width="10" height="16" fill="#8a6a3a"/>
          <rect x="418" y="182" width="54" height="80" fill="#8a6a3a"/><rect x="419" y="183" width="52" height="78" fill="#f3e6c8"/>
          <rect x="419" y="183" width="52" height="2" fill="#fffaf0"/>
          <rect x="423" y="187" width="44" height="70" fill="#d9c8a4"/>
        </g>

        {/* Frase escrita a giz no quadro */}
        <foreignObject x="109" y="45" width="242" height="154">
          <button type="button" className={`chalk-board ${words.length ? '' : 'is-empty'}`} disabled={disabled} onClick={open}
            aria-label={words.length ? `Meu motivo: ${current.text}. Editar` : 'Escrever o meu motivo'}>
            <span className="chalk-text" style={{ fontSize: chalkSize }}>{words.length
              // O espaço fica fora da palavra inclinada (dentro de um inline-block ele some)
              ? words.map((word, index) => <Fragment key={index}><span style={{ '--tilt': `${WOBBLE[index % WOBBLE.length]}deg` } as CSSProperties}>{word}</span>{' '}</Fragment>)
              : <><span className="chalk-ask">Qual é o seu motivo?</span><span className="chalk-cta">toque para escrever ✎</span></>}</span>
          </button>
        </foreignObject>

        {/* Foto dentro do porta-retrato (ou só o paspatur vazio) */}
        <foreignObject x="423" y="187" width="44" height="70">
          <button type="button" className={`desk-photo ${current.photoUrl ? '' : 'is-empty'}`} disabled={disabled} onClick={open}
            aria-label={current.photoUrl ? 'Trocar a foto do porta-retrato' : 'Colocar uma foto no porta-retrato'}>
            {current.photoUrl ? <img src={current.photoUrl} alt="Minha foto de motivação"/> : <span aria-hidden="true">+</span>}
          </button>
        </foreignObject>

        <g aria-hidden="true">
          {/* Poeirinha flutuando na luz da luminária */}
          {[[238, 250, 0], [262, 236, 1.6], [284, 252, 3.1], [224, 230, 4.4], [300, 240, 2.3]].map(([x, y, delay]) => <rect key={x} className="dust-mote" x={x} y={y} width="2" height="2" fill="#fff6c2" style={{ animationDelay: `${delay}s` }}/>)}
          {/* Mariposa dando voltinhas em volta da luminária */}
          <g transform="translate(250 196)"><g className="lamp-moth">
            <g className="lamp-moth-wings"><rect x="-4" y="-2" width="3" height="3" fill="#efe4cc"/><rect x="2" y="-2" width="3" height="3" fill="#efe4cc"/></g>
            <rect x="-1" y="-2" width="2" height="4" fill="#6b4426"/>
          </g></g>
          {/* Luz quente por cima de tudo, tremulando de leve */}
          <rect className="lamp-glow" x="-2000" y="-2000" width="4600" height="4340" fill="url(#lamp-light)" pointerEvents="none"/>
        </g>
      </svg>
    </div>
    {editing && <MotivationDialog motivation={current} onSave={onSave} onClose={()=>setEditing(false)}/>}
  </section>;
}
