import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Disparo from './pages/Disparo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Disparo />} />
        {/* Você pode adicionar mais rotas aqui futuramente */}
      </Routes>
    </Router>
  );
}

export default App;
