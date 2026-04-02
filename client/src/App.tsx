import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LandingPage } from './pages/LandingPage'
import { ReportPage } from './pages/ReportPage'
import { PageTransition } from './components/PageTransition'

function AnimatedRoutes() {
  const location = useLocation()
  const isBack = location.state?.back === true

  return (
    <AnimatePresence mode="sync" custom={isBack} initial={false}>
      <Routes location={location} key={location.key}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/report/:categoryId" element={<PageTransition><ReportPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
