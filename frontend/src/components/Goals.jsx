import React, {useState, useEffect} from 'react';
import axios from 'axios';
import config from '../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Navbar from './Navbar';

const MySwal = withReactContent(Swal);

export default function Goals() {
  const [newGoal, setNewGoal] = useState("");
  const [goals, setGoals] = useState([]);

  function loadGoals() {
      axios.get(config.BASE_URL + "/load-goals")
      .then(response => {
          setGoals(response.data.data);
      })
      .catch(error => {
          console.error("Error loading goals:", error);
          MySwal.fire("Error loading goals: " + error.message);
      });
  }

  function addGoal() {
      if (newGoal.trim() === "") {
          MySwal.fire("Goal description cannot be empty.");
          return;
      }
      
      axios.post(config.BASE_URL + "/add-goal", {description: newGoal})
      .then(response => {
        loadGoals();
        setNewGoal("");
      })
      .catch(error => {
          console.error("Error adding goal:", error);
          MySwal.fire("Error adding goal: " + error.message);
      });
  }

  function editGoal(index) {
      const updatedGoals = [...goals];
      const goal = updatedGoals[index];
      const newDescription = prompt("Edit goal description:", goal.description);
      if (newDescription !== null && newDescription.trim() !== "") {
          axios.post(config.BASE_URL + "/edit-goal", {id: goal.id, description: newDescription})
          .then(response => {
              loadGoals();
          })
          .catch(error => {
              console.error("Error editing goal:", error);
              MySwal.fire("Error editing goal: " + error.message);
          });
      }
  }

  function deleteGoal(index) {
      const goal = goals[index];
      if (window.confirm(`Are you sure you want to delete the goal: "${goal.description}"?`)) {
          axios.post(config.BASE_URL + "/delete-goal", {id: goal.id})
          .then(response => {
              loadGoals();
          })
          .catch(error => {
              console.error("Error deleting goal:", error);
              MySwal.fire("Error deleting goal: " + error.message);
          });
      }
  }

  useEffect(() => {
      loadGoals();
  }, []);
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="col-md-6 offset-md-3">
          <h1>Goals</h1>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.map((goal, index) => (
                <tr key={index}>
                  <td>{goal.description}</td>
                  <td>
                    <button className="btn btn-warning me-2" onClick={() => editGoal(index)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => deleteGoal(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><input type="text" placeholder="New goal description" className="form-control" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} /></td>
                <td>
                  <button className="btn btn-primary" onClick={addGoal}>Add Goal</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  )
}
