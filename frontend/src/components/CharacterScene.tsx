import { PixelAvatar } from './PixelAvatar';

/** A personagem no sítio: fica parada na frente de casa, só respirando */
export function CharacterScene() {
  return <g transform="translate(651 365)"><ellipse cx="26" cy="76" rx="30" ry="7" fill="#506f40" opacity=".18"/><g className="farmer-idle"><foreignObject x="-10" y="-9" width="75" height="88"><PixelAvatar className="h-full w-full"/></foreignObject></g></g>;
}
