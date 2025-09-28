import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import ExpandableGroupedTable from './ExpandableGroupedTable';
import EditableExpandableGroupedTable from './EditableExpandableGroupedTable';
import Flatpickr from "react-flatpickr";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Revolut() {
  const [csvFile, setCsvFile] = useState("");
  const [mov, setMov] = useState([]);
  const [newMovementDate, setNewMovementDate] = useState("");
  const [newMovementType, setNewMovementType] = useState("buy");
  const [newMovementName, setNewMovementName] = useState("");
  const [newMovementQuantity, setNewMovementQuantity] = useState("");
  const [newMovementPrice, setNewMovementPrice] = useState("");
  const [newMovementValue, setNewMovementValue] = useState("");
  const [accountActivity, setAccountActivity] = useState(null);
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

  function loadAccountActivity() {
    axios.get(config.BASE_URL + "/get-account-activity-revolut")
    .then(function(response) {
      if (response.data.status == "OK") {
        setAccountActivity(response.data.data);
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
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

    axios.post(config.BASE_URL + "/insert-account-movement-revolut", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        MySwal.fire("Account movement has been submitted.");
        setNewMovementDate("");
        setNewMovementType("buy");
        setNewMovementName("");
        setNewMovementQuantity("");
        setNewMovementPrice("");
        setNewMovementValue("");
        loadAccountActivity();
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
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

  function updateMovement(itemId, updatedValues) {
    axios.post(config.BASE_URL + "/update-account-movement-revolut", {
      id: itemId,
      ...updatedValues
    })
    .then(function (response) {
      if (response.data.status == "OK") {
        MySwal.fire("Account movement has been updated.");
        loadAccountActivity();
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

    axios.post(config.BASE_URL + "/insert-portfolio-snapshot-revolut", data)
    .then(function (response) {
      if (response.data.status == "OK") {
        MySwal.fire("Portfolio snapshot has been submitted.");
        setNewPositions([]);
        setNewBalance("");
        setNewProfit("");
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  function loadPortfolioSnapshots() {
    axios.get(config.BASE_URL + "/get-portfolio-snapshots-revolut")
    .then(function(response) {
      if (response.data.status == "OK") {
        setPortfolioSnapshots(response.data.data);
      }
      else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire("Error: " + err.message);
    });
  }

  function changeCsvFile({file}) {
    setCsvFile(file);
  }

  const submitCsvFile = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("csvFile", csvFile);

    axios.post(config.BASE_URL + "/import-revolut-csv", formData)
    .then((response) => {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("CSV has been imported successfully"));
        setCsvFile("");
        document.querySelector("input[type=file]").value = "";
        getMov();
      }
      else {
        console.log(response.data.error);
        MySwal.fire(response.data.error);
      }
    })
    .catch((err) => {
      console.log(err);
      MySwal.fire(i18n("File Upload Error"));
    });
  }

  function toggleIsExpense(id) {
    axios.post(config.BASE_URL + "/revolut/toggle-is-expense", {id: id})
    .then(function(response) {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Movement has been updated successfully."));
        getMov();
      }
      else {
        MySwal.fire(response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire(err.message);
    });
  }

  function getMov() {
    axios.get(config.BASE_URL + "/get-revolut-mov")
    .then(function(response) {
      if (response.data.status == "OK") {
        setMov(response.data.data);
      }
      else {
        MySwal.fire(response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire(err.message);
    });
  }

  function changeNewMovementDataMov(e) {
    setNewMovement({
      ...newMovement,
      data_mov: e.target.value
    });
  }

  function changeNewMovementDataValor(e) {
    setNewMovement({
      ...newMovement,
      data_valor: e.target.value
    });
  }

  function changeNewMovementDescMov(e) {
    setNewMovement({
      ...newMovement,
      desc_mov: e.target.value
    });
  }

  function changeNewMovementValor(e) {
    setNewMovement({
      ...newMovement,
      valor: e.target.value
    });
  }

  function changeNewMovementSaldo(e) {
    setNewMovement({
      ...newMovement,
      saldo: e.target.value
    });
  }

  function changeNewMovementIsExpense(e) {
    setNewMovement({
      ...newMovement,
      is_expense: e.target.checked
    });
  }

  useEffect(() => {
    getMov();
    loadAccountActivity();
    loadPortfolioSnapshots();
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="col-md-4">
          <form onSubmit={submitCsvFile} className="revolut-form mb-3">
            <h3>{i18n("Import CSV Revolut")}</h3>
            <div className="form-group py-2">
                <FileUploader onFileSelectSuccess={(file) => changeCsvFile({file})} onFileSelectError={({ error}) => MySwal.fire(error)} />
            </div>
            <div className="form-group">
                <div className="text-end">
                    <button type="submit" className="btn btn-primary">{i18n("Submit")}</button>
                </div>
            </div>
          </form>
        </div>

        <table className="table">
          <tr>
            <th>{i18n("Start Date")}</th>
            <th>{i18n("Conclusion Date")}</th>
            <th>{i18n("Type")}</th>
            <th>{i18n("Product")}</th>
            <th>{i18n("Description")}</th>
            <th>{i18n("Amount")}</th>
            <th>{i18n("Commission")}</th>
            <th>{i18n("Currency")}</th>
            <th>{i18n("Status")}</th>
            <th>{i18n("Balance")}</th>
            <th>{i18n("Expense")}</th>
            <th>{i18n("Actions")}</th>
          </tr>
          <tbody>
            {mov.map((m) => (
              <tr key={m.id}>
                <td>{m.data_inicio}</td>
                <td>{m.data_fim}</td>
                <td>{m.tipo}</td>
                <td>{m.produto}</td>
                <td>{m.descricao}</td>
                <td>{m.montante}</td>
                <td>{m.comissao}</td>
                <td>{m.moeda}</td>
                <td>{m.estado}</td>
                <td>{m.saldo}</td>
                <td>{m.is_expense == 1 ? i18n("Yes") : i18n("No")}</td>
                <td>{Number(m.montante) < 0 && <button className={"btn btn-sm" + " " + ((m.is_expense) ? "btn-success" : "btn-danger")} onClick={() => toggleIsExpense(m.id)}>{(m.is_expense) ? "+" : "-"}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row revolut-form mb-3">
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
        <div className="row revolut-form mb-3">
          {accountActivity &&
            <EditableExpandableGroupedTable tableData={accountActivity} tableHeaders={["Movement Date", "Name", "Type", "Quantity", "Price", "Value", "Return"]} title={i18n("Account Activity")} onSave={handleUpdateMovement} />
          }
        </div>
        <div className="row revolut-form mb-3">
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
        <div className="row revolut-form mb-3">
          {portfolioSnapshots && 
            <ExpandableGroupedTable tableData={portfolioSnapshots} tableHeaders={["Name", "Price", "Quantity", "Value", "Return"]} title={i18n("Portfolio Snapshots")} />
          }
        </div>
      </div>
    </>
  )
}
