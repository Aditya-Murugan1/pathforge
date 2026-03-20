// src/hooks/useAnalysisStore.ts
// Persists analyses to Firestore. Each user has a subcollection: users/{uid}/analyses/{id}

import { useState, useEffect } from 'react'
import {
  collection, addDoc, getDocs, doc, getDoc,
  orderBy, query, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { AnalysisResult } from '../api/pathforge'

export interface StoredAnalysis {
  id:          string
  targetRole:  string
  matchScore:  number
  matchedCount:number
  gapCount:    number
  gapSkills:   { name: string; priority: string; level: string; category: string }[]
  createdAt:   string   // ISO string for display
}

// ── Save a new analysis ───────────────────────────────────────────────────────
export async function saveAnalysis(uid: string, result: AnalysisResult): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'analyses'), {
    targetRole:   result.targetRole,
    matchScore:   result.matchScore,
    matchedCount: result.matchedSkills.length,
    gapCount:     result.gapSkills.length,
    gapSkills:    result.gapSkills,
    matchedSkills:result.matchedSkills,
    candidateName:result.candidateName,
    createdAt:    serverTimestamp(),
  })
  return ref.id
}

// ── Load all analyses for a user ─────────────────────────────────────────────
export async function loadAnalyses(uid: string): Promise<StoredAnalysis[]> {
  const q    = query(collection(db, 'users', uid, 'analyses'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data()
    const ts   = data.createdAt as Timestamp | null
    return {
      id:           d.id,
      targetRole:   data.targetRole   || 'Unknown Role',
      matchScore:   data.matchScore   || 0,
      matchedCount: data.matchedCount || 0,
      gapCount:     data.gapCount     || 0,
      gapSkills:    data.gapSkills    || [],
      createdAt:    ts ? ts.toDate().toISOString() : new Date().toISOString(),
    }
  })
}

// ── Load a single analysis by ID ─────────────────────────────────────────────
export async function loadAnalysis(uid: string, id: string): Promise<StoredAnalysis | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'analyses', id))
  if (!snap.exists()) return null
  const data = snap.data()
  const ts   = data.createdAt as Timestamp | null
  return {
    id:           snap.id,
    targetRole:   data.targetRole   || 'Unknown Role',
    matchScore:   data.matchScore   || 0,
    matchedCount: data.matchedCount || 0,
    gapCount:     data.gapCount     || 0,
    gapSkills:    data.gapSkills    || [],
    createdAt:    ts ? ts.toDate().toISOString() : new Date().toISOString(),
  }
}

// ── Hook: list of all analyses ────────────────────────────────────────────────
export function useAnalyses(uid: string | null) {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    loadAnalyses(uid)
      .then(setAnalyses)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [uid])

  return { analyses, loading }
}

// ── Relative time formatter ───────────────────────────────────────────────────
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  <  7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
