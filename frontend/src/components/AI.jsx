import React, {useState, useEffect} from 'react';
import axios from 'axios';
import config from '../config';
import {toLocaleISOString} from '../libs/utils';
import Navbar from './Navbar';
import { marked } from 'marked';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

export default function AI() {
  const [budget, setBudget] = useState("");
  const [portfolioOverview, setPortfolioOverview] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [aiResponse, setAiResponse] = useState("...");
  const [isLoading, setIsLoading] = useState(false);

  function getInvestmentAdvice() {
    setIsLoading(true);
    axios.post(config.BASE_URL + "/api/ai/get-investment-advice", {
      budget: budget,
      portfolio_overview: portfolioOverview,
      risk_level: riskLevel
    })
    .then((response) => {
      if (response.data.status === "OK") {
        setAiResponse(marked.parse(response.data.data));
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Oops...',
          text: response.data.message,
        });
      }
      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An error occurred while fetching investment advice.',
      });
    });
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">
          <div className="col-12">
              <h1>AI</h1>
              <h2>Investment Advice</h2>
          </div>
          <div className="col-md-4">
            <div className="form-group mb-2">
              <label>Budget</label>
              <input type="number" className="form-control" placeholder="Enter your budget" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="form-group mb-2">
              <label>Portfolio Overview</label>
              <textarea className="form-control" rows="5" placeholder="Describe your current investment portfolio" value={portfolioOverview} onChange={(e) => setPortfolioOverview(e.target.value)}></textarea>
            </div>
            <div className="form-group mb-2">
              <label>Risk Level</label>
              <select className="form-control" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="text-end">
              <button className="btn btn-primary" onClick={getInvestmentAdvice}>Submit</button>
            </div>
          </div>
          <div className="col-md-8">
            <h2>AI Response</h2>
            <div className="response-container">
              {isLoading ? (
                <div key="loading" className="loading text-primary text-center">
                  <i className="fa-solid fa-rotate fa-spin fa-3x"></i>
                </div>
              ) : (
                <div key="answer" className="bot-answer" dangerouslySetInnerHTML={{ __html: marked.parse(aiResponse) }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}