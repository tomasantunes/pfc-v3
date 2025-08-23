import React, {useState} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

export default function Santander() {
  const [newBalance, setNewBalance] = useState();

  function changeNewBalance(e) {
    setNewBalance(e.target.value);
  }

  function submitSantanderBalance() {
    var data = {
      balance: newBalance,
    };

    axios.post(config.BASE_URL + "/insert-santander-balance", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        bootprompt.alert("Santander balance has been submitted.");
        setNewBalance("");
      }
      else {
        bootprompt.alert("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  return (
    <>
    <Navbar />
    <div className="container">
      <div className="row">
        <div className="col-md-3">
          <div className="form-group mb-2">
            <label><b>Balance</b></label>
            <input type="text" className="form-control" value={newBalance} onChange={changeNewBalance} />
          </div>
        </div>
      </div>
      <div className="row">
        <div style={{textAlign: "right"}}>
          <button className="btn btn-primary" onClick={submitSantanderBalance}>Submit</button>
        </div>
      </div>
    </div>
    </>
  )
}
