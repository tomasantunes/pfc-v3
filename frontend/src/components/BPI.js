import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

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
        bootprompt.alert("XLS has been imported successfully.");
        setExcelFile("");
        $("input[type=file]").val('');
        getMov();
      }
      else {
        console.log(response.data.error);
        bootprompt.alert(response.data.error);
      }
    })
    .catch((err) => bootprompt.alert("File Upload Error"));
  }

  function toggleIsExpense(id) {
    axios.post(config.BASE_URL + "/toggle-is-expense", {id: id})
    .then(function(response) {
      if (response.data.status == "OK") {
        bootprompt.alert("Movimento atualizado com sucesso.");
        getMov();
      }
      else {
        bootprompt.alert(response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert(err.message);
    });
  }

  function getMov() {
    axios.get(config.BASE_URL + "/get-bpi-mov")
    .then(function(response) {
      if (response.data.status == "OK") {
        setMov(response.data.data);
      }
      else {
        bootprompt.alert(response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert(err.message);
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
        bootprompt.alert("O movimento BPI foi adicionado com sucesso.");
      }
      else {
        bootprompt.alert(response.data.error);
      }
    })
    .catch(function(err) {
      bootprompt.alert(err.message);
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
            <h3>Importar XLS BPI</h3>
            <div className="form-group py-2">
                <FileUploader onFileSelectSuccess={(file) => changeExcelFile({file})} onFileSelectError={({ error}) => bootprompt.alert(error)} />
            </div>
            <div className="form-group">
                <div className="text-end">
                    <button type="submit" className="btn btn-primary">Submeter</button>
                </div>
            </div>
          </form>

          <form onSubmit={addMovement} className="bpi-form mb-3">
            <h3>Adicionar Movimento</h3>
            <div className="form-group">
              <label>Data Mov.</label>&nbsp;<small>(YYYY-MM-DD)</small>
              
              <input type="text" className="form-control" value={newMovement.data_mov} onChange={changeNewMovementDataMov} />
            </div>
            <div className="form-group">
              <label>Data Valor</label>&nbsp;<small>(YYYY-MM-DD)</small>
              <input type="text" className="form-control" value={newMovement.data_valor} onChange={changeNewMovementDataValor} />
            </div>
            <div className="form-group">
              <label>Descrição</label>&nbsp;<small>(Texto)</small>
              <input type="text" className="form-control" value={newMovement.desc_mov} onChange={changeNewMovementDescMov} />
            </div>
            <div className="form-group">
              <label>Valor</label>&nbsp;<small>(xx.xx)</small>
              <input type="text" className="form-control" value={newMovement.valor} onChange={changeNewMovementValor} />
            </div>
            <div className="form-group">
              <label>Saldo</label>&nbsp;<small>(xx.xx)</small>
              <input type="text" className="form-control" value={newMovement.saldo} onChange={changeNewMovementSaldo} />
            </div>
            <div className="form-group">
              <input type="checkbox" checked={newMovement.is_expense} onChange={changeNewMovementIsExpense} />
              <label>Despesa</label>
            </div>
            <div className="form-group">
                <div className="text-end">
                    <button type="submit" className="btn btn-primary">Submeter</button>
                </div>
            </div>
          </form>
        </div>

        <table className="table">
          <tr>
            <th>Data Mov.</th>
            <th>Data Valor</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Saldo</th>
            <th>Despesa</th>
            <th>Ações</th>
          </tr>
          <tbody>
            {mov.map((m) => (
              <tr key={m.id}>
                <td>{m.data_mov}</td>
                <td>{m.data_valor}</td>
                <td>{m.desc_mov}</td>
                <td>{m.valor}</td>
                <td>{m.saldo}</td>
                <td>{m.is_expense == 1 ? "Sim" : "Não"}</td>
                <td>{Number(m.valor) < 0 && <button className={"btn btn-sm" + " " + ((m.is_expense) ? "btn-success" : "btn-danger")} onClick={() => toggleIsExpense(m.id)}>{(m.is_expense) ? "+" : "-"}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </>
  )
}
