import React, {useState} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Polymarket() {
  const [newBalance, setNewBalance] = useState();
  const [newProfit, setNewProfit] = useState();
  const [newDeposit, setNewDeposit] = useState();

  function changeNewBalance(e) {
    setNewBalance(e.target.value);
  }

  function changeNewProfit(e) {
    setNewProfit(e.target.value);
  }

  function changeNewDeposit(e) {
    setNewDeposit(e.target.value);
  }

  function submitPortfolioSnapshot() {
    var data = {
      balance: newBalance,
      profit: newProfit,
      deposit: newDeposit
    };

    axios.post(config.BASE_URL + "/insert-portfolio-snapshot-polymarket", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        MySwal.fire("Portfolio snapshot has been submitted.");
        setNewBalance("");
        setNewProfit("");
        setNewDeposit("");
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  return (
    <>
    <Navbar />
    <div className="container">
      <div className="row">
        <div className="col-md-3">
          <h3>Insert Portfolio Snapshot</h3>
          <div className="form-group mb-2">
              <label><b>Balance</b></label>
              <input type="text" className="form-control" value={newBalance} onChange={changeNewBalance} />
          </div>
          <div className="form-group mb-2">
              <label><b>Profit</b></label>
              <input type="text" className="form-control" value={newProfit} onChange={changeNewProfit} />
          </div>
          <div className="form-group mb-2">
              <label><b>Deposit</b></label>
              <input type="text" className="form-control" value={newDeposit} onChange={changeNewDeposit} />
          </div>
        </div>
      </div>
      <div className="row">
        <div style={{textAlign: "right"}}>
          <button className="btn btn-primary" onClick={submitPortfolioSnapshot}>Submit</button>
        </div>
      </div>
    </div>
    </>
  )
}
