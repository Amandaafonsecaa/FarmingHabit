/** Original pixel architecture, on an integer grid shared with the farm. */
export function FarmHouse() {
  return <g transform="translate(435 188)" strokeLinejoin="miter">
    <path d="M-16 180h252v12H-16Z" fill="#36542b" opacity=".3"/>
    {/* Stone footing and sunlit timber siding. */}
    <path d="M0 74h208v108H0Z" fill="#4c3022"/>
    <path d="M5 79h198v89H5Z" fill="#d99848"/>
    <path d="M5 82h198v5H5Zm0 20h198v4H5Zm0 20h198v4H5Zm0 20h198v4H5Zm0 20h198v5H5Z" fill="#a46330"/>
    <path d="M9 87h190v3H9Zm0 20h190v3H9Zm0 20h190v3H9Zm0 20h190v3H9Z" fill="#f4bd68"/>
    <path d="M0 79h9v90H0Zm199 0h9v90h-9Z" fill="#754326"/>
    <path d="M3 169h202v14H3Z" fill="#77766a"/>
    <path d="M8 171h26v7H8Zm31 0h32v7H39Zm37 0h23v7H76Zm64 0h26v7h-26Zm31 0h29v7h-29Z" fill="#b4ad86"/>
    {/* Oversized terracotta roof: stepped silhouette and individually offset shingles. */}
    <path d="M-22 77V64h8V50h8V36h8V22h8V8h8V-4h168V8h8v14h8v14h8v14h8v14h8v18H-22Z" fill="#513022"/>
    <path d="M-15 68V55h8V41h8V27h8V13h8V2h160v11h8v14h8v14h8v14h8v13Z" fill="#bd4c2c"/>
    {[0,1,2,3,4].map(row=><g key={row}>
      <path d={`M${18-row*8} ${5+row*13}h${158+row*16}v4H${18-row*8}Z`} fill="#ed8b48"/>
      <path d={`M${14-row*8} ${15+row*13}h${166+row*16}v3H${14-row*8}Z`} fill="#893d28"/>
      {Array.from({length:7+row},(_,col)=><path key={col} d={`M${20-row*8+col*23+(row%2)*7} ${9+row*13}v6h-3v-6Z`} fill="#9c3c26"/>)}
    </g>)}
    <path d="M-19 72h242v6H-19Z" fill="#f6bc71"/>
    <path d="M-19 78h242v7H-19Z" fill="#6a3924"/>
    <path d="M17-5h164v6H17Z" fill="#f0a65b"/>
    {/* Brick chimney, with a thick stone cap. */}
    <path d="M152-23h27v48h-27Z" fill="#553324"/>
    <path d="M156-20h19v42h-19Z" fill="#b96f4b"/>
    <path d="M156-10h19v3h-19Zm0 13h19v3h-19Zm8-23v10m-3 3V3m7 3v12" stroke="#774632" strokeWidth="2"/>
    <path d="M148-26h35v8h-35Z" fill="#594334"/><path d="M151-26h29v3h-29Z" fill="#d0bb8e"/>
    <path d="M159-44h12v10h-12Zm7-18h15v10h-15Z" fill="#fff3ce" opacity=".75"/>
    {/* Two recessed windows with shutters and flower boxes. */}
    {[22,151].map(x=><g key={x} transform={`translate(${x} 100)`}>
      <path d="M-9-5h49v43H-9Z" fill="#6c3e26"/>
      <path d="M0-2h30v35H0Z" fill="#ffe3a1"/>
      <path d="M3 1h24v28H3Z" fill="#4c8eab"/>
      <path d="M4 2h10v11H4Zm12 13h10v13H16Z" fill="#8ed5db"/>
      <path d="M12 0h4v31h-4ZM2 13h26v4H2Z" fill="#e9bf73"/>
      <path d="M-7-2h5v34h-5Zm39 0h6v34h-6Z" fill="#b57638"/>
      <path d="M-7 6h5m-5 8h5m-5 8h5m34-16h6m-6 8h6m-6 8h6" stroke="#734225" strokeWidth="2"/>
      <path d="M-7 33h45v13H-7Z" fill="#663e25"/><path d="M-5 37h41v7H-5Z" fill="#ba7839"/>
      {[-2,8,19,29].map((flower,i)=><g key={flower}><path d={`M${flower} 29h4v9h-4Z`} fill="#347032"/><path d={`M${flower-2} 25h8v6h-8Z`} fill={i%2?'#ffe168':'#f07891'}/><path d={`M${flower} 26h3v3h-3Z`} fill="#fff0a1"/></g>)}
    </g>)}
    {/* Small gabled porch, oak door, posts and broad wooden steps. */}
    <path d="M81 108h48v65H81Z" fill="#513121"/><path d="M87 112h35v60H87Z" fill="#a96530"/>
    <path d="M91 115h26v22H91Z" fill="#754326"/><path d="M94 118h20v16H94Z" fill="#efbd65"/>
    <path d="M91 144h3v24h-3Zm17 0h3v24h-3Z" fill="#c58a42"/><path d="M114 142h5v5h-5Z" fill="#ffe38a"/>
    <path d="M66 111V96h9V86h10V76h12V66h15v10h12v10h10v10h10v15Z" fill="#543222"/>
    <path d="M73 102v-5h9V87h10V77h17v10h11v10h10v5Z" fill="#da733b"/>
    <path d="M79 99h47v3H79Zm13-12h17v3H92Z" fill="#f4aa59"/>
    <path d="M66 108h78v6H66Z" fill="#f7c97d"/>
    <path d="M70 114h7v58h-7Zm64 0h7v58h-7Z" fill="#694025"/>
    <path d="M72 115h3v54h-3Zm64 0h3v54h-3Z" fill="#e4ad5a"/>
    <path d="M63 172h86v8H63Zm-7 8h100v8H56Zm-7 8h114v8H49Z" fill="#65442c"/>
    <path d="M65 172h82v3H65Zm-7 8h96v3H58Zm-7 8h110v3H51Z" fill="#d4a663"/>
    <path d="M76 175h55v2H76Zm-8 8h69v2H68Zm-8 8h83v2H60Z" fill="#a57640"/>
  </g>;
}
