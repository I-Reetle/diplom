import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import './styles.css';

function App() {
  return (
    <Router>
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Home />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;