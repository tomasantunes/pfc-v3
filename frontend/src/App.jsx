import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import BPI from './components/BPI';
import Santander from './components/Santander';
import Revolut from './components/Revolut';
import Savings from './components/Savings';
import Trading212 from './components/Trading212';
import Coinbase from './components/Coinbase';
import Binance from './components/Binance';
import Polymarket from './components/Polymarket';
import Budgets from './components/Budgets';
import {init} from './libs/translations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/bpi" element={<BPI />} />
        <Route path="/santander" element={<Santander />} />
        <Route path="/revolut" element={<Revolut />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/trading212" element={<Trading212 />} />
        <Route path="/coinbase" element={<Coinbase />} />
        <Route path="/binance" element={<Binance />} />
        <Route path="/polymarket" element={<Polymarket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
