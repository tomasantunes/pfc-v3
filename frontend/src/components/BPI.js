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

  useEffect(() => {
    getMov();
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container">
        <form onSubmit={submitExcelFile}>
          <div className="form-group py-2">
              <FileUploader onFileSelectSuccess={(file) => changeExcelFile({file})} onFileSelectError={({ error}) => bootprompt.alert(error)} />
          </div>
          <div className="form-group">
              <div>
                  <button type="submit" className="btn btn-primary">Import XLS</button>
              </div>
          </div>
        </form>

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
                <td>{Number(m.valor) < 0 && <button className={"btn btn-sm" + ((m.is_expense) ? "btn-success" : "btn-danger")} onClick={() => toggleIsExpense(m.id)}>{(m.is_expense) ? "+" : "-"}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </>
  )
}
