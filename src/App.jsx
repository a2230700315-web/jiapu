import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import TreePage from './pages/TreePage'
import PersonsPage from './pages/PersonsPage'
import ScanPage from './pages/ScanPage'
import StatsPage from './pages/StatsPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tree" element={<TreePage />} />
            <Route path="/persons" element={<PersonsPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
