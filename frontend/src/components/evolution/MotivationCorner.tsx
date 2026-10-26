import { useState, type ChangeEvent } from 'react';
import type { Motivation } from '../../services/api';
import { shrinkImage } from '../../lib/image';
import { GameDialog } from '../dialogs/GameDialog';
import { PixelIcon } from '../PixelIcon';

const MAX_TEXT = 160;

/** Modal da motivação: a frase do quadro-negro e, se quiser, a foto do porta-retrato */
function MotivationDialog({ motivation, onSave, onClose }: {
  motivation: Motivation; onSave: (changes: { text: string; photo?: string | null }) => Promise<void>; onClose: () => void;
}) {
  const [text, setText] = useState(motivation.text);
  const [photo, setPhoto] = useState(motivation.photo);
  const [error, setError] = useState('');

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
      // Só manda a foto quando ela mudou (evita reenviar a mesma imagem)
      await onSave({ text: phrase, ...(photo !== motivation.photo && { photo }) });
      onClose();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar. Tente novamente.');
      return false;
    }
  }

  return <GameDialog title="Sua motivação" icon="flame" intro="O que te faz levantar e cumprir as metas? Isso vai ficar no quadro-negro todos os dias."
    submitLabel="Salvar motivação" error={error} onSubmit={submit} onClose={onClose}>
    <label className="form-label" htmlFor="motivation-text">Motivação principal
      <textarea id="motivation-text" rows={3} value={text} maxLength={MAX_TEXT} autoFocus onChange={event=>setText(event.target.value)} placeholder="Ex.: Quero ter energia para brincar com meus filhos"/>
      <small className="text-right text-xs font-normal text-muted">{text.length}/{MAX_TEXT} caracteres</small>
    </label>
    <div className="form-label">Foto do porta-retrato <span className="optional-tag">(opcional)</span>
      <div className="motivation-photo-field">
        <span className="motivation-photo-preview">{photo ? <img src={photo} alt="Foto escolhida"/> : <PixelIcon name="sun" className="size-6"/>}</span>
        <div className="flex flex-wrap gap-2">
          <label className="pixel-button motivation-upload">{photo ? 'Trocar foto' : 'Escolher foto'}<input type="file" accept="image/*" className="sr-only" onChange={event=>{ void pickPhoto(event); }}/></label>
          {photo && <button type="button" className="pixel-button" onClick={()=>setPhoto(null)}>Remover</button>}
        </div>
      </div>
    </div>
  </GameDialog>;
}

/**
 * Cantinho da motivação: escrivaninha com o porta-retrato (a foto da pessoa) e, na parede, o quadro-negro com a frase.
 * As peças em HTML (frase e foto) ficam por cima do desenho, nas mesmas proporções do viewBox 1000×520.
 */
