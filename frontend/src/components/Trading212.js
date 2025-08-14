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

export default function Trading212() {
  const [newBalance, setNewBalance] = useState();
  const [newProfit, setNewProfit] = useState();
  const [newPositions, setNewPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({
    name: "",
    price: "",
    quantity: "",
    value: "",
    return: ""
  });

  function changeNewBalance(e) {
    setNewBalance(e.target.value);
  }

  function changeNewProfit(e) {
    setNewProfit(e.target.value);
  }

  function changeNewPositionName(e) {
    setNewPosition({
      ...newPosition,
      name: e.target.value
    });
  }

  function changeNewPositionPrice(e) {
    setNewPosition({
      ...newPosition,
      price: e.target.value
    });
  }

  function changeNewPositionQuantity(e) {
    setNewPosition({
      ...newPosition,
      quantity: e.target.value
    });
  }

  function changeNewPositionValue(e) {
    setNewPosition({
      ...newPosition,
      value: e.target.value
    })
  }

  function addNewPosition() {
    setNewPositions([
      ...newPositions,
      newPosition
    ]);
    setNewPosition({
      name: "",
      price: "",
      quantity: "",
      value: "",
      return: ""
    })
  }

  function submitPortfolioSnapshot() {
    var data = {
      balance: newBalance,
      profit: newProfit,
      positions: newPositions
    };

    axios.post(config.BASE_URL + "/insert-portfolio-snapshot-t212", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        bootprompt.alert("Portfolio snapshot has been submitted.");
        setNewPositions([]);
        setNewBalance("");
        setNewProfit("");
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
          <h3>Insert Portfolio Snapshot</h3>
          <div className="form-group mb-2">
              <label><b>Balance</b></label>
              <input type="text" className="form-control" value={newBalance} onChange={changeNewBalance} />
          </div>
          <div className="form-group mb-2">
              <label><b>Profit</b></label>
              <input type="text" className="form-control" value={newProfit} onChange={changeNewProfit} />
          </div>
        </div>
      </div>
      <div className="row">
        <div>
            <label><b>Positions</b></label>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Value</th>
                        <th>Return</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                  {newPositions.map((position) => (
                    <tr>
                      <td>{position.name}</td>
                      <td>{position.price}</td>
                      <td>{position.quantity}</td>
                      <td>{position.value}</td>
                      <td>{position.return}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td><input type="text" className="form-control" value={newPosition.name} onChange={changeNewPositionName} /></td>
                        <td><input type="text" className="form-control" value={newPosition.price} onChange={changeNewPositionPrice} /></td>
                        <td><input type="text" className="form-control" value={newPosition.quantity} onChange={changeNewPositionQuantity} /></td>
                        <td><input type="text" className="form-control" value={newPosition.value} onChange={changeNewPositionValue} /></td>
                        <td><input type="text" className="form-control" value={newPosition.return} onChange={changeNewPositionReturn} /></td>
                        <td><button className="btn btn-success" onClick={addNewPosition}>Add</button></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div style={{textAlign: "right"}}>
          <button className="btn btn-primary" onClick={submitPortfolioSnapshot}>Submit</button>
        </div>
      </div>
    </div>
    </>
  )
}
