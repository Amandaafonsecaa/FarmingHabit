/** Chave liga/desliga pixelada: trilho de madeira com uma semente que desliza e brota ao ligar */
export function PixelSwitch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`pixel-switch ${checked ? 'is-on' : ''}`} onClick={()=>onChange(!checked)}>
    <span className="switch-knob" aria-hidden="true"><span className="switch-sprout"/></span>
    <span className="switch-text" aria-hidden="true">{checked ? 'SIM' : 'NÃO'}</span>
  </button>;
}
