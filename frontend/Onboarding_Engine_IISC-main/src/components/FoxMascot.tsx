import foxImg from '../assets/fox.png'

interface FoxMascotProps {
  size?: number
  style?: React.CSSProperties
}

export default function FoxMascot({ size = 420, style }: FoxMascotProps) {
  return (
    <img
      src={foxImg}
      alt="Kira the PathForge fox mascot"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: 'drop-shadow(0 6px 40px rgba(255,140,0,0.6)) drop-shadow(0 0 60px rgba(124,58,237,0.35))',
        animation: 'foxFloat 5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}