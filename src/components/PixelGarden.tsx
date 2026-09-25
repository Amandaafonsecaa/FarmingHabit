export function PixelGarden({ className = '' }: { className?: string }) {
 return <svg className={className} viewBox="0 0 420 230" fill="none" shapeRendering="crispEdges" role="img" aria-label="Pequeno jardim em pixel art com uma casa, árvores e flores">
 <defs><pattern id="grass" width="34" height="28" patternUnits="userSpaceOnUse"><path d="M8 20h3v-4h3v4h3v3H8Z" fill="#9eaf79" opacity=".5"/></pattern></defs>
 <path d="M0 166h420v64H0Z" fill="#c3cf9b"/><path d="M0 172h420v58H0Z" fill="url(#grass)"/>
 <path d="M315 25h24v-8h33v8h16v19h-73Z M34 49h20V39h29v10h22v14H34Z" fill="#fffbee" opacity=".9"/>
 <path d="M280 60h26v26h-26Z" fill="#efd991"/><path d="M274 67h38v12h-38Z" fill="#efd991"/>
 <path d="M43 118h12v63H43Z" fill="#967452"/><path d="M24 81h44v12h12v42H15V98h9Z" fill="#769567"/><path d="M31 70h30v13H31Z M15 99h55v21H15Z" fill="#8da873"/>
 <path d="M355 110h11v67h-11Z" fill="#967452"/><path d="M333 91h55v47h-62v-32h7Z M344 78h32v16h-32Z" fill="#729363"/><path d="M334 96h45v24h-45Z" fill="#8ca572"/>
 <path d="M141 106h114v73H141Z" fill="#e8cea0"/><path d="M149 112h99v7h-99Z M149 143h99v3h-99Z" fill="#dbc192"/>
 <path d="M129 104h138v10H129v-10Zm10-10h117v10H139Zm10-10h97v10h-97Zm10-10h77v10h-77Zm10-10h57v10h-57Zm10-10h37v10h-37Z" fill="#b77556"/>
 <path d="M158 91h88v5h-88Zm16-19h49v5h-49Z" fill="#ce8a65"/><path d="M231 51h13v30h-13Z" fill="#a86c51"/>
 <path d="M189 136h24v43h-24Z" fill="#8b7151"/><path d="M192 139h18v40h-18Z" fill="#ab8b61"/><path d="M204 156h3v4h-3Z" fill="#efdba1"/>
 <path d="M154 128h23v24h-23Zm70 0h20v24h-20Z" fill="#8d9470"/><path d="M157 131h17v18h-17Zm70 0h14v18h-14Z" fill="#cbd9b1"/><path d="M164 129h3v23h-3Zm69 0h3v23h-3Z M155 139h21v3h-21Zm70 0h18v3h-18Z" fill="#fff0c9"/>
 <path d="M188 179h28v11h12v13h17v13h23v14h-91v-15h13v-16h-11v-10h9Z" fill="#e5d4ae"/>
 <path d="M94 153h5v33h-5Zm-21 0h5v33h-5Zm42 0h5v33h-5Z M68 159h58v5H68Zm0 15h58v5H68Z" fill="#eee0b8"/>
 <path d="M290 151h5v33h-5Zm21 0h5v33h-5Zm21 0h5v33h-5Z M285 157h59v5h-59Zm0 14h59v5h-59Z" fill="#eee0b8"/>
 {[ [36,199],[83,213],[137,195],[287,205],[374,199] ].map(([x,y],i)=><g key={x}><path d={`M${x} ${y}v10h3v-10`} fill="#658453"/><path d={`M${x-4} ${y-5}h4v-4h5v4h4v5h-4v4h-5v-4h-4Z`} fill={i%2 ? '#dcad7d':'#f5e2a3'}/><path d={`M${x} ${y-4}h4v4h-4Z`} fill="#b58a55"/></g>)}
 <path d="M265 180h9v-5h13v5h5v11h-27Z" fill="#997d61"/><path d="M270 170h5v11h-5Zm11-2h5v13h-5Z" fill="#997d61"/>
 </svg>;
}
