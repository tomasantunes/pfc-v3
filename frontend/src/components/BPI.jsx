import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function BPI() {
  const [excelFile, setExcelFile] = useState("");
  const [mov, setMov] = useState([]);
  const [newMovement, setNewMovement] = useState({
    data_mov: "",
    data_valor: "",
    desc_mov: "",
    valor: "",
    saldo: "",
    is_expense: false,
  });

  function changeExcelFile({file}) {
    setExcelFile(file);
  }

  const submitExcelFile = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("excelFile", excelFile);

    axios.post(config.BASE_URL + "/import-bpi-xls", formData)
    .then((response) => {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("XLS has been imported successfully"));
        setExcelFile("");
        $("input[type=file]").val('');
        getMov();
      }
      else {
        console.log(response.data.error);
        MySwal.fire(response.data.error);
      }
    })
    .catch((err) => MySwal.fire(i18n("File Upload Error")));
  }

  function toggleIsExpense(id) {
    axios.post(config.BASE_URL + "/toggle-is-expense", {id: id})
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
    axios.get(config.BASE_URL + "/get-bpi-mov")
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

  function addMovement(e) {
    e.preventDefault();
    axios.post(config.BASE_URL + "/add-bpi-mov", newMovement)
    .then(function(response) {
      if (response.data.status == "OK") {
        getMov();
        setNewMovement({
          data_mov: "",
          data_valor: "",
          desc_mov: "",
          valor: "",
          saldo: "",
          is_expense: false,
        });
        MySwal.fire(i18n("Movement has been added successfully."));
      }
      else {
        MySwal.fire(response.data.error);
      }
    })
    .catch(function(err) {
      MySwal.fire(err.message);
    });
  }

  useEffect(() => {
    getMov();
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="col-md-4">
          <form onSubmit={submitExcelFile} className="bpi-form mb-3">
            <h3>{i18n("Import XLS BPI")}</h3>
            <div className="form-group py-2">
                <FileUploader onFileSelectSuccess={(file) => changeExcelFile({file})} onFileSelectError={({ error}) => MySwal.fire(error)} />
            </div>
            <div className="form-group">
                <div className="text-end">
                    <button type="submit" className="btn btn-primary">{i18n("Submit")}</button>
                </div>
            </div>
          </form>

          <form onSubmit={addMovement} className="bpi-form mb-3">
            <h3>{i18n("Add Movement")}</h3>
            <div className="form-group">
              <label>{i18n("Movement Date")}</label>&nbsp;<small>(YYYY-MM-DD)</small>
              <input type="text" className="form-control" value={newMovement.data_mov} onChange={changeNewMovementDataMov} />
            </div>
            <div className="form-group">
              <label>{i18n("Value Date")}</label>&nbsp;<small>(YYYY-MM-DD)</small>
              <input type="text" className="form-control" value={newMovement.data_valor} onChange={changeNewMovementDataValor} />
            </div>
            <div className="form-group">
              <label>{i18n("Description")}</label>&nbsp;<small>({i18n("Text")})</small>
              <input type="text" className="form-control" value={newMovement.desc_mov} onChange={changeNewMovementDescMov} />
            </div>
            <div className="form-group">
              <label>{i18n("Value")}</label>&nbsp;<small>(xx.xx)</small>
              <input type="text" className="form-control" value={newMovement.valor} onChange={changeNewMovementValor} />
            </div>
            <div className="form-group">
              <label>{i18n("Balance")}</label>&nbsp;<small>(xx.xx)</small>
              <input type="text" className="form-control" value={newMovement.saldo} onChange={changeNewMovementSaldo} />
            </div>
            <div className="form-group">
              <input type="checkbox" checked={newMovement.is_expense} onChange={changeNewMovementIsExpense} />
              <label>{i18n("Expense")}</label>
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
            <th>{i18n("Movement Date")}</th>
            <th>{i18n("Value Date")}</th>
            <th>{i18n("Description")}</th>
            <th>{i18n("Value")}</th>
            <th>{i18n("Balance")}</th>
            <th>{i18n("Expense")}</th>
            <th>{i18n("Actions")}</th>
          </tr>
          <tbody>
            {mov.map((m) => (
              <tr key={m.id}>
                <td>{m.data_mov}</td>
                <td>{m.data_valor}</td>
                <td>{m.desc_mov}</td>
                <td>{m.valor}</td>
                <td>{m.saldo}</td>
                <td>{m.is_expense == 1 ? i18n("Yes") : i18n("No")}</td>
                <td>{Number(m.valor) < 0 && <button className={"btn btn-sm" + " " + ((m.is_expense) ? "btn-success" : "btn-danger")} onClick={() => toggleIsExpense(m.id)}>{(m.is_expense) ? "+" : "-"}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </>
  )
}
