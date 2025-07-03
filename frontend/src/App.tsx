import { Routes, Route } from 'react-router-dom'
import Layout from './shared/layout/Layout'
import HomePage from './pages/HomePage'
import WeaponsPage from './pages/WeaponsPage'
import EquipmentPage from './pages/EquipmentPage'
import ArmorPage from './pages/ArmorPage'
import PerksPage from './pages/PerksPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/weapons" element={<WeaponsPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/armor" element={<ArmorPage />} />
        <Route path="/perks" element={<PerksPage />} />
      </Routes>
    </Layout>
  )
}

export default App
