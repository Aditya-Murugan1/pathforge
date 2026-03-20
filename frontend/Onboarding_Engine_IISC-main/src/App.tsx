import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.tsx'
import Upload from './pages/Upload.tsx'
import Processing from './pages/Processing.tsx'
import SkillGap from './pages/SkillGap.tsx'
import Roadmap3D from './pages/Roadmap3D.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute><Upload /></ProtectedRoute>
        } />
        <Route path="/processing" element={
          <ProtectedRoute><Processing /></ProtectedRoute>
        } />
        <Route path="/skillgap" element={
          <ProtectedRoute><SkillGap /></ProtectedRoute>
        } />
        <Route path="/roadmap" element={
          <ProtectedRoute><Roadmap3D /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App