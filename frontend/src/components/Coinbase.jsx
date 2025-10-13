import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import Flatpickr from "react-flatpickr";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Coinbase() {
  const [newBalance, setNewBalance] = useState();
  const [newAssets, setNewAssets] = useState([]);
  const [lastSnapshot, setLastSnapshot] = useState([]);
  const [newAsset, setNewAsset] = useState({
    name: "",
    deposit: "",
    quantity: "",
    value: ""
  });
  const [expenses, setExpenses] = useState([]);
  const [newExpenseDate, setNewExpenseDate] = useState("");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseValue, setNewExpenseValue] = useState("");


  function changeNewExpenseDescription(e) {
    setNewExpenseDescription(e.target.value);
  }

  function changeNewExpenseValue(e) {
    setNewExpenseValue(e.target.value);
  }

  function addNewExpense() {
    var data = {
      date: newExpenseDate,
      description: newExpenseDescription,
      value: newExpenseValue
    };

    axios.post(config.BASE_URL + "/insert-expense-coinbase", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Expense has been submitted."));
        getExpenses();
        setNewExpense({
          date: "",
          description: "",
          value: ""
        });
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  function changeNewBalance(e) {
    setNewBalance(e.target.value);
  }

  function changeNewAssetName(e) {
    setNewAsset({
      ...newAsset,
      name: e.target.value
    });
  }

  function changeNewAssetDeposit(e) {
    setNewAsset({
      ...newAsset,
      deposit: e.target.value
    });
  }

  function changeNewAssetQuantity(e) {
    setNewAsset({
      ...newAsset,
      quantity: e.target.value
    });
  }

  function changeNewAssetValue(e) {
    setNewAsset({
      ...newAsset,
      value: e.target.value
    })
  }

  function addNewAsset() {
    setNewAssets([
      ...newAssets,
      newAsset
    ]);
    setNewAsset({
      name: "",
      deposit: "",
      quantity: "",
      value: ""
    })
  }

  function submitPortfolioSnapshot() {
    var data = {
      balance: newBalance,
      assets: newAssets
    };

    axios.post(config.BASE_URL + "/insert-portfolio-snapshot-coinbase", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Portfolio snapshot has been submitted."));
        setNewAssets([]);
        setNewBalance("");
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  function getLastSnapshot() {
    axios.get(config.BASE_URL + "/get-last-snapshot-coinbase")
    .then(function (response) {
      console.log(response.data.data);
      setLastSnapshot(response.data.data);
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  function getExpenses() {
    axios.get(config.BASE_URL + "/get-expenses-coinbase")
    .then(function (response) {
      setExpenses(response.data.data);
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  useEffect(() => {
    getLastSnapshot();
    getExpenses();
  }, []);

  return (
    <>
    <Navbar />
    <div className="container">
      <div className="row">
        <div className="col-md-3">
          <h3>{i18n("Insert Portfolio Snapshot")}</h3>
          <div className="form-group mb-2">
              <label><b>{i18n("Balance")}</b></label>
              <input type="text" className="form-control" value={newBalance} onChange={changeNewBalance} />
          </div>
        </div>
      </div>
      <div className="row">
        <div>
            <label><b>{i18n("Assets")}</b></label>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>{i18n("Name")}</th>
                        <th>{i18n("Deposit")}</th>
                        <th>{i18n("Quantity")}</th>
                        <th>{i18n("Value")}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                  {newAssets.map((asset) => (
                    <tr>
                      <td>{asset.name}</td>
                      <td>{asset.deposit}</td>
                      <td>{asset.quantity}</td>
                      <td>{asset.value}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td><input type="text" className="form-control" value={newAsset.name} onChange={changeNewAssetName} /></td>
                        <td><input type="text" className="form-control" value={newAsset.deposit} onChange={changeNewAssetDeposit} /></td>
                        <td><input type="text" className="form-control" value={newAsset.quantity} onChange={changeNewAssetQuantity} /></td>
                        <td><input type="text" className="form-control" value={newAsset.value} onChange={changeNewAssetValue} /></td>
                        <td><button className="btn btn-success" onClick={addNewAsset}>Add</button></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div style={{textAlign: "right"}}>
          <button className="btn btn-primary" onClick={submitPortfolioSnapshot}>{i18n("Submit")}</button>
        </div>
      </div>
      <div className="row">
        <div class="col-12">
        <label><b>{i18n("Last Snapshot")}</b></label>
          <table className="table table-striped">
            <thead>
                <tr>
                    <th>{i18n("Name")}</th>
                    <th>{i18n("Deposit")}</th>
                    <th>{i18n("Quantity")}</th>
                    <th>{i18n("Value")}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
              {lastSnapshot.map((asset) => (
                <tr>
                  <td>{asset.name}</td>
                  <td>{asset.deposit}</td>
                  <td>{asset.quantity}</td>
                  <td>{asset.value}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row">
        <div class="col-12">
          <h3>Expenses</h3>
          <table className="table table-striped coinbase-expenses-table">
            <thead>
                <tr>
                  <th>{i18n("Date")}</th>
                  <th>{i18n("Description")}</th>
                  <th>{i18n("Value")}</th>
                  <th></th>
                </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr>
                  <td>{e.date}</td>
                  <td>{e.description}</td>
                  <td>{e.value}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><Flatpickr className="form-control" value={newExpenseDate} onChange={([date]) => setNewExpenseDate(date)} /></td>
                <td><input type="text" className="form-control" value={newExpenseDescription} onChange={changeNewExpenseDescription} /></td>
                <td><input type="text" className="form-control" value={newExpenseValue} onChange={changeNewExpenseValue} /></td>
                <td><button className="btn btn-success" onClick={addNewExpense}>{i18n("Add")}</button></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    </>
  )
}
