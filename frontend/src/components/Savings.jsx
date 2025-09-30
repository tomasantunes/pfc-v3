import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Santander() {
  const [cash, setCash] = useState(0);
  const [vouchers, setVouchers] = useState(0);
  const [giftCards, setGiftCards] = useState(0);
  const [savingsAccountsTotal, setSavingsAccountsTotal] = useState(0);
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);

  function loadSavings() {
    axios.get(config.BASE_URL + "/get-savings")
    .then(function(response) {
      setCash(response.data.data.cash);
      setVouchers(response.data.data.vouchers);
      setGiftCards(response.data.data.gift_cards);
      setSavingsAccountsTotal(response.data.data.savings_accounts_total);
      setLoyaltyBalance(response.data.data.loyalty_balance);
    })
    .catch(function() {
      MySwal.fire(i18n("Error loading savings data."));
    });
  }

  function submitSavings() {
    axios.post(config.BASE_URL + "/insert-savings", {cash, vouchers, giftCards, savingsAccountsTotal, loyaltyBalance})
    .then(function(response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Savings data has been updated successfully."));
      }
      else {
        MySwal.fire(i18n("Error updating savings data."));
      }
    })
    .catch(function() {
      MySwal.fire(i18n("Error updating savings data."));
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

  function changeSavingsAccountsTotal(e) {
    setSavingsAccountsTotal(e.target.value);
  }

  function changeLoyaltyBalance(e) {
    setLoyaltyBalance(e.target.value);
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

            <div className="form-group mb-2">
              <label><b>{i18n("Savings Accounts Total")}</b></label>
              <input type="text" className="form-control" value={savingsAccountsTotal} onChange={changeSavingsAccountsTotal} />
            </div>

            <div className="form-group mb-2">
              <label><b>{i18n("Loyalty Balance")}</b></label>
              <input type="text" className="form-control" value={loyaltyBalance} onChange={changeLoyaltyBalance} />
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
