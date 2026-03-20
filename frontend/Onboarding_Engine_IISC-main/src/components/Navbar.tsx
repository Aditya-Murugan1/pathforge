import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, signInWithGoogle, logout } = useAuth()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(10,14,26,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800, fontSize: 22,
          letterSpacing: '-0.5px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
        Path<span style={{ color: 'var(--cyan)' }}>Forge</span>
      </div>

      {/* Nav links */}
      <ul style={{ display: 'flex', alignItems: 'center', gap: 32, listStyle: 'none' }}>
        {['How it works', 'Features', 'About'].map(item => (
          <li key={item}>
            <a href="#" style={{
              color: 'var(--muted)', textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              transition: 'color 0.2s',
            }}>{item}</a>
          </li>
        ))}
      </ul>

      {/* Auth area */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <img
            src={user.photoURL || ''}
            alt={user.displayName || ''}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '2px solid var(--violet-bright)',
              objectFit: 'cover',
            }}
          />
          {/* Name */}
          <span style={{ fontSize: 14, color: 'var(--white)', fontWeight: 500 }}>
            {user.displayName?.split(' ')[0]}
          </span>
          {/* Logout */}
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              padding: '7px 16px', borderRadius: 8,
              fontSize: 13, cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >Sign out</button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          style={{
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            color: 'white', border: 'none',
            padding: '10px 22px', borderRadius: 8,
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          Sign in with Google →
        </button>
      )}
    </nav>
  )
}