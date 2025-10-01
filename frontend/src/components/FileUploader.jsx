import React, {useRef} from 'react';
import {i18n} from "../libs/translations";

export default function FileUploader({onFileSelectError, onFileSelectSuccess}) {
    const handleFileInput = (e) => {
        // handle validations
        const file = e.target.files[0];
        if (file.size > 50 * 1024 * 1024)
          onFileSelectError({ error: i18n("File size cannot exceed more than 50MB") });
        else onFileSelectSuccess(file);
      };

    return (
        <div className="file-uploader">
            <input type="file" onChange={handleFileInput} />
        </div>
    )
}