import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import "./ChooseService.css";

const ChooseService = () => {
  const navigate = useNavigate();
  const API_BASE_URL = "http://127.0.0.1:10000";

  // Initializing State with Local Storage
  const [service, setService] = useState(() => localStorage.getItem("service") || "Professional");
  const [fromLang, setFromLang] = useState(() => localStorage.getItem("fromLang") || "");
  const [toLang, setToLang] = useState(() => localStorage.getItem("toLang") || "");
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [priority, setPriority] = useState(() => localStorage.getItem("priority") || "normal");
  const [numPages, setNumPages] = useState(() => parseInt(localStorage.getItem("numPages")) || 1);
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [totalPrice, setTotalPrice] = useState(0);
  const [certificationType, setCertificationType] = useState("");
  const [certifications, setCertifications] = useState([]);
  const [translationType, setTranslationType] = useState("direct");
  const [pricingDetails, setPricingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available languages
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/get-languages`)
      .then(response => response.json())
      .then(data => {
        setAvailableLanguages(data.languages);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching languages:", error);
        setError("Failed to load languages. Please try again.");
        setLoading(false);
      });
  }, []);

  // Fetch certifications when service, language change
  useEffect(() => {
    if (!fromLang || !toLang) return;
    
    setLoading(true);
    setCertifications([]);
    setCertificationType("");
    setError("");
    
    let endpoint = service === "Professional"
      ? "get-certifications-professional"
      : "get-certifications-limited";
    
    fetch(`${API_BASE_URL}/${endpoint}?from=${fromLang}&to=${toLang}`)
      .then(response => response.json())
      .then(data => {
        if (data.certifications && data.certifications.length > 0) {
          setCertifications(data.certifications);
          setCertificationType(data.certifications[0]);
          setTranslationType(data.translationType || "direct");
        } else {
          setCertifications([]);
          setError("No certifications available for the selected language pair");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching certifications:", error);
        setError("Failed to load certifications. Please try again.");
        setLoading(false);
      });
  }, [service, fromLang, toLang]);

  // Fetch pricing dynamically when selection changes
  useEffect(() => {
    if (!fromLang || !toLang || !priority || !certificationType || numPages < 1) return;
    
    setLoading(true);
    setTotalPrice(0);
    setPricingDetails(null);
    
    fetch(`${API_BASE_URL}/get-pricing?from=${fromLang}&to=${toLang}&priority=${priority}&certification=${certificationType}`)
      .then(response => response.json())
      .then(data => {
        if (data.pricePerPage !== null) {
          setTotalPrice((data.pricePerPage || 0) * numPages);
          setPricingDetails(data);
          setTranslationType(data.translationType || "direct");
          setError("");
        } else {
          setTotalPrice(0);
          setPricingDetails(null);
          setError(data.message || "Pricing not available for the selected options");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching price:", error);
        setError("Failed to calculate price. Please try again.");
        setLoading(false);
      });
  }, [fromLang, toLang, priority, certificationType, numPages, service]);

  // Store values in local storage
  useEffect(() => {
    localStorage.setItem("service", service);
    localStorage.setItem("fromLang", fromLang);
    localStorage.setItem("toLang", toLang);
    localStorage.setItem("priority", priority);
    localStorage.setItem("numPages", numPages);
    localStorage.setItem("email", email);
  }, [service, fromLang, toLang, priority, numPages, email]);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromLang || !toLang || !email || !certificationType) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (totalPrice <= 0) {
      setError("Unable to calculate price. Please check your selections.");
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
        translationType,
        pricingDetails
      },
    });
  };

  // Helper function to validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle number of pages change
  const handleNumPagesChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setNumPages(value < 1 ? 1 : value);
  };

  return (
    <div className="choose-service">
      <h2 className="title">Order Now</h2>
      <ProgressBar currentStep={1} />
      <div className="container">
        <div className="left">
          {/* Service Selection Buttons */}
          <div className="service-buttons">
            <button 
              className={`service-button ${service === "Certified" ? "active" : ""}`} 
              onClick={() => setService("Certified")}
            >
              Certified Translation
            </button>
            <button 
              className={`service-button ${service === "Professional" ? "active" : ""}`} 
              onClick={() => setService("Professional")}
            >
              Professional Translation
            </button>
          </div>

          {/* Language Selection */}
          <div className="language-selection">
            <select 
              value={fromLang} 
              onChange={(e) => setFromLang(e.target.value)}
              disabled={loading}
            >
              <option value="">Translate from</option>
              {availableLanguages.map((lang, index) => (
                <option key={index} value={lang} disabled={lang === toLang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <select 
              value={toLang} 
              onChange={(e) => setToLang(e.target.value)}
              disabled={loading}
            >
              <option value="">Translate to</option>
              {availableLanguages.map((lang, index) => (
                <option key={index} value={lang} disabled={lang === fromLang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Translation Type Info */}
          {translationType === "cross" && fromLang && toLang && (
            <div className="info-box">
              <p>No direct translation available. We'll translate via English (UK) as an intermediary language.</p>
            </div>
          )}

          {/* Priority Selection */}
          <div className="priority-options">
            <label>Priority:</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  value="normal" 
                  checked={priority === "normal"} 
                  onChange={() => setPriority("normal")}
                  disabled={loading} 
                />
                Normal (3 Days)
              </label>
              <label>
                <input 
                  type="radio" 
                  value="express" 
                  checked={priority === "express"} 
                  onChange={() => setPriority("express")}
                  disabled={loading}
                />
                Express (24 Hours)
              </label>
            </div>
          </div>

          {/* Certification Type Selection */}
          {certifications.length > 0 && (
            <div className="certification-options">
              <label>Certification Type:</label>
              <div className="radio-group">
                {certifications.map((cert, index) => (
                  <label key={index}>
                    <input 
                      type="radio" 
                      value={cert} 
                      checked={certificationType === cert} 
                      onChange={() => setCertificationType(cert)}
                      disabled={loading}
                    />
                    {cert.charAt(0).toUpperCase() + cert.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Number of Pages */}
          <div className="input-field">
            <label>Number of Pages:</label>
            <input 
              type="number" 
              min="1"
              value={numPages} 
              onChange={handleNumPagesChange}
              disabled={loading}
            />
          </div>

          {/* Email Input */}
          <div className="input-field">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className={email && !validateEmail(email) ? "error" : ""}
              disabled={loading}
            />
            {email && !validateEmail(email) && (
              <p className="error-message">Please enter a valid email address</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Quote Summary */}
          <div className="quote-summary-container">
            <h2>Quote Summary</h2>
            <div className="summary-item">
              <span className="summary-label">Service Type:</span>
              <span className="summary-value">{service}</span>
            </div>
            {fromLang && toLang && (
              <div className="summary-item">
                <span className="summary-label">Languages:</span>
                <span className="summary-value">
                  {fromLang.charAt(0).toUpperCase() + fromLang.slice(1)} → {toLang.charAt(0).toUpperCase() + toLang.slice(1)}
                </span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Priority:</span>
              <span className="summary-value">{priority === "express" ? "EXPRESS (24h)" : "NORMAL (72h)"}</span>
            </div>
            {certificationType && (
              <div className="summary-item">
                <span className="summary-label">Certification:</span>
                <span className="summary-value">{certificationType.charAt(0).toUpperCase() + certificationType.slice(1)}</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Pages:</span>
              <span className="summary-value">{numPages}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Translation Type:</span>
              <span className="summary-value">{translationType === "direct" ? "Direct" : "Via Intermediary"}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Price:</span>
              <span className="summary-value total-price">${totalPrice.toFixed(2)}</span>
            </div>
            
            {/* Detailed breakdown for cross translations */}
            {pricingDetails && pricingDetails.translationType === "cross" && (
              <div className="price-breakdown">
                <h3>Price Breakdown</h3>
                <div className="breakdown-item">
                  <span>First Translation:</span>
                  <span>${pricingDetails.firstLegPrice.toFixed(2)} × {numPages} pages</span>
                </div>
                <div className="breakdown-item">
                  <span>Second Translation:</span>
                  <span>${pricingDetails.secondLegPrice.toFixed(2)} × {numPages} pages</span>
                </div>
              </div>
            )}
          </div>

          <button 
            className="next-button" 
            onClick={handleSubmit}
            disabled={loading || !fromLang || !toLang || !certificationType || !validateEmail(email) || totalPrice <= 0}
          >
            {loading ? "Loading..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseService;
