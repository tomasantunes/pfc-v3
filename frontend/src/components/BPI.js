import React, {useState} from 'react';
import FileUploader from './FileUploader';
import Navbar from './Navbar';
import $ from 'jquery';

window.jQuery = $;
window.$ = $;
global.jQuery = $;
window.bootstrap = require('bootstrap');
var bootprompt = require('bootprompt');

export default function BPI() {
  const [excelFile, setExcelFile] = useState();

  function changeExcelFile({file}) {
    setExcelFile(file);
  }

  function submitExcelFile() {

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
