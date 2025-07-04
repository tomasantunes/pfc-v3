import React from 'react';
import {NavLink} from 'react-router-dom';

export default function Navbar() {
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
                    <NavLink to="/bpi" className="nav-link">BPI</NavLink>
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
        </div>
    </nav>
  )
}
