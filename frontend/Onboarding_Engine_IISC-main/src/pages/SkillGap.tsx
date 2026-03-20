import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FoxMascot from '../components/FoxMascot'
import type { AnalysisResult, Skill } from '../api/pathforge'

const priorityColor = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
}

const levelBadge = {
  beginner: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  intermediate: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  advanced: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
}

export default function SkillGap() {
  const navigate = useNavigate()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('analysisResult')
    if (raw) setResult(JSON.parse(raw))
    setTimeout(() => setVisible(true), 100)
  }, [])

  const filteredGaps = result?.gapSkills.filter(s =>
    activeTab === 'all' ? true : s.priority === activeTab
  ) || []

  function handleBuildRoadmap() {
    navigate('/roadmap')
  }

  if (!result) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--muted)' }}>Loading results...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <Navbar />

      <div style={{
        position: 'relative', zIndex: 1,
        padding: '100px 48px 80px',
        maxWidth: 1200, margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.6s ease',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 2,
              textTransform: 'uppercase', color: 'var(--cyan)',
              display: 'block', marginBottom: 12,
            }}>Analysis complete</span>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 800, letterSpacing: '-1.5px',
              lineHeight: 1.1, marginBottom: 12,
            }}>
              Your Skill Gap Report
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>
              Target role: <strong style={{ color: 'var(--white)' }}>{result.targetRole}</strong>
            </p>
          </div>

          {/* Score ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: `conic-gradient(var(--violet-bright) ${result.matchScore * 3.6}deg, var(--navy2) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: 86, height: 86, borderRadius: '50%',
                background: 'var(--navy)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 26, fontWeight: 800, color: 'var(--white)',
                }}>{result.matchScore}%</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Match Score</div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, marginBottom: 48,
        }}>
          {[
            { label: 'Skills matched', value: result.matchedSkills.length, color: '#10b981', icon: '✓' },
            { label: 'Skill gaps found', value: result.gapSkills.length, color: '#ef4444', icon: '!' },
            { label: 'High priority gaps', value: result.gapSkills.filter(s => s.priority === 'high').length, color: '#f59e0b', icon: '⚡' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--navy2)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${stat.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: stat.color,
                border: `1px solid ${stat.color}44`,
              }}>{stat.icon}</div>
              <div>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 28, fontWeight: 800, color: stat.color,
                }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 48 }}>

          {/* Matched skills */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 20,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }} />
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20, fontWeight: 700,
              }}>You already have these</h2>
              <span style={{
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981', fontSize: 12,
                padding: '2px 10px', borderRadius: 100,
                border: '1px solid rgba(16,185,129,0.3)',
              }}>{result.matchedSkills.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.matchedSkills.map((skill, i) => (
                <SkillCard key={i} skill={skill} type="matched" />
              ))}
            </div>
          </div>

          {/* Gap skills */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444', boxShadow: '0 0 8px #ef4444',
              }} />
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700 }}>
                Skills to learn
              </h2>
              <span style={{
                background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                fontSize: 12, padding: '2px 10px', borderRadius: 100,
                border: '1px solid rgba(239,68,68,0.3)',
              }}>{result.gapSkills.length}</span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['all', 'high', 'medium', 'low'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '5px 14px', borderRadius: 100,
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: activeTab === tab ? 'var(--violet)' : 'transparent',
                    color: activeTab === tab ? 'white' : 'var(--muted)',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}
                >{tab === 'all' ? 'All' : `${tab} priority`}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredGaps.map((skill, i) => (
                <SkillCard key={i} skill={skill} type="gap" />
              ))}
            </div>
          </div>
        </div>

        {/* Kira CTA */}
        <div style={{
          background: 'var(--navy2)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20, padding: '32px 40px',
          display: 'flex', alignItems: 'center', gap: 32,
          boxShadow: '0 0 60px rgba(124,58,237,0.1)',
        }}>
          <FoxMascot size={120} style={{ animation: 'none', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22, fontWeight: 800, marginBottom: 8,
            }}>
              I've mapped your complete learning path! 🎯
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              You have <strong style={{ color: '#10b981' }}>{result.matchedSkills.length} skills</strong> already — great foundation!
              Now let's close the <strong style={{ color: '#ef4444' }}>{result.gapSkills.length} gaps</strong> standing between you and the role.
              I've built you a personalized roadmap — let's go!
            </p>
            <button
              onClick={handleBuildRoadmap}
              style={{
                background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                color: 'white', border: 'none',
                padding: '14px 32px', borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fontSize: 16, cursor: 'pointer',
                boxShadow: '0 0 30px rgba(124,58,237,0.4)',
              }}
            >View my learning roadmap →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkillCard({ skill, type }: { skill: Skill, type: 'matched' | 'gap' }) {
  const isMatched = type === 'matched'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--navy2)',
      border: `1px solid ${isMatched ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: 10, padding: '12px 16px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: isMatched ? '#10b981' : (priorityColor[skill.priority || 'low']),
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>{skill.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{skill.category}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isMatched && skill.priority && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '2px 8px', borderRadius: 100,
            background: `${priorityColor[skill.priority]}22`,
            color: priorityColor[skill.priority],
            border: `1px solid ${priorityColor[skill.priority]}44`,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>{skill.priority}</span>
        )}
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 6,
          background: levelBadge[skill.level].bg,
          color: levelBadge[skill.level].color,
          textTransform: 'capitalize',
        }}>{skill.level}</span>
      </div>
    </div>
  )
}