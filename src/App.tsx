import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GamePage, ResultPage } from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
