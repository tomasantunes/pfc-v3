import React, {useState} from 'react';
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
      }
      else {
        console.log(response.data.error);
        bootprompt.alert(response.data.error);
      }
    })
    .catch((err) => bootprompt.alert("File Upload Error"));
  }
  
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
      </div>
    </>
  )
}
