import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import SchedulePage from './pages/SchedulePage'
import PricingPage from './pages/PricingPage'
import CostsPage from './pages/CostsPage'
import ReportsPage from './pages/ReportsPage'
import MeetingsPage from './pages/MeetingsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/agenda" element={<SchedulePage />} />
        <Route path="/precos" element={<PricingPage />} />
        <Route path="/custos" element={<CostsPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/reunioes" element={<MeetingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
