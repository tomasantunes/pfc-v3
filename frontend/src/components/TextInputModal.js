import React from 'react';

export default function TextInputModal({value, setValue, updateField}) {
  return (
    <div class="modal fade" id="textInputModal" tabindex="-1" aria-labelledby="textInputModalLabel" aria-hidden="true">
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
                style={{backgroundColor: "#99ccff"}}
              />
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onClick={updateField}>Save</button>
          </div>
          </div>
      </div>
    </div>
  )
}
