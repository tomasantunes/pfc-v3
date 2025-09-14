import React, {useState, useEffect} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import axios from 'axios';
import config from '../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Paypal() {
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
        MySwal.fire("CSV has been imported successfully.");
        setCsvFile("");
        $("input[type=file]").val('');
        getMov();
      }
      else {
        console.log(response.data.error);
        MySwal.fire(response.data.error);
      }
    })
    .catch((err) => MySwal.fire("File Upload Error"));
  }

  function getMov() {
    axios.get(config.BASE_URL + "/get-paypal-mov")
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

  useEffect(() => {
    getMov();
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container">
        <form onSubmit={submitCsvFile}>
          <div className="form-group py-2">
              <FileUploader onFileSelectSuccess={(file) => changeCsvFile({file})} onFileSelectError={({ error}) => MySwal.fire(error)} />
          </div>
          <div className="form-group">
              <div>
                  <button type="submit" className="btn btn-primary">Import CSV</button>
              </div>
          </div>
        </form>

        <table className="table">
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Value</th>
          </tr>
          <tbody>
            {mov.map((m) => (
              <tr>
                <td>{m.date_mov}</td>
                <td>{m.name}</td>
                <td>{m.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </>
  )
}

