import { BrowserRouter, Routes, Route } from "react-router";
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import BPI from './components/BPI';
import Paypal from './components/Paypal';
import Trading212 from './components/Trading212';
import Coinbase from './components/Coinbase';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/bpi" element={<BPI />} />
        <Route path="/paypal" element={<Paypal />} />
        <Route path="/trading212" element={<Trading212 />} />
        <Route path="/coinbase" element={<Coinbase />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
