import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import FoxMascot from '../components/FoxMascot'
import { useAnalyses, relativeTime, type StoredAnalysis } from '../hooks/useAnalysisStore'

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' }

export default function Dashboard() {
  const navigate              = useNavigate()
  const { user }              = useAuth()
  const { analyses, loading } = useAnalyses(user?.uid ?? null)
  const [visible,  setVisible]  = useState(false)
  const [selected, setSelected] = useState<StoredAnalysis | null>(null)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  useEffect(() => {
    if (analyses.length > 0 && !selected) setSelected(analyses[0])
  }, [analyses])

  const firstName = user?.displayName?.split(' ')[0] || 'there'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // FIX: pass matchedSkills (stored in Firestore) alongside gapSkills and meta
  function buildSessionPayload(analysis: StoredAnalysis) {
    return {
      gapSkills:     analysis.gapSkills,
      // matchedSkills is stored in Firestore — use it if available, else []
      matchedSkills: (analysis as any).matchedSkills ?? [],
      targetRole:    analysis.targetRole,
      matchScore:    analysis.matchScore,
      candidateName: user?.displayName || 'Candidate',
    }
  }

  function openRoadmap(analysis: StoredAnalysis) {
    sessionStorage.setItem('analysisResult', JSON.stringify(buildSessionPayload(analysis)))
    navigate(`/roadmap?id=${analysis.id}`)
  }

  function openSkillGap(analysis: StoredAnalysis) {
    sessionStorage.setItem('analysisResult', JSON.stringify(buildSessionPayload(analysis)))
    navigate('/skillgap')
  }

  const scoreColor = (s: number) => s >= 70 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── SIDEBAR ── */}
      <div style={{ width: 220, background: 'var(--navy2)', borderRight: '1px solid var(--border)', padding: '28px 0', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, padding: '0 22px 28px', borderBottom: '1px solid var(--border)', marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          Path<span style={{ color: 'var(--cyan)' }}>Forge</span>
        </div>

        {[
          { icon: '⬛', label: 'Dashboard',    path: '/dashboard' },
          { icon: '🗺',  label: 'My Roadmap',  path: '/roadmap'   },
          { icon: '📊',  label: 'Skill Gap',   path: '/skillgap'  },
          { icon: '➕',  label: 'New Analysis', path: '/upload'    },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 22px', background: item.path === '/dashboard' ? 'rgba(124,58,237,0.12)' : 'transparent', border: 'none', borderLeft: item.path === '/dashboard' ? '3px solid var(--violet-bright)' : '3px solid transparent', color: item.path === '/dashboard' ? 'var(--white)' : 'var(--muted)', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s' }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', padding: '20px 22px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)' }} />
          )}
          <div>
            <div style={{ fontSize: 13, color: 'var(--white)', fontWeight: 500 }}>{firstName}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{analyses.length} analyses</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ marginLeft: 220, flex: 1, padding: '48px 40px', opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            {greeting()}, {firstName} 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            {analyses.length > 0
              ? `You have ${analyses.length} analysis${analyses.length > 1 ? 'ses' : ''} saved.`
              : 'Run your first analysis to get started.'}
          </p>
        </div>

        {/* Empty state */}
        {!loading && analyses.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 24 }}>
            <FoxMascot size={180} />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>No analyses yet</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>Upload a resume and paste a job description to get started.</p>
              <button onClick={() => navigate('/upload')} style={{ background: 'linear-gradient(135deg, var(--violet), var(--cyan))', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                🚀 Start first analysis
              </button>
            </div>
          </div>
        )}

        {analyses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28, alignItems: 'start' }}>

            {/* Analysis list */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>All Analyses</h2>
                <button onClick={() => navigate('/upload')} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--violet-glow)', padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>+ New</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading
                  ? [1,2,3].map(i => <div key={i} style={{ height: 80, background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 12, animation: 'pulse 1.5s ease infinite' }} />)
                  : analyses.map(a => (
                    <div key={a.id} onClick={() => setSelected(a)}
                      style={{ background: selected?.id === a.id ? 'rgba(124,58,237,0.1)' : 'var(--navy2)', border: `1px solid ${selected?.id === a.id ? 'rgba(139,92,246,0.5)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{a.targetRole}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: scoreColor(a.matchScore), fontFamily: "'Syne', sans-serif" }}>{a.matchScore}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>✓ {a.matchedCount} matched</span>
                        <span style={{ fontSize: 11, color: '#ef4444' }}>✗ {a.gapCount} gaps</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{relativeTime(a.createdAt)}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Selected analysis detail */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--cyan)', display: 'block', marginBottom: 8 }}>{relativeTime(selected.createdAt)}</span>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>{selected.targetRole}</h2>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 13, color: '#10b981' }}>✓ {selected.matchedCount} skills matched</span>
                      <span style={{ fontSize: 13, color: '#ef4444' }}>✗ {selected.gapCount} gaps found</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: `conic-gradient(${scoreColor(selected.matchScore)} ${selected.matchScore * 3.6}deg, var(--navy) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 78, height: 78, borderRadius: '50%', background: 'var(--navy2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: scoreColor(selected.matchScore) }}>{selected.matchScore}%</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Match Score</div>
                  </div>
                </div>

                <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>Skills to learn ({selected.gapCount})</h3>
                    <button onClick={() => openSkillGap(selected)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Full report →</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.gapSkills.slice(0, 6).map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor[(g.priority || 'low') as keyof typeof priorityColor], flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{g.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{g.category}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: `${priorityColor[(g.priority || 'low') as keyof typeof priorityColor]}22`, color: priorityColor[(g.priority || 'low') as keyof typeof priorityColor], border: `1px solid ${priorityColor[(g.priority || 'low') as keyof typeof priorityColor]}44`, textTransform: 'uppercase' }}>
                          {g.priority || 'low'}
                        </span>
                      </div>
                    ))}
                    {selected.gapSkills.length > 6 && (
                      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', paddingTop: 4 }}>+{selected.gapSkills.length - 6} more gaps</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => openRoadmap(selected)} style={{ flex: 1, background: 'linear-gradient(135deg, var(--violet), var(--cyan))', color: 'white', border: 'none', padding: '14px 24px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}>
                    🗺 View Learning Roadmap
                  </button>
                  <button onClick={() => navigate('/upload')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '14px 20px', borderRadius: 10, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
