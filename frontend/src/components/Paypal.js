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
  const [csvFile, setCsvFile] = useState("");
  const [mov, setMov] = useState([]);

  function changeCsvFile({file}) {
    setCsvFile(file);
  }

  const submitCsvFile = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("csvFile", csvFile);

    axios.post(config.BASE_URL + "/import-paypal-csv", formData)
    .then((response) => {
      if (response.data.status == "OK") {
        bootprompt.alert("CSV has been imported successfully.");
        setCsvFile("");
        $("input[type=file]").val('');
      }
      else {
        console.log(response.data.error);
        bootprompt.alert(response.data.error);
      }
    })
    .catch((err) => bootprompt.alert("File Upload Error"));
  }

  function getMov() {
    axios.get(config.BASE_URL + "/get-paypal-mov")
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
    //getMov();
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container">
        <form onSubmit={submitCsvFile}>
          <div className="form-group py-2">
              <FileUploader onFileSelectSuccess={(file) => changeCsvFile({file})} onFileSelectError={({ error}) => bootprompt.alert(error)} />
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
          </tr>
          <tbody>
            {mov.map((m) => (
              <tr>
                <td>{m.data_mov}</td>
                <td>{m.data_valor}</td>
                <td>{m.desc_mov}</td>
                <td>{m.valor}</td>
                <td>{m.saldo}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </>
  )
}

