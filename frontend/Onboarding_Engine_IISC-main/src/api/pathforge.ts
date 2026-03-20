// src/api/pathforge.ts
// Connects PathForge frontend to the FastAPI engine backend.
// Backend must be running: uvicorn api:app --reload --port 8000

const API = 'http://localhost:8000'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  matchedSkills: Skill[]
  gapSkills:     Skill[]
  candidateName: string
  targetRole:    string
  matchScore:    number
}

export interface Skill {
  name:      string
  level:     'beginner' | 'intermediate' | 'advanced'
  category:  string
  priority?: 'high' | 'medium' | 'low'
  score?:    number
}

// Shape returned by the NEW /roadmap endpoint (roadmap_engine.py RoadmapNode)
export interface RoadmapNode {
  id:                   string
  skill:                string
  priority:             'high' | 'medium' | 'low'
  gap_score:            number
  week_start:           number
  week_end:             number
  duration_weeks:       number
  course_id:            string | null
  course_title:         string | null
  description:          string
  prerequisites:        string[]
  unlocked_by:          string[]
  category:             string
  is_prerequisite_only: boolean
}

export interface RoadmapTimeline {
  candidate_name:  string
  target_role:     string
  match_score:     number
  total_weeks:     number
  high_weeks:      number
  medium_weeks:    number
  low_weeks:       number
  nodes:           RoadmapNode[]
  known_skills:    string[]
  summary:         string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function analyzeDocuments(
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> {
  const resumeB64 = await readFileAsBase64(resumeFile)
  const form = new FormData()
  form.append('resume_b64',  resumeB64)
  form.append('resume_name', resumeFile.name || 'resume.pdf')
  form.append('jd_text',     jobDescription)

  const res = await fetch(`${API}/analyze`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${await res.text()}`)
  return res.json()
}

/**
 * Generate a personalised, dependency-ordered roadmap.
 * Sends full analysis context so roadmap_engine can filter already-known skills,
 * apply correct priority tiers, and sequence nodes properly.
 */
export async function generateRoadmap(
  analysisResult: AnalysisResult
): Promise<RoadmapTimeline> {
  const body = {
    gapSkills:     analysisResult.gapSkills,
    matchedSkills: analysisResult.matchedSkills,
    candidateName: analysisResult.candidateName,
    targetRole:    analysisResult.targetRole,
    matchScore:    analysisResult.matchScore,
  }

  const res = await fetch(`${API}/roadmap`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Backend error ${res.status}: ${await res.text()}`)
  return res.json()
}
