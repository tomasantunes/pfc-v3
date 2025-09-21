import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import {i18n} from '../libs/translations';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Revolut() {
  const [csvFile, setCsvFile] = useState("");
  const [mov, setMov] = useState([]);

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
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="col-md-4">
          <form onSubmit={submitCsvFile} className="bpi-form mb-3">
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
      </div>
    </>
  )
}
