import './App.css';
import NavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Graph from './pages/Graph';
import History from './pages/History';

function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
