import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FoxMascot from '../components/FoxMascot'

const steps = ['Upload Resume', 'Paste Job Description', 'Confirm & Analyze']

export default function Upload() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const foxMessages = [
    "Hey! I'm Kira 👋 Drop your resume and I'll map your path to greatness.",
    "Nice! Now paste the job description — I'll find exactly what you need to learn.",
    "Perfect. Let me analyze the gap between where you are and where you want to be!",
  ]

  function handleFile(file: File) {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      setResumeFile(file)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleAnalyze() {
    if (!resumeFile) return

    // Read file as base64 and store in sessionStorage so Processing page can send it
    const reader = new FileReader()
    reader.onload = () => {
      sessionStorage.setItem('resumeB64',  reader.result as string)
      sessionStorage.setItem('resumeName', resumeFile.name)
      sessionStorage.setItem('jdText',     jdText)
      navigate('/processing')
    }
    reader.onerror = () => console.error('Failed to read resume file')
    reader.readAsDataURL(resumeFile)
  }

  const canNext =
    (step === 0 && resumeFile !== null) ||
    (step === 1 && jdText.trim().length > 50) ||
    step === 2

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* bg grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <Navbar />

      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '100px 48px 60px',
        gap: 80,
      }}>

        {/* Left — Fox + speech bubble */}
        <div style={{
          flex: '0 0 380px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 24,
        }}>
          <div style={{
            background: 'var(--navy2)',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '20px 24px',
            fontSize: 15, lineHeight: 1.6,
            color: 'var(--white)', maxWidth: 320,
            position: 'relative',
            boxShadow: '0 0 40px rgba(124,58,237,0.15)',
          }}>
            {foxMessages[step]}
            <div style={{
              position: 'absolute', bottom: -12, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '12px solid var(--navy2)',
            }} />
          </div>
          <FoxMascot size={320} />
        </div>

        {/* Right — Steps */}
        <div style={{ flex: 1, maxWidth: 600 }}>

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    background: i < step ? 'var(--cyan)' : i === step
                      ? 'linear-gradient(135deg, var(--violet), var(--cyan))'
                      : 'var(--navy2)',
                    color: i <= step ? 'white' : 'var(--muted)',
                    border: i > step ? '1px solid var(--border)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: i === step ? 'var(--white)' : 'var(--muted)',
                    whiteSpace: 'nowrap',
                  }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    flex: 1, height: 1, margin: '0 8px', marginBottom: 28,
                    background: i < step ? 'var(--cyan)' : 'var(--border)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0 — Resume Upload */}
          {step === 0 && (
            <div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 32, fontWeight: 800,
                letterSpacing: '-1px', marginBottom: 8,
              }}>Upload your resume</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 15 }}>
                PDF or DOCX — I'll extract your skills automatically.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragging ? 'var(--cyan)' : resumeFile ? 'var(--violet-bright)' : 'var(--border)'}`,
                  borderRadius: 16, padding: '64px 40px',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragging ? 'rgba(6,182,212,0.05)' : resumeFile ? 'rgba(124,58,237,0.05)' : 'var(--navy2)',
                  transition: 'all 0.3s',
                }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {resumeFile ? (
                  <>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--white)', marginBottom: 8 }}>
                      {resumeFile.name}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                      {(resumeFile.size / 1024).toFixed(1)} KB — Click to replace
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                      Drop your resume here
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
                      or click to browse
                    </div>
                    <div style={{
                      display: 'inline-block',
                      background: 'rgba(139,92,246,0.1)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '6px 16px',
                      fontSize: 12, color: 'var(--muted)',
                    }}>PDF · DOCX</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — JD Text */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 32, fontWeight: 800,
                letterSpacing: '-1px', marginBottom: 8,
              }}>Paste the job description</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 15 }}>
                Copy the full JD from LinkedIn, Naukri, or anywhere — the more detail the better.
              </p>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder={"Paste job description here...\n\ne.g. We are looking for a Machine Learning Engineer with experience in PyTorch, model deployment, MLOps..."}
                style={{
                  width: '100%', height: 280,
                  background: 'var(--navy2)',
                  border: `1px solid ${jdText.length > 50 ? 'var(--violet-bright)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '20px',
                  color: 'var(--white)', fontSize: 14, lineHeight: 1.7,
                  resize: 'vertical', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'border-color 0.3s',
                }}
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 8, fontSize: 12, color: 'var(--muted)',
              }}>
                <span>{jdText.length > 50 ? '✓ Looks good!' : 'Minimum 50 characters'}</span>
                <span>{jdText.length} chars</span>
              </div>
            </div>
          )}

          {/* Step 2 — Confirm */}
          {step === 2 && (
            <div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 32, fontWeight: 800,
                letterSpacing: '-1px', marginBottom: 8,
              }}>Ready to forge your path</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 15 }}>
                Here's what I'll analyze for you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                {[
                  { icon: '📄', label: 'Resume', value: resumeFile?.name || '', color: 'var(--violet-bright)' },
                  { icon: '💼', label: 'Job Description', value: `${jdText.slice(0, 80)}...`, color: 'var(--cyan)' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    background: 'var(--navy2)',
                    border: '1px solid var(--border)',
                    borderRadius: 12, padding: '20px 24px',
                  }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--white)', lineHeight: 1.5 }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 12, padding: '16px 20px',
                fontSize: 14, color: 'var(--violet-glow)', lineHeight: 1.6,
              }}>
                ⚡ Kira will extract skills from your resume, map them against the JD, identify gaps, and build a personalized learning roadmap — all in under 30 seconds.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 40,
          }}>
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                background: 'transparent',
                color: step === 0 ? 'transparent' : 'var(--muted)',
                border: step === 0 ? 'none' : '1px solid var(--border)',
                padding: '12px 24px', borderRadius: 10,
                fontWeight: 500, fontSize: 15, cursor: step === 0 ? 'default' : 'pointer',
                pointerEvents: step === 0 ? 'none' : 'auto',
              }}
            >← Back</button>

            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
                style={{
                  background: canNext
                    ? 'linear-gradient(135deg, var(--violet), var(--cyan))'
                    : 'var(--navy2)',
                  color: canNext ? 'white' : 'var(--muted)',
                  border: canNext ? 'none' : '1px solid var(--border)',
                  padding: '14px 32px', borderRadius: 10,
                  fontWeight: 600, fontSize: 15,
                  cursor: canNext ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >Continue →</button>
            ) : (
              <button
                onClick={handleAnalyze}
                style={{
                  background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                  color: 'white', border: 'none',
                  padding: '14px 36px', borderRadius: 10,
                  fontWeight: 700, fontSize: 16, cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(124,58,237,0.4)',
                }}
              >🚀 Analyze my profile →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
