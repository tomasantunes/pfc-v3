import React from 'react';
import {i18n} from '../libs/translations';

export default function TextInputModal({id, value, setValue, updateField}) {
  return (
    <div class="modal fade" id={id} tabindex="-1" aria-labelledby={id + "Label"} aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content">
          <div class="modal-header">
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
              <input
                type="text"
                className="form-control"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{backgroundColor: "#d8ebfd"}}
              />
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{i18n("Close")}</button>
              <button type="button" class="btn btn-primary" onClick={updateField}>{i18n("Save")}</button>
          </div>
          </div>
      </div>
    </div>
  )
}
