import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-8 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<div>Portfolio Page</div>} />
              <Route path="/agents" element={<div>Agents Page</div>} />
              <Route path="/tasks" element={<div>Tasks Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
