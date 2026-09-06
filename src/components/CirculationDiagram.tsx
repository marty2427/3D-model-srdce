/** Schéma malého a velkého krevního oběhu (SVG s animovaným tokem). */
export function CirculationDiagram() {
  const red = '#ff4d45'
  const blue = '#5b8cff'
  return (
    <svg viewBox="0 0 320 300" className="w-full" role="img" aria-label="Schéma malého a velkého krevního oběhu">
      <style>{`
        .flow { stroke-width: 6; fill: none; stroke-linecap: round; stroke-dasharray: 8 8; animation: dash 1.2s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -16; } }
        .box { fill: #182032; stroke: #263046; }
        .t { fill: #e6ebf5; font: 600 11px system-ui, sans-serif; text-anchor: middle; }
        .s { fill: #94a0b8; font: 10px system-ui, sans-serif; text-anchor: middle; }
      `}</style>
      {/* plíce */}
      <rect x="95" y="12" width="130" height="44" rx="10" className="box" />
      <text x="160" y="31" className="t">PLÍCE</text>
      <text x="160" y="46" className="s">okysličení krve, výdej CO₂</text>
      {/* srdce */}
      <rect x="40" y="120" width="110" height="60" rx="10" className="box" />
      <text x="95" y="143" className="t">PRAVÉ SRDCE</text>
      <text x="95" y="160" className="s">síň → komora</text>
      <rect x="170" y="120" width="110" height="60" rx="10" className="box" />
      <text x="225" y="143" className="t">LEVÉ SRDCE</text>
      <text x="225" y="160" className="s">síň → komora</text>
      {/* tělo */}
      <rect x="95" y="244" width="130" height="44" rx="10" className="box" />
      <text x="160" y="263" className="t">TĚLO (orgány, svaly)</text>
      <text x="160" y="278" className="s">odevzdání kyslíku, sběr CO₂</text>
      {/* malý oběh: pravé srdce → plíce → levé srdce */}
      <path d="M95 120 C 95 80, 110 60, 130 56" className="flow" stroke={blue} />
      <path d="M190 56 C 210 60, 225 80, 225 120" className="flow" stroke={red} />
      {/* velký oběh: levé srdce → tělo → pravé srdce */}
      <path d="M225 180 C 225 220, 210 240, 190 244" className="flow" stroke={red} />
      <path d="M130 244 C 110 240, 95 220, 95 180" className="flow" stroke={blue} />
      {/* popisky */}
      <text x="160" y="95" className="s">MALÝ (plicní) OBĚH</text>
      <text x="160" y="215" className="s">VELKÝ (tělní) OBĚH</text>
      <text x="62" y="90" className="s" fill={blue}>plicnice</text>
      <text x="262" y="90" className="s" fill={red}>plicní žíly</text>
      <text x="262" y="215" className="s" fill={red}>aorta</text>
      <text x="62" y="215" className="s" fill={blue}>duté žíly</text>
    </svg>
  )
}
