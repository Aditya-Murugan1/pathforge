import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FoxMascot from '../components/FoxMascot'
import { analyzeDocuments } from '../api/pathforge'
import { saveAnalysis } from '../hooks/useAnalysisStore'
import { useAuth } from '../context/AuthContext'

const stages = [
  { message: "Parsing your resume... extracting skills and experience levels.", duration: 2500 },
  { message: "Reading the job description... identifying role requirements.", duration: 2000 },
  { message: "Cross-referencing your skills against the role... this is where the magic happens ✨", duration: 3000 },
  { message: "Scoring skill gaps by priority and criticality...", duration: 2000 },
  { message: "Building your personalized learning roadmap... almost there! 🗺", duration: 2500 },
]

export default function Processing() {
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const [stageIndex, setStageIndex] = useState(0)
  const [dots,       setDots]       = useState('.')
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    let current = 0
    function next() {
      current++
      if (current < stages.length) {
        setStageIndex(current)
        setTimeout(next, stages[current].duration)
      }
    }
    setTimeout(next, stages[0].duration)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function run() {
      try {
        const resumeB64  = sessionStorage.getItem('resumeB64')  || ''
        const resumeName = sessionStorage.getItem('resumeName') || 'resume.pdf'
        const jdText     = sessionStorage.getItem('jdText')     || ''

        if (!resumeB64) {
          setError('No resume found. Please go back and upload your resume.')
          return
        }

        const res  = await fetch(resumeB64)
        const blob = await res.blob()
        const file = new File([blob], resumeName, { type: blob.type })
        const result = await analyzeDocuments(file, jdText)

        if ((result as any).error) {
          setError(`Analysis failed: ${(result as any).error}`)
          return
        }

        // Always store in sessionStorage (fast access)
        sessionStorage.setItem('analysisResult', JSON.stringify(result))

        // Also persist to Firestore for history
        if (user?.uid) {
          try {
            const id = await saveAnalysis(user.uid, result)
            sessionStorage.setItem('analysisId', id)
          } catch (e) {
            console.warn('Firestore save failed (non-blocking):', e)
          }
        }

        navigate('/skillgap')
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setError(`Analysis failed: ${msg}. Is the backend running at port 8000?`)
      }
    }
    run()
  }, [user, navigate])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(100px)', pointerEvents: 'none', animation: 'glowPulse 3s ease-in-out infinite' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 600, padding: '0 24px' }}>
        {error ? (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '28px 32px', color: '#ef4444', fontSize: 15, lineHeight: 1.6 }}>
            ⚠️ {error}
            <br /><br />
            <button onClick={() => navigate('/upload')} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>← Go back</button>
          </div>
        ) : (
          <>
            <div style={{ background: 'var(--navy2)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 32px', fontSize: 16, lineHeight: 1.7, color: 'var(--white)', marginBottom: 8, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ color: 'var(--cyan)', marginRight: 8 }}>Kira:</span>
              {stages[stageIndex].message}
              <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid var(--navy2)' }} />
            </div>
            <FoxMascot size={280} style={{ margin: '0 auto' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {stages.map((_, i) => (
                <div key={i} style={{ width: i === stageIndex ? 24 : 8, height: 8, borderRadius: 4, background: i < stageIndex ? 'var(--cyan)' : i === stageIndex ? 'var(--violet-bright)' : 'var(--navy2)', border: '1px solid var(--border)', transition: 'all 0.4s ease' }} />
              ))}
            </div>
            <p style={{ marginTop: 24, fontSize: 14, color: 'var(--muted)', letterSpacing: 1 }}>Analyzing{dots}</p>
          </>
        )}
      </div>
    </div>
  )
}
