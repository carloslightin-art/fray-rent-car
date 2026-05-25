import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '../components/layout/AdminLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Reservations from '../pages/Reservations'
import Clients from '../pages/Clients'
import Vehicles from '../pages/Vehicles'
import Users from '../pages/Users'
import WebsiteContent from '../pages/WebsiteContent'
import Settings from '../pages/Settings'
import Reports from '../pages/Reports'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/website-content" element={<WebsiteContent />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
