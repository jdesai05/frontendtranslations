import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import ChooseService from "./ChooseService";
import SelectOptions from "./SelectOptions";
import Payment from "./Payment";
import "./App.css";

function App() {
  const [services, setServices] = useState([]);

  // Fetch data from Flask API
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/get-services")
      .then((response) => {
        console.log("✅ API Response:", response.data);
        setServices(response.data);
      })
      .catch((error) => {
        console.error("❌ Error fetching services:", error);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ChooseService services={services} />} />
          <Route path="/select-options" element={<SelectOptions />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
