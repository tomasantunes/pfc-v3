import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {NavLink} from 'react-router-dom';
import {i18n, getLanguages, setLanguage} from '../libs/translations';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState(getLanguages());

  function logout() {
    axios.post("/api/logout");
    navigate("/login");
  }

  return (
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">PFC</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <NavLink to="/home" className="nav-link">Home</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/budgets" className="nav-link">{i18n("Budgets")}</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/goals" className="nav-link">{i18n("Goals")}</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/bpi" className="nav-link">BPI</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/santander" className="nav-link">Santander</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/revolut" className="nav-link">Revolut</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/savings" className="nav-link">{i18n("Savings")}</NavLink>
                </li>
                {/*<li class="nav-item">
                    <NavLink to="/paypal" className="nav-link">Paypal</NavLink>
                </li>*/}
                <li class="nav-item">
                    <NavLink to="/trading212" className="nav-link">Trading212</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/coinbase" className="nav-link">Coinbase</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/binance" className="nav-link">Binance</NavLink>
                </li>
                <li class="nav-item">
                    <NavLink to="/polymarket" className="nav-link">Polymarket</NavLink>
                </li>
            </ul>
            </div>
            <div class="me-3">
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        {i18n("Language")}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        {languages.map((l) => (
                            <li><div class="set-language-btn" onClick={() => setLanguage(l.languageCode)}>{l.languageName}</div></li>
                        ))}
                    </ul>
                </div>
            </div>
            <div class="logout-btn">
                <div onClick={logout} style={{cursor: "pointer"}}><i class="fa-solid fa-right-from-bracket"></i></div>
            </div>
        </div>
    </nav>
  )
}
