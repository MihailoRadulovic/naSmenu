import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E07B39',
          borderRadius: '22%',
        }}
      >
        {/* Gavran SVG silueta */}
        <svg
          width="340"
          height="340"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Telo */}
          <ellipse cx="48" cy="60" rx="22" ry="17" fill="white" />
          {/* Glava */}
          <circle cx="68" cy="38" r="13" fill="white" />
          {/* Kljun */}
          <polygon points="81,35 96,38 81,42" fill="white" />
          {/* Oko */}
          <circle cx="72" cy="35" r="3" fill="#E07B39" />
          {/* Krilo levo */}
          <ellipse cx="30" cy="57" rx="19" ry="10" transform="rotate(-15 30 57)" fill="white" />
          {/* Rep */}
          <polygon points="27,70 18,88 34,74 37,88 50,74" fill="white" />
          {/* Noga leva */}
          <line x1="44" y1="75" x2="38" y2="88" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="38" y1="88" x2="31" y2="93" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="88" x2="38" y2="95" stroke="white" strokeWidth="3" strokeLinecap="round" />
          {/* Noga desna */}
          <line x1="55" y1="75" x2="60" y2="88" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="60" y1="88" x2="66" y2="93" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="88" x2="59" y2="95" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
