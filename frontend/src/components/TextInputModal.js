import React from 'react';

export default function TextInputModal({value, setValue}) {
  return (
    <div class="modal fade" id="textInputModal" tabindex="-1" aria-labelledby="textInputModalLabel" aria-hidden="true">
      <div class="modal-dialog">
          <div class="modal-content">
          <div class="modal-header">
              <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
              <input type="text" className="form-control" value={value} onChange={setValue} style={{backgroundColor: "#99ccff"}} />
          </div>
          <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary">Save</button>
          </div>
          </div>
      </div>
    </div>
  )
}
