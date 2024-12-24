import { BrowserRouter, Routes, Route } from "react-router";
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import BPI from './components/BPI';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/bpi" element={<BPI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
