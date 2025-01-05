import React, {useEffect, useState} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

export default function Home() {
  const [netWorth, setNetWorth] = useState("");

  function getNetWorth() {
    axios.get(config.BASE_URL + "/get-net-worth")
    .then(function(response) {
      setNetWorth(response.data.data.toString() + "€");
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  useEffect(() => {
    getNetWorth();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h3>Dashboard</h3>
        <p><b>Net Worth:</b> {netWorth}</p>
      </div>
      
    </>
  )
}
