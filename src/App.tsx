import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignalsProvider } from './context/SignalsContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Signals from './pages/Signals'
import AddSignal from './pages/AddSignal'
import Companies from './pages/Companies'

export default function App() {
  return (
    <SignalsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="signals" element={<Signals />} />
            <Route path="signals/add" element={<AddSignal />} />
            <Route path="companies" element={<Companies />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SignalsProvider>
  )
}
