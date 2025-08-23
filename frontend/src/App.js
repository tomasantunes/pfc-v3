import { BrowserRouter, Routes, Route } from "react-router";
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import BPI from './components/BPI';
import Santander from './components/Santander';
import Trading212 from './components/Trading212';
import Coinbase from './components/Coinbase';
import Binance from './components/Binance';
import Polymarket from './components/Polymarket';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/bpi" element={<BPI />} />
        <Route path="/santander" element={<Santander />} />
        <Route path="/trading212" element={<Trading212 />} />
        <Route path="/coinbase" element={<Coinbase />} />
        <Route path="/binance" element={<Binance />} />
        <Route path="/polymarket" element={<Polymarket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
