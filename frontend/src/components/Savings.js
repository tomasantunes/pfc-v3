import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

export default function Santander() {
  const [cash, setCash] = useState(0);
  const [vouchers, setVouchers] = useState(0);
  const [giftCards, setGiftCards] = useState(0);

  function loadSavings() {
    axios.get(config.BASE_URL + "/get-savings")
    .then(function(response) {
      setCash(response.data.data.cash);
      setVouchers(response.data.data.vouchers);
      setGiftCards(response.data.data.gift_cards);
    })
    .catch(function() {
      bootprompt.alert(i18n("Error loading savings data."));
    });
  }

  function submitSavings() {
    axios.post(config.BASE_URL + "/insert-savings", {cash, vouchers, giftCards})
    .then(function(response) {
      if (response.data.status == "OK") {
        bootprompt.alert(i18n("Savings data has been updated successfully."));
      }
      else {
        bootprompt.alert(i18n("Error updating savings data."));
      }
    })
    .catch(function() {
      bootprompt.alert(i18n("Error updating savings data."));
    });
  }

  function changeCash(e) {
    setCash(e.target.value);
  }
  
  function changeVouchers(e) {
    setVouchers(e.target.value);
  }

  function changeGiftCards(e) {
    setGiftCards(e.target.value);
  }

  useEffect(() => {
    loadSavings();
  }, []);
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="savings-form col-md-4 mb-3">
           <div className="form-group mb-2">
              <label><b>{i18n("Cash")}</b></label>
              <input type="text" className="form-control" value={cash} onChange={changeCash} />
            </div>

            <div className="form-group mb-2">
              <label><b>{i18n("Vouchers")}</b></label>
              <input type="text" className="form-control" value={vouchers} onChange={changeVouchers} />
            </div>

            <div className="form-group mb-2">
              <label><b>{i18n("Gift Cards")}</b></label>
              <input type="text" className="form-control" value={giftCards} onChange={changeGiftCards} />
            </div>

            <div className="row">
              <div style={{textAlign: "right"}}>
                <button className="btn btn-primary" onClick={submitSavings}>{i18n("Submit")}</button>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
