import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#E07B39',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="48" cy="60" rx="22" ry="17" fill="white" />
          <circle cx="68" cy="38" r="13" fill="white" />
          <polygon points="81,35 96,38 81,42" fill="white" />
          <circle cx="72" cy="35" r="3" fill="#E07B39" />
          <ellipse cx="30" cy="57" rx="19" ry="10" transform="rotate(-15 30 57)" fill="white" />
          <polygon points="27,70 18,88 34,74 37,88 50,74" fill="white" />
          <line x1="44" y1="75" x2="38" y2="88" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <line x1="55" y1="75" x2="60" y2="88" stroke="white" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
