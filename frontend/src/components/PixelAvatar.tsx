import { HAIR_COLORS, OUTFIT_COLORS, SKINS, type AvatarConfig } from '../lib/avatar';
import { useProfile } from '../hooks/useProfile';

// Peças trocáveis, desenhadas sobre a personagem original (mesma grade 80×88 e mesmas proporções)
const HAIR: Record<AvatarConfig['hairStyle'], string> = {
  long: 'M27 16h28v32H23V25h4Z',
  short: 'M25 16h30v22H25Z',
  braids: 'M27 16h26v14H27Z M23 24h6v30h-6Zm28 0h6v30h-6Z',
  curly: 'M21 14h38v28H21Z M19 20h4v16h-4Zm38 0h4v16h-4Z',
  bun: 'M27 16h26v14H27Z M33 4h14v10H33Z',
};
const BOOTS = '#846853';

/** Personagem do jogador. Sem `avatar`, usa o personagem salvo no perfil. */
export function PixelAvatar({ className = '', avatar }: { className?: string; avatar?: AvatarConfig }) {
  const [profile] = useProfile();
  const look = avatar ?? profile.avatar;
  const skin = SKINS[look.skin] ?? SKINS[1];
  const hair = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS[look.outfitColor] ?? OUTFIT_COLORS[0];

  return <svg viewBox="0 0 80 88" className={className} shapeRendering="crispEdges" role="img" aria-label="Sua personagem">
    <ellipse cx="40" cy="80" rx="24" ry="5" fill="#809464" opacity=".2"/>

    {/* Roupa: pernas, corpo, braços e detalhes */}
    {look.outfit === 'overalls' && <>
      <path d="M25 64h12v17H23v-6h2Zm18 0h12v11h3v6H43Z" fill={BOOTS}/><path d="M23 45h34v25H23Z" fill={outfit.main}/>
      <path d="M18 47h9v18h-9Zm35 0h9v18h-9Z" fill={skin.arm}/><path d="M26 44h28v10H26Z" fill="#f0dfb4"/><path d="M27 49h5v18h-5Zm21 0h5v18h-5Z" fill={outfit.dark}/>
    </>}
    {look.outfit === 'dress' && <>
      <path d="M27 72h5v6h-5Zm21 0h5v6h-5Z" fill={skin.arm}/><path d="M25 78h9v4h-9Zm21 0h9v4h-9Z" fill={BOOTS}/>
      <path d="M23 45h34v17H23Z M20 60h40v12H20Z" fill={outfit.main}/><path d="M20 70h40v2H20Z" fill={outfit.dark}/>
      <path d="M18 47h9v18h-9Zm35 0h9v18h-9Z" fill={skin.arm}/><path d="M30 44h20v5H30Z" fill="#f0dfb4"/><path d="M23 58h34v2H23Z" fill={outfit.dark}/>
    </>}
    {look.outfit === 'shirt' && <>
      <path d="M25 64h12v17H23v-6h2Zm18 0h12v11h3v6H43Z" fill="#4d6a9a"/><path d="M23 76h14v5H23Zm20 0h15v5H43Z" fill={BOOTS}/>
      <path d="M24 60h32v8H24Z" fill="#4d6a9a"/><path d="M23 45h34v17H23Z" fill={outfit.main}/>
      <path d="M18 53h9v12h-9Zm35 0h9v12h-9Z" fill={skin.arm}/><path d="M18 47h9v7h-9Zm35 0h9v7h-9Z" fill={outfit.main}/><path d="M34 44h12v4H34Z" fill={outfit.dark}/>
    </>}

    {/* Cabelo, rosto, olhos e boca (como na original) */}
    <path d={HAIR[look.hairStyle]} fill={hair}/>
    {look.hairStyle === 'braids' && <path d="M23 50h6v3h-6Zm28 0h6v3h-6Z" fill="#e86a8a"/>}
    {look.hairStyle === 'curly' && <path d="M24 17h3v3h-3Zm9-2h3v3h-3Zm11 1h3v3h-3Zm9 2h3v3h-3ZM21 30h3v3h-3Zm35 2h3v3h-3Z" fill="#ffffff" opacity=".18"/>}
    <path d="M29 25h24v21H29Z" fill={skin.face}/>
    <path d="M32 31h3v4h-3Zm14 0h3v4h-3Z" fill="#594837"/><path d="M38 40h7v2h-7Z" fill="#b87d68"/>

    {look.detail === 'blush' && <path d="M30 37h4v2h-4Zm18 0h4v2h-4Z" fill="#f19a8a"/>}
    {look.detail === 'freckles' && <path d="M31 37h1v1h-1Zm2 1h1v1h-1Zm-2 1h1v1h-1Zm17-2h1v1h-1Zm2 1h1v1h-1Zm-2 1h1v1h-1Z" fill="#a8603f"/>}
    {look.detail === 'glasses' && <g fill="none" stroke="#3b2418" strokeWidth="1"><rect x="30.5" y="29.5" width="7" height="7"/><rect x="43.5" y="29.5" width="7" height="7"/><path d="M37.5 32.5h6"/></g>}

    {/* Chapéu */}
    {look.hat === 'straw' && <><path d="M25 9h29v7h6v8H19v-8h6Z M12 23h55v7H12Z" fill="#e7b84b"/><path d="M20 20h40v5H20Z" fill="#bc8760"/><path d="M50 15h6v6h-6Z" fill={outfit.main}/></>}
    {look.hat === 'cap' && <><path d="M26 12h28v13H26Z" fill={outfit.main}/><path d="M44 22h22v4H44Z" fill={outfit.dark}/><path d="M38 10h4v3h-4Z" fill={outfit.dark}/><path d="M28 14h10v2H28Z" fill="#ffffff" opacity=".25"/></>}
    {look.hat === 'flowers' && <><path d="M26 22h28v3H26Z" fill="#53922d"/><path d="M25 19h5v5h-5Zm16-1h5v5h-5Z" fill="#ee6996"/><path d="M33 18h5v5h-5Zm16 1h5v5h-5Z" fill="#f2c453"/><path d="M27 21h1v1h-1Zm8-1h1v1h-1Zm8 0h1v1h-1Zm8 1h1v1h-1Z" fill="#fff1c7"/></>}
  </svg>;
}
