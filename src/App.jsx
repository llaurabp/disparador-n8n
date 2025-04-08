import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Disparo from './pages/Disparo';
import LoginPage from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/disparo" element={<Disparo />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
