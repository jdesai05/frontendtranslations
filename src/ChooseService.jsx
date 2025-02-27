import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import "./ChooseService.css";

const ChooseService = () => {
  const navigate = useNavigate();

  // Initializing State with Local Storage
  const [service, setService] = useState(() => localStorage.getItem("service") || "Professional");
  const [fromLang, setFromLang] = useState("");
  const [toLang, setToLang] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [priority, setPriority] = useState(() => localStorage.getItem("priority") || "normal");
  const [numPages, setNumPages] = useState(() => parseInt(localStorage.getItem("numPages")) || 1);
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [totalPrice, setTotalPrice] = useState(0);
  const [certificationType, setCertificationType] = useState("");
  const [certifications, setCertifications] = useState([]);

  // ✅ Fetch available languages
  useEffect(() => {
    fetch("https://quotations-a93u.onrender.com/get-languages")
      .then(response => response.json())
      .then(data => setAvailableLanguages(data.languages))
      .catch(error => console.error("Error fetching languages:", error));
  }, []);

  // ✅ Fetch certifications when service, language change
  useEffect(() => {
    if (!fromLang || !toLang) return;

    let url = service === "Professional"
      ? `https://quotations-a93u.onrender.com/get-certifications-professional?from=${fromLang}&to=${toLang}`
      : `https://quotations-a93u.onrender.com/get-certifications-limited?from=${fromLang}&to=${toLang}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setCertifications(data.certifications || []);
        setCertificationType(data.certifications?.[0] || ""); // ✅ Set first option as default
      })
      .catch(error => console.error("Error fetching certifications:", error));
  }, [service, fromLang, toLang]);

  // ✅ Fetch pricing dynamically when selection changes
  useEffect(() => {
    if (!fromLang || !toLang || !priority || numPages < 1) return;
    const certificationParam = certificationType || "professional";
    
    fetch(`https://quotations-a93u.onrender.com/get-pricing?from=${fromLang}&to=${toLang}&priority=${priority}&certification=${certificationParam}`)
      .then(response => response.json())
      .then(data => setTotalPrice((data.pricePerPage || 0) * numPages))
      .catch(error => console.error("Error fetching price:", error));
  }, [fromLang, toLang, priority, certificationType, numPages, service]);

  // ✅ Store values in local storage
  useEffect(() => {
    localStorage.setItem("service", service);
    localStorage.setItem("priority", priority);
    localStorage.setItem("numPages", numPages);
    localStorage.setItem("email", email);
  }, [service, priority, numPages, email]);

  // ✅ Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromLang || !toLang || !email) {
      alert("Please fill in all required fields.");
      return;
    }
    navigate("/select-options", {
      state: {
        service,
        fromLang,
        toLang,
        priority,
        numPages,
        email,
        price: totalPrice,
        delivery: priority === "express" ? "24 Hours" : "72 Hours",
        certificationType,
      },
    });
  };

  return (
    <div className="choose-service">
      <h2 className="title">Order Now</h2>
      <ProgressBar currentStep={1} />
      <div className="container">
        <div className="left">
          {/* ✅ Service Selection Buttons */}
          <div className="service-buttons">
            <button className={`service-button ${service === "Certified" ? "active" : ""}`} onClick={() => setService("Certified")}>
              Certified Translation
            </button>
            <button className={`service-button ${service === "Professional" ? "active" : ""}`} onClick={() => setService("Professional")}>
              Professional Translation
            </button>
          </div>

          {/* ✅ Language Selection */}
          <div className="language-selection">
            <select value={fromLang} onChange={(e) => setFromLang(e.target.value)}>
              <option value="">Translate from</option>
              {availableLanguages.map((lang, index) => (
                <option key={index} value={lang} disabled={lang === toLang}>
                  {lang}
                </option>
              ))}
            </select>
            <select value={toLang} onChange={(e) => setToLang(e.target.value)}>
              <option value="">Translate to</option>
              {availableLanguages.map((lang, index) => (
                <option key={index} value={lang} disabled={lang === fromLang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Priority Selection */}
          <div className="priority-options">
            <label>Priority:</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="normal" checked={priority === "normal"} onChange={() => setPriority("normal")} />
                Normal (3 Days)
              </label>
              <label>
                <input type="radio" value="express" checked={priority === "express"} onChange={() => setPriority("express")} />
                Express (24 Hours)
              </label>
            </div>
          </div>

          {/* ✅ Certification Type Selection */}
          {certifications.length > 0 && (
            <div className="priority-options">
              <label>Certification Type:</label>
              <div className="radio-group">
                {certifications.map((cert, index) => (
                  <label key={index}>
                    <input type="radio" value={cert} checked={certificationType === cert} onChange={() => setCertificationType(cert)} />
                    {cert}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Number of Pages */}
          <div className="input-field">
            <label>Number of Pages:</label>
            <input type="text" value={numPages} onChange={(e) => setNumPages(e.target.value)} />
          </div>

          {/* ✅ Email Input */}
          <div className="input-field">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* ✅ Quote Summary (Integrated Here) */}
          <div className="quote-summary-container">
            <h2>Quote Summary</h2>
            <div className="summary-item">
              <span className="summary-label">Service Type:</span>
              <span className="summary-value">{service}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Languages:</span>
              <span className="summary-value">{fromLang} → {toLang}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Priority:</span>
              <span className="summary-value">{priority.replace("-", " ").toUpperCase()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pages:</span>
              <span className="summary-value">{numPages}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Price:</span>
              <span className="summary-value total-price">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button className="next-button" onClick={handleSubmit}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default ChooseService;
