import React, {useState, useEffect} from 'react';
import Navbar from './Navbar';
import config from '../config';
import axios from 'axios';
import {i18n} from '../libs/translations';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function Inventory() {
  const [items, setItems] = useState([]);

  function updateUnitPrice(id, unit_price, qtt) {
    let total_price = (qtt * unit_price).toFixed(2) || 0;
    axios.post(config.BASE_URL + "/update-item-price", {id, unit_price, total_price})
    .then((response) => {
      if (response.data.status == "OK") {
        MySwal.fire(i18n("Success"), i18n("Price updated successfully"), "success");
        loadItems();
      } else {
        MySwal.fire("Error: " + response.data.error);
      }
    })
    .catch((error) => {
      console.error("Error updating price:", error);
      MySwal.fire("Error: " + error.message);
    });
  }

  function onChangeUnitPrice(index, value) {
    const updatedItems = [...items];
    updatedItems[index].unit_price = value;
    updatedItems[index].total_price = (updatedItems[index].qtt * value).toFixed(2);
    setItems(updatedItems);
  }

  function loadItems() {
    axios.get(config.BASE_URL + "/get-inventory")
      .then((response) => {
        setItems(response.data.data);
      })
      .catch((error) => {
        console.error("Error loading items:", error);
        MySwal.fire("Error: " + error.message);
      });
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>{i18n("Items")}</h2>
        <table className="table table-striped table-bordered align-middle tasks">
          <thead className="table-dark">
            <tr>
                <th>{i18n("Item")}</th>
                <th>{i18n("Description")}</th>
                <th>{i18n("Quantity")}</th>
                <th>{i18n("Total")}</th>
                <th>{i18n("Unit Price")}</th>
                <th></th>
            </tr>
          </thead>
          <tbody>
              {items.map((item, index) => (
              <tr>
                <td>{item.item_name}</td>
                <td>{item.description}</td>
                <td>{item.qtt}</td>
                <td>{item.total_price}€</td>
                <td><input type="number" className="form-control" value={item.unit_price} onChange={(e) => { onChangeUnitPrice(index, e.target.value) }} /></td>
                <td>
                  <button className="btn btn-primary" onClick={() => { updateUnitPrice(item.id, item.unit_price, item.qtt) }}>{i18n("Set Price")}</button>
                </td>
              </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
