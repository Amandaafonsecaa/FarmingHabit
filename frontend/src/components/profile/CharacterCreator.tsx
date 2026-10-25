import { useState } from 'react';
import { DETAILS, HAIR_COLORS, HAIR_STYLES, HATS, OUTFITS, OUTFIT_COLORS, SKINS, randomAvatar, type AvatarConfig } from '../../lib/avatar';
import { PixelAvatar } from '../PixelAvatar';

type Tab = 'skin' | 'hair' | 'outfit' | 'hat' | 'detail';
const TABS: { id: Tab; label: string }[] = [{ id: 'skin', label: 'Pele' }, { id: 'hair', label: 'Cabelo' }, { id: 'outfit', label: 'Roupa' }, { id: 'hat', label: 'Chapéu' }, { id: 'detail', label: 'Detalhes' }];

/** Botões de opção com uma miniatura do próprio personagem vestindo aquela opção */
function StyleOptions<T extends string>({ name, options, value, preview, onPick }: {
  name: string; options: { id: T; label: string }[]; value: T; preview: (id: T) => AvatarConfig; onPick: (id: T) => void;
}) {
  return <div className="style-options" role="radiogroup" aria-label={name}>
    {options.map(option => <button key={option.id} type="button" role="radio" aria-checked={value === option.id} className="style-option" onClick={()=>onPick(option.id)}>
      <PixelAvatar avatar={preview(option.id)} className="style-preview"/><span>{option.label}</span>
    </button>)}
  </div>;
}

function Swatches({ name, colors, value, onPick }: { name: string; colors: string[]; value: number; onPick: (index: number) => void }) {
  return <div className="swatches" role="radiogroup" aria-label={name}>
    {colors.map((color, index) => <button key={color} type="button" role="radio" aria-checked={value === index} aria-label={`${name} ${index + 1}`} className="swatch" style={{ background: color }} onClick={()=>onPick(index)}/>)}
  </div>;
}

/** Criador de personagem: prévia grande + abas de categoria, com botão de "surpreenda-me" */
export function CharacterCreator({ value, onChange }: { value: AvatarConfig; onChange: (avatar: AvatarConfig) => void }) {
  const [tab, setTab] = useState<Tab>('hair');
  const [hop, setHop] = useState(0);
  const set = (patch: Partial<AvatarConfig>) => { onChange({ ...value, ...patch }); setHop(count => count + 1); };

  return <div className="character-creator">
    <div className="creator-stage">
      {/* key muda a cada escolha: a personagem dá um pulinho ao trocar de roupa */}
      <div key={hop} className="creator-avatar"><PixelAvatar avatar={value} className="size-full"/></div>
      <span className="creator-grass" aria-hidden="true"/>
      <button type="button" className="pixel-button creator-random" onClick={()=>set(randomAvatar())}>🎲 Surpreenda-me</button>
    </div>

    <div className="creator-panel">
      <div className="creator-tabs" role="tablist" aria-label="Partes do personagem">
        {TABS.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className="creator-tab" onClick={()=>setTab(item.id)}>{item.label}</button>)}
      </div>
      <div className="creator-options" role="tabpanel">
        {tab === 'skin' && <><p className="creator-label">Tom de pele</p><Swatches name="Tom de pele" colors={SKINS.map(item => item.face)} value={value.skin} onPick={skin=>set({ skin })}/></>}
        {tab === 'hair' && <>
          <p className="creator-label">Estilo</p><StyleOptions name="Estilo de cabelo" options={HAIR_STYLES} value={value.hairStyle} preview={hairStyle=>({ ...value, hairStyle, hat: 'none' })} onPick={hairStyle=>set({ hairStyle })}/>
          <p className="creator-label">Cor</p><Swatches name="Cor do cabelo" colors={HAIR_COLORS} value={value.hairColor} onPick={hairColor=>set({ hairColor })}/>
        </>}
        {tab === 'outfit' && <>
          <p className="creator-label">Roupa</p><StyleOptions name="Roupa" options={OUTFITS} value={value.outfit} preview={outfit=>({ ...value, outfit })} onPick={outfit=>set({ outfit })}/>
          <p className="creator-label">Cor</p><Swatches name="Cor da roupa" colors={OUTFIT_COLORS.map(item => item.main)} value={value.outfitColor} onPick={outfitColor=>set({ outfitColor })}/>
        </>}
        {tab === 'hat' && <><p className="creator-label">Na cabeça</p><StyleOptions name="Chapéu" options={HATS} value={value.hat} preview={hat=>({ ...value, hat })} onPick={hat=>set({ hat })}/></>}
        {tab === 'detail' && <><p className="creator-label">Um toque especial</p><StyleOptions name="Detalhe" options={DETAILS} value={value.detail} preview={detail=>({ ...value, detail })} onPick={detail=>set({ detail })}/></>}
      </div>
    </div>
  </div>;
}
