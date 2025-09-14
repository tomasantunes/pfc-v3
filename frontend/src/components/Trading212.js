import "flatpickr/dist/themes/airbnb.css";
import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import ExpandableGroupedTable from './ExpandableGroupedTable';
import EditableExpandableGroupedTable from './EditableExpandableGroupedTable';
import {i18n} from '../libs/translations';
import Flatpickr from "react-flatpickr";
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

function toLocaleISOString(date) {
  function pad(number) {
      if (number < 10) {
          return '0' + number;
      }
      return number;
  }

  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) ;
}

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
  const [newMovementDate, setNewMovementDate] = useState("");
  const [newMovementType, setNewMovementType] = useState("buy");
  const [newMovementName, setNewMovementName] = useState("");
  const [newMovementQuantity, setNewMovementQuantity] = useState("");
  const [newMovementPrice, setNewMovementPrice] = useState("");
  const [newMovementValue, setNewMovementValue] = useState("");
  const [accountActivity, setAccountActivity] = useState(null);
  const [portfolioSnapshots, setPortfolioSnapshots] = useState(null);

  function changeNewMovementType(e) {
    setNewMovementType(e.target.value);
  }

  function changeNewMovementName(e) {
    setNewMovementName(e.target.value);
  }

  function changeNewMovementQuantity(e) {
    setNewMovementQuantity(e.target.value);
  }

  function changeNewMovementPrice(e) {
    setNewMovementPrice(e.target.value);
  }

  function changeNewMovementValue(e) {
    setNewMovementValue(e.target.value);
  }

  function submitAccountMovement() {
    var data = {
      date: toLocaleISOString(newMovementDate).substring(0, 10),
      type: newMovementType,
      name: newMovementName,
      quantity: newMovementQuantity,
      price: newMovementPrice,
      value: newMovementValue
    };

    axios.post(config.BASE_URL + "/insert-account-movement-t212", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        bootprompt.alert("Account movement has been submitted.");
        setNewMovementDate("");
        setNewMovementType("buy");
        setNewMovementName("");
        setNewMovementQuantity("");
        setNewMovementPrice("");
        setNewMovementValue("");
        loadAccountActivity();
      }
      else {
        bootprompt.alert("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

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

  function changeNewPositionReturn(e) {
    setNewPosition({
      ...newPosition,
      return: e.target.value
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

  function loadAccountActivity() {
    axios.get(config.BASE_URL + "/get-account-activity-t212")
    .then(function(response) {
      if (response.data.status == "OK") {
        setAccountActivity(response.data.data);
      }
      else {
        bootprompt.alert("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function loadPortfolioSnapshots() {
    axios.get(config.BASE_URL + "/get-portfolio-snapshots-t212")
    .then(function(response) {
      if (response.data.status == "OK") {
        setPortfolioSnapshots(response.data.data);
      }
      else {
        bootprompt.alert("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  function updateMovement(itemId, updatedValues) {
    axios.post(config.BASE_URL + "/update-account-movement-t212", {
      id: itemId,
      ...updatedValues
    })
    .then(function (response) {
      if (response.data.status == "OK") {
        bootprompt.alert("Account movement has been updated.");
        loadAccountActivity();
      }
      else {
        bootprompt.alert("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert("Error: " + err.message);
    });
  }

  const handleUpdateMovement = (itemId, updatedValues) => {
    console.log('Saving movement:', itemId, 'with values:', updatedValues);
    
    // Update the data state
    setAccountActivity(prevData => {
      const newData = { ...prevData };
      
      // Find and update the item in the appropriate group
      Object.keys(newData).forEach(groupName => {
        const itemIndex = newData[groupName].findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          newData[groupName][itemIndex] = {
            ...newData[groupName][itemIndex],
            ...updatedValues
          };
        }
      });
      return newData;
    });

    updateMovement(itemId, updatedValues);
  };

  useEffect(() => {
    loadAccountActivity();
    loadPortfolioSnapshots();
  }, []);

  return (
    <>
    <Navbar />
    <div className="container">
      <div className="row t212-form mb-3">
        <div className="col-md-3">
          <h3>{i18n("Insert Account Movement")}</h3>
          <div className="form-group mb-2">
              <label><b>{i18n("Movement Date")}</b></label>
              <Flatpickr className="form-control" value={newMovementDate} onChange={([date]) => setNewMovementDate(date)} />
          </div>
          <div className="form-group mb-2">
              <label><b>{i18n("Type")}</b></label>
              <select className="form-control" value={newMovementType} onChange={changeNewMovementType}>
                <option value="buy">{i18n("Buy")}</option>
                <option value="sell">{i18n("Sell")}</option>
                <option value="dividend">{i18n("Dividend")}</option>
              </select>
          </div>
          <div className="form-group mb-2">
              <label><b>{i18n("Name")}</b></label>
              <input type="text" className="form-control" value={newMovementName} onChange={changeNewMovementName} />
          </div>
          <div className="form-group mb-2">
              <label><b>{i18n("Quantity")}</b></label>
              <input type="text" className="form-control" value={newMovementQuantity} onChange={changeNewMovementQuantity} />
          </div>
          <div className="form-group mb-2">
              <label><b>{i18n("Price")}</b></label>
              <input type="text" className="form-control" value={newMovementPrice} onChange={changeNewMovementPrice} />
          </div>
          <div className="form-group mb-2">
              <label><b>{i18n("Value")}</b></label>
              <input type="text" className="form-control" value={newMovementValue} onChange={changeNewMovementValue} />
          </div>
          <div style={{textAlign: "right"}}>
            <button className="btn btn-primary" onClick={submitAccountMovement}>{i18n("Submit")}</button>
          </div>
        </div>
      </div>
      <div className="row t212-form mb-3">
        {accountActivity &&
          <EditableExpandableGroupedTable tableData={accountActivity} tableHeaders={["Movement Date", "Name", "Type", "Quantity", "Price", "Value", "Return"]} title={i18n("Account Activity")} onSave={handleUpdateMovement} />
        }
      </div>
      <div className="row t212-form mb-3">
        <div className="col-md-3">
          <h3>{i18n("Insert Portfolio Snapshot")}</h3>
          <div className="form-group mb-2">
              <label><b>{i18n("Balance")}</b></label>
              <input type="text" className="form-control" value={newBalance} onChange={changeNewBalance} />
          </div>
          <div className="form-group mb-2">
              <label><b>{i18n("Profit")}</b></label>
              <input type="text" className="form-control" value={newProfit} onChange={changeNewProfit} />
          </div>
        </div>
        <div>
            <label><b>{i18n("Positions")}</b></label>
            <div className="p-3 mb-3" style={{backgroundColor: "white", borderRadius: "10px"}}>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>{i18n("Name")}</th>
                        <th>{i18n("Price")}</th>
                        <th>{i18n("Quantity")}</th>
                        <th>{i18n("Value")}</th>
                        <th>{i18n("Return")}</th>
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
                        <td><button className="btn btn-success" onClick={addNewPosition}>{i18n("Add")}</button></td>
                    </tr>
                </tfoot>
            </table>
            </div>
            <div style={{textAlign: "right"}}>
              <button className="btn btn-primary" onClick={submitPortfolioSnapshot}>{i18n("Submit")}</button>
            </div>
        </div>
      </div>
      <div className="row t212-form mb-3">
        {portfolioSnapshots && 
          <ExpandableGroupedTable tableData={portfolioSnapshots} tableHeaders={["Name", "Price", "Quantity", "Value", "Return"]} title={i18n("Portfolio Snapshots")} />
        }
      </div>
    </div>
    </>
  )
}
