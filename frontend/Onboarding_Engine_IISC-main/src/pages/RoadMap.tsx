import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FoxMascot from '../components/FoxMascot'
import { generateRoadmap } from '../api/pathforge'
import { loadAnalysis } from '../hooks/useAnalysisStore'
import { useAuth } from '../context/AuthContext'
import type { RoadmapNode } from '../api/pathforge'

const typeColors = {
  foundation: { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.5)',  text: '#22d3ee', label: 'Foundation' },
  core:       { bg: 'rgba(124,58,237,0.12)', border: 'rgba(139,92,246,0.5)', text: '#a78bfa', label: 'Core' },
  advanced:   { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.5)', text: '#fbbf24', label: 'Advanced' },
  optional:   { bg: 'rgba(107,114,128,0.12)',border: 'rgba(107,114,128,0.4)',text: '#9ca3af', label: 'Optional' },
}

function parseWeeks(dur: string): number {
  const m = dur.match(/(\d+)/)
  return m ? parseInt(m[1]) : 1
}

function computeLevels(nodes: RoadmapNode[]): Map<string, number> {
  const levelMap = new Map<string, number>()
  const parents  = new Map<string, string[]>()
  nodes.forEach(n => {
    n.children.forEach(cid => {
      if (!parents.has(cid)) parents.set(cid, [])
      parents.get(cid)!.push(n.id)
    })
  })
  function getLevel(id: string, visited = new Set<string>()): number {
    if (levelMap.has(id)) return levelMap.get(id)!
    if (visited.has(id))  return 0
    visited.add(id)
    const ps = parents.get(id) || []
    if (ps.length === 0) { levelMap.set(id, 0); return 0 }
    const lv = Math.max(...ps.map(pid => getLevel(pid, visited))) + 1
    levelMap.set(id, lv)
    return lv
  }
  nodes.forEach(n => getLevel(n.id))
  return levelMap
}

const NODE_W = 210, NODE_H = 94, H_GAP = 36, V_GAP = 88

