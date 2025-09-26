import axios from "axios";

export function requestCheckLogin(cb) {
    axios.get("/check-login")
    .then(function(response) {
        if (response.data.status == "OK") {
            cb(true);
        }
        else {
            cb(false);
        }
    })
    .catch(function() {
        cb(false);
    });
}