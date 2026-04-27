import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { ReportPage } from './pages/ReportPage'
import { SuccessPage } from './pages/SuccessPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { AuthPage } from './pages/AuthPage'
import { GoogleSetupPage } from './pages/GoogleSetupPage'
import { ProfilePage } from './pages/ProfilePage'
import { PageTransition } from './components/PageTransition'

function AnimatedRoutes() {
  const location = useLocation()
  const isBack = location.state?.back === true

  return (
    <AnimatePresence mode="sync" custom={isBack} initial={false}>
      <Routes location={location} key={location.key}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/report/:categoryId" element={<PageTransition><ReportPage /></PageTransition>} />
        <Route path="/success" element={<PageTransition><SuccessPage /></PageTransition>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/google-setup" element={<GoogleSetupPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