export default function Roadmap() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const { user }       = useAuth()
  const analysisId     = params.get('id')

  const [nodes,          setNodes]          = useState<RoadmapNode[]>([])
  const [roleLabel,      setRoleLabel]      = useState<string>('')
  const [visibleNodes,   setVisibleNodes]   = useState<Set<string>>(new Set())
  const [selectedNode,   setSelectedNode]   = useState<RoadmapNode | null>(null)
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        let gapSkills: { name: string; priority: string }[] = []
        let role = ''

        if (analysisId && user?.uid) {
          // Load from Firestore by ID (history navigation)
          const stored = await loadAnalysis(user.uid, analysisId)
          if (!stored) {
            setError('Analysis not found. It may have been deleted.')
            setLoading(false)
            return
          }
          gapSkills = stored.gapSkills
          role      = stored.targetRole
        } else {
          // Load from sessionStorage (just completed analysis)
          const raw    = sessionStorage.getItem('analysisResult')
          const result = raw ? JSON.parse(raw) : null
          if (!result?.gapSkills?.length) {
            setError('No analysis data found. Please run a new analysis first.')
            setLoading(false)
            return
          }
          gapSkills = result.gapSkills
          role      = result.targetRole || ''
        }

        setRoleLabel(role)

        const roadmap = await generateRoadmap(gapSkills)
        if (!roadmap?.length) {
          setError('Could not build a roadmap. The backend may be offline.')
          setLoading(false)
          return
        }

        setNodes(roadmap)
        setLoading(false)
        roadmap.forEach((n, i) => {
          setTimeout(() => setVisibleNodes(prev => new Set([...prev, n.id])), i * 100)
        })
      } catch (e) {
        setError(`Failed to load roadmap: ${e instanceof Error ? e.message : 'Unknown error'}`)
        setLoading(false)
      }
    }
    load()
  }, [analysisId, user])

  const layout = useMemo(() => {
    if (!nodes.length) return { svgW: 0, svgH: 0, positions: new Map<string, { x: number; y: number }>() }
    const levelMap = computeLevels(nodes)
    const maxLevel = Math.max(...levelMap.values())
    const levels: RoadmapNode[][] = Array.from({ length: maxLevel + 1 }, () => [])
    nodes.forEach(n => levels[levelMap.get(n.id) ?? 0].push(n))
    const svgW = Math.max(...levels.map(l => l.length * (NODE_W + H_GAP)), 1) + 80
    const svgH = (maxLevel + 1) * (NODE_H + V_GAP) + 80
    const positions = new Map<string, { x: number; y: number }>()
    levels.forEach((lvNodes, lv) => {
      const rowW   = lvNodes.length * NODE_W + (lvNodes.length - 1) * H_GAP
      const startX = (svgW - rowW) / 2
      lvNodes.forEach((n, i) => positions.set(n.id, { x: startX + i * (NODE_W + H_GAP), y: 40 + lv * (NODE_H + V_GAP) }))
    })
    return { svgW, svgH, positions }
  }, [nodes])

  function toggleComplete(id: string) {
    setCompletedNodes(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const totalWeeks = nodes.reduce((a, n) => a + parseWeeks(n.duration), 0)
  const progress   = nodes.length > 0 ? Math.round(completedNodes.size / nodes.length * 100) : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(139,92,246,0.3)', borderTopColor: 'var(--violet-bright)', borderRadius: '50%', animation: 'spinSlow 1s linear infinite' }} />
      <div style={{ color: 'var(--muted)', fontSize: 15 }}>Building your roadmap...</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '32px 40px', textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: '#ef4444', marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>← Back to dashboard</button>
      </div>
    </div>
  )

  const { svgW, svgH, positions } = layout

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, padding: '100px 48px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--cyan)', display: 'block', marginBottom: 12 }}>
              {roleLabel ? `Learning path for ${roleLabel}` : 'Your learning path'}
            </span>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 8 }}>
              Personalized Roadmap
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              {nodes.length} modules · {totalWeeks} weeks total · Click any node for details
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            {Object.entries(typeColors).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: val.bg, border: `1px solid ${val.border}` }} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Progress: {completedNodes.size} / {nodes.length} modules</span>
            <span style={{ fontSize: 13, color: 'var(--cyan)' }}>{progress}% complete</span>
          </div>
          <div style={{ height: 6, background: 'var(--navy2)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--violet), var(--cyan))', borderRadius: 3, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* SVG Graph */}
        <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'auto', padding: 24 }}>
          <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', minWidth: '100%' }}>
            {/* Edges */}
            {nodes.map(node => node.children.map(childId => {
              const p1 = positions.get(node.id)
              const p2 = positions.get(childId)
              if (!p1 || !p2) return null
              const x1 = p1.x + NODE_W / 2, y1 = p1.y + NODE_H
              const x2 = p2.x + NODE_W / 2, y2 = p2.y
              const mid = (y1 + y2) / 2
              const done = completedNodes.has(node.id)
              return (
                <path key={`${node.id}-${childId}`}
                  d={`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`}
                  fill="none"
                  stroke={done ? 'rgba(6,182,212,0.6)' : 'rgba(139,92,246,0.22)'}
                  strokeWidth={done ? 2 : 1.5}
                  strokeDasharray={done ? 'none' : '5 4'} />
              )
            }))}

            {/* Nodes */}
            {nodes.map(node => {
              const pos = positions.get(node.id)
              if (!pos) return null
              const { x, y }  = pos
              const colors    = typeColors[node.type] ?? typeColors.core
              const isVisible = visibleNodes.has(node.id)
              const isDone    = completedNodes.has(node.id)
              const isSel     = selectedNode?.id === node.id
              const isLocked  = node.status === 'locked' && !isDone

              return (
                <g key={node.id} onClick={() => setSelectedNode(isSel ? null : node)}
                  style={{ cursor: 'pointer', opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                  {isSel && <rect x={x-3} y={y-3} width={NODE_W+6} height={NODE_H+6} rx={15} fill={`${colors.text}18`} />}
                  <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={12}
                    fill={isDone ? 'rgba(16,185,129,0.1)' : isLocked ? 'rgba(255,255,255,0.02)' : colors.bg}
                    stroke={isSel ? 'white' : isDone ? '#10b981' : isLocked ? 'rgba(255,255,255,0.08)' : colors.border}
                    strokeWidth={isSel ? 2 : 1} />
                  <rect x={x+10} y={y+10} width={64} height={16} rx={4}
                    fill={isDone ? 'rgba(16,185,129,0.2)' : `${colors.text}20`} />
                  <text x={x+42} y={y+21} textAnchor="middle" dominantBaseline="central"
                    fill={isDone ? '#10b981' : isLocked ? 'rgba(148,163,184,0.35)' : colors.text}
                    fontSize={9} fontWeight={600} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    {isDone ? 'DONE ✓' : isLocked ? 'LOCKED' : colors.label}
                  </text>
                  <text x={x+10} y={y+46} dominantBaseline="central"
                    fill={isDone ? '#10b981' : isLocked ? 'rgba(255,255,255,0.25)' : 'white'}
                    fontSize={12} fontWeight={700}>
                    {node.title.length > 24 ? node.title.slice(0, 24) + '…' : node.title}
                  </text>
                  <text x={x+10} y={y+66} dominantBaseline="central" fill="rgba(148,163,184,0.65)" fontSize={10}>
                    ⏱ {node.duration}
                  </text>
                  {isLocked && !isDone && (
                    <text x={x+NODE_W-22} y={y+NODE_H/2} dominantBaseline="central" textAnchor="middle"
                      fill="rgba(148,163,184,0.25)" fontSize={14}>🔒</text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Detail panel */}
        {selectedNode && (() => {
          const colors = typeColors[selectedNode.type] ?? typeColors.core
          const isDone = completedNodes.has(selectedNode.id)
          return (
            <div style={{ marginTop: 24, background: 'var(--navy2)', border: `1px solid ${colors.border}`, borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, animation: 'fadeUp 0.3s ease both' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ background: `${colors.text}22`, color: colors.text, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.5, border: `1px solid ${colors.border}` }}>
                    {colors.label}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>⏱ {selectedNode.duration}</span>
                  {selectedNode.status === 'locked' && !isDone && (
                    <span style={{ fontSize: 12, color: 'var(--muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 10px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)' }}>
                      🔒 Complete prerequisites first
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
                  {selectedNode.title}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
                  {selectedNode.description}
                </p>
              </div>
              <button onClick={() => toggleComplete(selectedNode.id)}
                style={{ background: isDone ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isDone ? '#ef4444' : '#10b981', border: `1px solid ${isDone ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, padding: '10px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {isDone ? '✗ Mark incomplete' : '✓ Mark complete'}
              </button>
            </div>
          )
        })()}

        {/* Kira footer */}
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(124,58,237,0.06)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 28px' }}>
          <FoxMascot size={72} style={{ animation: 'none', flexShrink: 0 }} />
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--white)' }}>Kira says:</strong> Start with{' '}
              <strong style={{ color: '#22d3ee' }}>Foundation</strong> nodes — they unlock everything above.
              Mark each module done as you complete it. You've got this! 💪
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button onClick={() => navigate('/skillgap')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                ← Skill gap
              </button>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,246,0.3)', color: 'var(--violet-glow)', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Dashboard →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