export function MotivationCorner({ motivation, onSave, disabled }: {
  motivation: Motivation | null; onSave: (changes: { text: string; photo?: string | null }) => Promise<void>; disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const current = motivation ?? { text: '', photo: null };
  const open = () => { if (!disabled) setEditing(true); };

  return <section className="world-panel pixel-frame motivation-panel" aria-labelledby="motivation-heading">
    <header className="panel-heading"><h2 id="motivation-heading"><PixelIcon name="flame" className="size-5"/>Sua motivação</h2>
      <button type="button" className="pixel-button motivation-edit" disabled={disabled} onClick={open}><PixelIcon name="plus" className="size-2.5"/>{current.text ? 'Editar' : 'Escrever'}</button></header>
    <div className="motivation-scene">
      <svg viewBox="0 0 1000 520" shapeRendering="crispEdges" aria-hidden="true">
        {/* Parede listrada, rodapé e piso de tábuas */}
        <rect width="1000" height="430" fill="#ead6b0"/>
        {Array.from({ length: 25 }, (_, i) => <rect key={i} x={i * 40} width="18" height="430" fill="#e2cb9f"/>)}
        <rect y="410" width="1000" height="20" fill="#8a5838"/><rect y="410" width="1000" height="4" fill="#a86b35"/>
        <rect y="430" width="1000" height="90" fill="#b07a4c"/>
        {Array.from({ length: 4 }, (_, i) => <rect key={i} y={450 + i * 20} width="1000" height="2" fill="#8a5838"/>)}
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={(i * 97) % 1000} y={432 + (i % 4) * 20} width="2" height="18" fill="#8a5838"/>)}
        <rect x="560" y="456" width="420" height="40" fill="#bf5837"/><rect x="560" y="456" width="420" height="4" fill="#e07a5a"/>{[590, 650, 710, 770, 830, 890, 950].map(x => <rect key={x} x={x} y="470" width="12" height="12" fill="#f2c453"/>)}

        {/* Quadro-negro com moldura de madeira, bandeja e gizes */}
        <rect x="50" y="50" width="490" height="320" fill="#8a5838"/><rect x="56" y="56" width="478" height="308" fill="#a86b35"/>
        <rect x="64" y="64" width="462" height="292" fill="#26302b"/>
        <rect x="76" y="80" width="80" height="3" fill="#3a463f"/><rect x="420" y="330" width="90" height="3" fill="#3a463f"/><rect x="90" y="320" width="40" height="2" fill="#3a463f"/>
        <rect x="60" y="370" width="470" height="12" fill="#8a5838"/><rect x="60" y="370" width="470" height="3" fill="#c9995a"/>
        <rect x="110" y="362" width="22" height="8" fill="#fff6e6"/><rect x="140" y="363" width="14" height="7" fill="#f2c4d2"/><rect x="470" y="362" width="30" height="8" fill="#e8ecef"/>

        {/* Janela e plantinha pendurada */}
        <rect x="640" y="26" width="240" height="108" fill="#57311f"/><rect x="648" y="34" width="224" height="92" fill="#9fd8f0"/><rect x="756" y="34" width="8" height="92" fill="#57311f"/><rect x="656" y="42" width="34" height="8" fill="#ffffff" opacity=".6"/>
        <rect x="944" y="0" width="2" height="60" fill="#57311f"/><rect x="926" y="60" width="38" height="24" fill="#bf5837"/><rect x="920" y="52" width="50" height="12" fill="#4fa851"/><rect x="916" y="64" width="10" height="40" fill="#4fa851"/><rect x="962" y="64" width="10" height="30" fill="#2f7a3f"/>

        {/* Escrivaninha */}
        <rect x="586" y="330" width="378" height="18" fill="#a86b35"/><rect x="586" y="330" width="378" height="4" fill="#c9995a"/>
        <rect x="596" y="348" width="358" height="28" fill="#8a5838"/><rect x="740" y="354" width="70" height="16" fill="#a86b35"/><rect x="768" y="360" width="14" height="4" fill="#f2c453"/>
        <rect x="600" y="376" width="16" height="96" fill="#6b4426"/><rect x="934" y="376" width="16" height="96" fill="#6b4426"/>

        {/* Luminária acesa, livros e caneca */}
        <path d="M612 230h-26l-10 30h46Z" fill="#3f6b55"/><rect x="584" y="258" width="44" height="4" fill="#2f5a46"/>
        <path d="M576 262h60l40 68h-140Z" fill="#fff6c2" opacity=".18" className="motivation-lamp"/>
        <rect x="604" y="262" width="6" height="58" fill="#2c2f36"/><rect x="590" y="318" width="34" height="12" fill="#2c2f36"/>
        <rect x="878" y="312" width="70" height="18" fill="#5f86b8"/><rect x="884" y="296" width="60" height="16" fill="#bf5837"/><rect x="880" y="282" width="64" height="14" fill="#72ad32"/>
        <rect x="878" y="312" width="70" height="3" fill="#8fb0d6"/><rect x="884" y="296" width="60" height="3" fill="#e07a5a"/>
        <rect x="846" y="304" width="22" height="26" fill="#fff1c7"/><rect x="868" y="310" width="6" height="12" fill="#fff1c7"/><rect x="850" y="310" width="14" height="6" fill="#bf5837"/>
        <path className="motivation-steam" d="M852 292h2v-6h2v-4h2v6h-2v4h-2Zm8 0h2v-8h2v-4h2v6h-2v6h-2Z" fill="#ffffff" opacity=".7"/>

        {/* Porta-retrato em pé, com apoio atrás */}
        <rect x="770" y="300" width="10" height="30" fill="#6b4426"/>
        <rect x="690" y="160" width="170" height="170" fill="#a86d1c"/><rect x="696" y="166" width="158" height="158" fill="#f2c453"/>
        <rect x="702" y="172" width="146" height="146" fill="#fff1c7"/>
        <rect x="690" y="160" width="170" height="4" fill="#ffe38b"/>
      </svg>

      {/* Frase no quadro-negro, escrita a giz */}
      <button type="button" className={`motivation-board ${current.text ? '' : 'is-empty'}`} disabled={disabled} onClick={open} aria-label={current.text ? `Motivação: ${current.text}. Editar` : 'Escrever a sua motivação'}>
        <span>{current.text || 'Escreva aqui o que te motiva ✎'}</span>
      </button>
      {/* Foto no porta-retrato */}
      <button type="button" className={`motivation-photo ${current.photo ? '' : 'is-empty'}`} disabled={disabled} onClick={open} aria-label={current.photo ? 'Trocar a foto do porta-retrato' : 'Colocar uma foto no porta-retrato'}>
        {current.photo ? <img src={current.photo} alt=""/> : <span>+ foto</span>}
      </button>
    </div>
    {editing && <MotivationDialog motivation={current} onSave={onSave} onClose={()=>setEditing(false)}/>}
  </section>;
}
