import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import FoxMascot from '../components/FoxMascot'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const navigate = useNavigate()
  const statsRef = useRef<HTMLDivElement>(null)
  const { user, signInWithGoogle } = useAuth()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !(e.target as HTMLElement).dataset.animated) {
          (e.target as HTMLElement).dataset.animated = 'true'
          animateCount('stat1', 68, '%', 1200)
          animateCount('stat2', 3, 'x', 800)
          animateCount('stat3', 200, '+', 1400)
        }
      })
    }, { threshold: 0.3 })
    if (statsRef.current) statsObserver.observe(statsRef.current)
    return () => statsObserver.disconnect()
  }, [])

  function animateCount(id: string, target: number, suffix: string, duration: number) {
    const el = document.getElementById(id)
    if (!el) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      el.innerHTML = `${Math.floor(start)}<span style="color:var(--cyan)">${suffix}</span>`
      if (start >= target) clearInterval(timer)
    }, 16)
  }

  async function handleCTA() {
    if (user) {
      navigate('/dashboard')
    } else {
      await signInWithGoogle()
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{
        position: 'fixed', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)',
        top: -100, left: -100, filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
        animation: 'blobFloat 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
        bottom: 100, right: -80, filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0,
        animation: 'blobFloat 8s ease-in-out infinite',
        animationDelay: '-4s',
      }} />

      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '120px 48px 80px',
        gap: 60,
      }}>
        <div style={{ flex: 1, maxWidth: 600 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(139,92,246,0.35)',
            borderRadius: 100, padding: '6px 14px',
            fontSize: 12, fontWeight: 500, color: 'var(--violet-glow)',
            marginBottom: 28, letterSpacing: '0.5px', textTransform: 'uppercase',
            animation: 'fadeUp 0.8s 0.2s ease both',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--cyan)', animation: 'pulse 2s infinite',
              display: 'inline-block',
            }} />
            ✦ Powered by AI — built for humans
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(44px, 6vw, 76px)',
            fontWeight: 800, lineHeight: 1.0,
            letterSpacing: '-2px',
            animation: 'fadeUp 0.8s 0.3s ease both',
            marginBottom: 8,
          }}>
            Learn only what<br />
            <span style={{
              display: 'block', color: 'transparent',
              background: 'linear-gradient(90deg, var(--violet-bright), var(--cyan-bright))',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
            }}>you don't know.</span>
            <span style={{ display: 'block' }}>Nothing more.</span>
          </h1>

          <p style={{
            fontSize: 18, color: 'var(--muted)', lineHeight: 1.65,
            maxWidth: 480, margin: '24px 0 40px', fontWeight: 300,
            animation: 'fadeUp 0.8s 0.4s ease both',
          }}>
            PathForge analyzes your resume against any job description and builds a{' '}
            <strong style={{ color: 'var(--white)', fontWeight: 500 }}>personalized training roadmap</strong>
            {' '}— so you close skill gaps fast, not someday.
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            animation: 'fadeUp 0.8s 0.5s ease both',
          }}>
            <button
              onClick={handleCTA}
              style={{
                background: 'linear-gradient(135deg, var(--violet) 0%, var(--cyan) 100%)',
                color: 'white', border: 'none',
                padding: '16px 32px', borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, fontSize: 16, cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(124,58,237,0.4)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              {user ? 'Go to Dashboard →' : 'Start your pathway →'}
            </button>
            <button
              onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent', color: 'var(--muted)',
                border: '1px solid var(--border)',
                padding: '16px 28px', borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, fontSize: 15, cursor: 'pointer',
              }}
            >
              ▶ See how it works
            </button>
          </div>
        </div>

        {/* Fox */}
        <div style={{
          flex: '0 0 420px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: -24, borderRadius: '50%',
            border: '1px solid rgba(139,92,246,0.2)',
            animation: 'spinSlow 20s linear infinite',
          }}>
            <div style={{
              position: 'absolute', top: -4, left: '50%',
              transform: 'translateX(-50%)',
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--violet-bright)',
              boxShadow: '0 0 12px var(--violet-bright)',
            }} />
          </div>
          <div style={{
            position: 'absolute', inset: 20,
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)',
            borderRadius: '50%', animation: 'glowPulse 4s ease-in-out infinite',
          }} />
          {[
            { label: '⚡ Python · ML', style: { top: 24, right: -20 }, color: 'rgba(6,182,212,0.4)', text: 'var(--cyan-bright)', delay: '0s' },
            { label: '✦ Gap: 3 skills', style: { bottom: 80, right: -30 }, color: 'rgba(124,58,237,0.4)', text: 'var(--violet-glow)', delay: '-1.5s' },
            { label: '✓ 12 matched', style: { bottom: 40, left: -20 }, color: 'rgba(16,185,129,0.4)', text: '#34d399', delay: '-3s' },
            { label: '🗺 Pathway ready', style: { top: 80, left: -30 }, color: 'var(--border)', text: 'var(--white)', delay: '-2s' },
          ].map((chip) => (
            <div key={chip.label} style={{
              position: 'absolute', zIndex: 3,
              background: 'rgba(15,21,38,0.9)',
              border: `1px solid ${chip.color}`,
              borderRadius: 8, padding: '7px 13px',
              fontSize: 12, fontWeight: 500,
              color: chip.text, whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              animation: `chipFloat 4s ease-in-out infinite`,
              animationDelay: chip.delay,
              ...chip.style,
            }}>
              {chip.label}
            </div>
          ))}
          <FoxMascot size={420} />
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsRef} className="reveal" style={{
        position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1, background: 'var(--border)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          { id: 'stat1', label: 'Avg. reduction in redundant training time' },
          { id: 'stat2', label: 'Faster time-to-competency for new hires' },
          { id: 'stat3', label: 'Skill domains supported across industries' },
        ].map(stat => (
          <div key={stat.id} style={{ background: 'var(--navy)', padding: '36px 40px' }}>
            <div id={stat.id} style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 52, fontWeight: 800, lineHeight: 1,
              letterSpacing: '-2px', marginBottom: 6,
              color: 'var(--white)',
            }}>—</div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '100px 48px' }}>
        <span className="reveal" style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 2,
          textTransform: 'uppercase', color: 'var(--cyan)',
          marginBottom: 16, display: 'block',
        }}>The process</span>
        <h2 className="reveal" style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(32px, 4vw, 52px)',
          fontWeight: 800, letterSpacing: '-1.5px',
          lineHeight: 1.1, marginBottom: 16,
        }}>
          Three steps to your<br />personalized pathway
        </h2>
        <p className="reveal" style={{
          fontSize: 16, color: 'var(--muted)', maxWidth: 480,
          lineHeight: 1.7, fontWeight: 300, marginBottom: 64,
        }}>
          No guesswork. No generic curriculum. Just the exact learning you need, in the right order.
        </p>

        <div className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2, background: 'var(--border)',
          border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
        }}>
          {[
            { num: '01', icon: '📄', title: 'Upload your resume & JD', desc: 'Drop in your resume and the target job description. PathForge extracts every skill, experience level, and competency signal — automatically.' },
            { num: '02', icon: '🧠', title: 'AI maps your skill gap', desc: 'Our engine cross-references what you know against what the role demands. Every gap is scored, prioritized, and mapped to your learning path.' },
            { num: '03', icon: '🗺', title: 'Follow your roadmap', desc: 'Your personalized graph roadmap builds live — node by node. Click any module to see resources, estimated time, and why it matters for your role.' },
          ].map(step => (
            <div key={step.num} style={{
              background: 'var(--navy)', padding: '44px 36px',
              transition: 'background 0.3s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy)')}
            >
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 72, fontWeight: 800,
                color: 'rgba(139,92,246,0.12)',
                lineHeight: 1, marginBottom: 24, letterSpacing: '-3px',
              }}>{step.num}</div>
              <div style={{ fontSize: 22, marginBottom: 20 }}>{step.icon}</div>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20, fontWeight: 700, marginBottom: 12,
              }}>{step.title}</div>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="reveal" style={{
        position: 'relative', zIndex: 1,
        margin: '0 48px 80px',
        borderRadius: 24, overflow: 'hidden',
        background: 'var(--navy2)',
        border: '1px solid rgba(139,92,246,0.25)',
        padding: '80px 64px', textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.14) 0%, transparent 60%)',
        }} />
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(32px, 4vw, 54px)',
          fontWeight: 800, letterSpacing: '-2px',
          lineHeight: 1.1, marginBottom: 20, position: 'relative',
        }}>Ready to forge your path?</h2>
        <p style={{
          fontSize: 17, color: 'var(--muted)',
          maxWidth: 480, margin: '0 auto 40px',
          lineHeight: 1.65, fontWeight: 300, position: 'relative',
        }}>
          Upload your resume and a job description. Your personalized AI roadmap is ready in seconds.
        </p>
        <button
          onClick={handleCTA}
          style={{
            background: 'linear-gradient(135deg, var(--violet) 0%, var(--cyan) 100%)',
            color: 'white', border: 'none',
            padding: '18px 40px', borderRadius: 12,
            fontWeight: 600, fontSize: 17, cursor: 'pointer',
            position: 'relative',
          }}
        >
          {user ? 'Go to Dashboard →' : 'Start free — get started →'}
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '32px 48px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          Path<span style={{ color: 'var(--cyan)' }}>Forge</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Built for ARTPARK CodeForge Hackathon · AI Adaptive Onboarding Engine
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>React · FastAPI · TailwindCSS</p>
      </footer>

      <style>{`
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  )
}