"use client"

import { useState, useEffect } from "react"
import { Upload, Phone, HelpCircle } from "lucide-react"
import "./TranslationCheckout.css"
import { loadStripe } from '@stripe/stripe-js';


export default function TranslationCheckout() {
  const API_BASE_URL = "https://quotations-a93u.onrender.com/"

  // Initializing State with Local Storage
  const [service, setService] = useState(() => localStorage.getItem("service") || "Professional")
  const [fromLanguage, setFromLanguage] = useState(() => localStorage.getItem("fromLang") || "")
  const [toLanguage, setToLanguage] = useState(() => localStorage.getItem("toLang") || "")
  const [availableLanguages, setAvailableLanguages] = useState([])
  const [priority, setPriority] = useState(() => localStorage.getItem("priority") || "normal")
  const [pages, setPages] = useState(() => parseInt(localStorage.getItem("numPages")) || 1)
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "")
  const [totalPrice, setTotalPrice] = useState(0)
  const [certificationType, setCertificationType] = useState("")
  const [certifications, setCertifications] = useState([])
  const [translationType, setTranslationType] = useState("direct")
  const [pricingDetails, setPricingDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [files, setFiles] = useState([])
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  // Helper function to make API calls with better error handling
  const fetchFromAPI = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${await response.text()}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch available languages
  useEffect(() => {
    setLoading(true);
    fetchFromAPI("get-languages")
      .then(data => {
        setAvailableLanguages(data.languages);
        setLoading(false);
      })
      .catch(error => {
        setError(`Failed to load languages: ${error.message}`);
        setLoading(false);
      });
  }, []);

  // Fetch certifications when service, language change
  useEffect(() => {
    if (!fromLanguage || !toLanguage) return;
    
    setLoading(true);
    setCertifications([]);
    setCertificationType("");
    setError("");
    
    const endpoint = service === "Professional"
      ? "get-certifications-professional"
      : "get-certifications-limited";
    
    fetchFromAPI(`${endpoint}?from=${fromLanguage}&to=${toLanguage}`)
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
        setError(`Failed to load certifications: ${error.message}`);
        setLoading(false);
      });
  }, [service, fromLanguage, toLanguage]);

  // Fetch pricing dynamically when selection changes
  useEffect(() => {
    if (!fromLanguage || !toLanguage || !priority || !certificationType || pages < 1) return;
    
    setLoading(true);
    setTotalPrice(0);
    setPricingDetails(null);
    
    fetchFromAPI(`get-pricing?from=${fromLanguage}&to=${toLanguage}&priority=${priority}&certification=${certificationType}`)
      .then(data => {
        if (data.pricePerPage !== undefined && data.pricePerPage !== null) {
          setTotalPrice((data.pricePerPage || 0) * pages);
          setPricingDetails(data);
          setTranslationType(data.translationType || "direct");
          setError("");
          
          // Set estimated delivery date based on priority
          const today = new Date();
          const deliveryDate = new Date(today);
          if (priority === "express") {
            deliveryDate.setDate(today.getDate() + 1); // 24 hours
          } else {
            deliveryDate.setDate(today.getDate() + 3); // 72 hours
          }
          
          const options = { weekday: 'long', month: 'long', day: 'numeric' };
          setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', options));
          
        } else {
          setTotalPrice(0);
          setPricingDetails(null);
          setError(data.message || "Pricing not available for the selected options");
        }
        setLoading(false);
      })
      .catch(error => {
        setError(`Failed to calculate price: ${error.message}`);
        setLoading(false);
      });
  }, [fromLanguage, toLanguage, priority, certificationType, pages, service]);

  // Store values in local storage
  useEffect(() => {
    localStorage.setItem("service", service);
    localStorage.setItem("fromLang", fromLanguage);
    localStorage.setItem("toLang", toLanguage);
    localStorage.setItem("priority", priority);
    localStorage.setItem("numPages", pages);
    localStorage.setItem("email", email);
  }, [service, fromLanguage, toLanguage, priority, pages, email]);

  const handlePagesChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setPages(value < 1 ? 1 : value);
  };
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle service selection
  const handleServiceChange = (selectedService) => {
    setService(selectedService);
    // Reset certifications when service changes
    setCertifications([]);
    setCertificationType("");
  };

const handleSubmit = async () => {
  if (!fromLanguage || !toLanguage || !certificationType) {
    setError("Please fill in all required fields.");
    return;
  }

  if (totalPrice <= 0) {
    setError("Unable to calculate price. Please check your selections.");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("https://quotations-a93u.onrender.com/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(totalPrice * 100),
        email,
        fromLanguage,
        toLanguage,
        certificationType,
        priority,
        pages, // convert to cents/pence
      })
    });

    const data = await response.json();
    console.log("Stripe Session ID:", data.id);

    const stripe = await loadStripe("pk_test_51RA1lUSJR69pekxjT995MVMtICI2AlKRGUO8TVJS8W1di4fBW7MxfhlO2653lviB8obTcPtNZGXJtho1nlwMVx0h00nntme8TY"); // your publishable key

    const result = await stripe.redirectToCheckout({
      sessionId: data.id
    });

    if (result.error) {
      alert(result.error.message);
    }
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    setError("Something went wrong while initiating payment.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container">
      <div className="checkout-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Service Type Toggles */}
          <div 
            className={`certified-header ${service === "Certified" ? "active" : ""}`} 
            onClick={() => handleServiceChange("Certified")}
            style={{ 
              border: service === "Certified" ? "2px solid red" : null,
              color: service === "Certified" ? "red" : null 
            }}
          >
            <h2>Certified Translation</h2>
            <p>Certified, sworn, notarised and legalised translations, acceptable globally.</p>
          </div>

          <div 
            className={`professional-box ${service === "Professional" ? "active" : ""}`} 
            onClick={() => handleServiceChange("Professional")}
            style={{ 
              border: service === "Professional" ? "2px solid red" : null,
              color: service === "Professional" ? "red" : null 
            }}
          >
            <h2>Professional Translation</h2>
            <p>Standard, regular translation for individual and business use.</p>
          </div>

          {/* Translation Form */}
          <div className="translation-form">
            <div className="form-section">
              <h3>What language are you translating from, and into?</h3>

              <div className="language-selectors">
                <div className="form-group">
                  <label>Translate From</label>
                  <select 
                    value={fromLanguage} 
                    onChange={(e) => setFromLanguage(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select language</option>
                    {availableLanguages.map((lang, index) => (
                      <option key={index} value={lang} disabled={lang === toLanguage}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Translate To</label>
                  <select 
                    value={toLanguage} 
                    onChange={(e) => setToLanguage(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select language</option>
                    {availableLanguages.map((lang, index) => (
                      <option key={index} value={lang} disabled={lang === fromLanguage}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Translation Type Info */}
            {translationType === "cross" && fromLanguage && toLanguage && (
              <div className="info-box">
                <p>No direct translation available. We'll translate via English (UK) as an intermediary language.</p>
              </div>
            )}

            {/* Priority Selection */}
            <div className="form-section">
              <h3>Priority</h3>
              <div className="priority-options">
                <label className={`priority-option ${priority === "normal" ? "active" : ""}`}>
                  <input 
                    type="radio" 
                    value="normal" 
                    checked={priority === "normal"} 
                    onChange={() => setPriority("normal")}
                    disabled={loading}
                  />
                  Normal (3 Days)
                </label>
                <label className={`priority-option ${priority === "express" ? "active" : ""}`}>
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
              <div className="form-section">
                <h3>Certification Type</h3>
                <div className="certification-options">
                  {certifications.map((cert, index) => (
                    <label key={index} className={`certification-option ${certificationType === cert ? "active" : ""}`}>
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

            <div className="form-group">
              <label>Number of pages to be translated</label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={handlePagesChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={email && !validateEmail(email) ? "error" : ""}
                placeholder="Your email address"
                disabled={loading}
              />
              {email && !validateEmail(email) && (
                <p className="error-message">Please enter a valid email address</p>
              )}
            </div>

            <div className="form-section">
              <h3>Upload the documents you need translated</h3>
              <div className="upload-area">
                <input type="file" multiple onChange={handleFileChange} className="file-input" id="file-upload" />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload className="upload-icon" />
                  <span>Upload File(s)</span>
                </label>
                {files.length > 0 && <div className="file-count">{files.length} file(s) selected</div>}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="right-column">
          <div className="checkout-summary">
            <h2>Checkout</h2>

            <div className="quote-summary">
              <h3>Quote Summary</h3>

              <div className="summary-items">
                <div className="summary-item">
                  <span>Service</span>
                  <span className="value">{service} Translation</span>
                </div>

                {fromLanguage && toLanguage && (
                  <div className="summary-item">
                    <span>Languages</span>
                    <span className="value">
                      {fromLanguage.charAt(0).toUpperCase() + fromLanguage.slice(1)} → {toLanguage.charAt(0).toUpperCase() + toLanguage.slice(1)}
                    </span>
                  </div>
                )}

                <div className="summary-item">
                  <span>Certification Type</span>
                  <span className="value">{certificationType || "Standard Certified Translation"}</span>
                </div>

                <div className="summary-item">
                  <span>Translation Type</span>
                  <span className="value">{translationType === "direct" ? "Direct" : "Via Intermediary"}</span>
                </div>

                <div className="summary-item">
                  <span>Priority</span>
                  <span className="value">{priority === "express" ? "EXPRESS (24h)" : "NORMAL (72h)"}</span>
                </div>

                <div className="summary-item">
                  <div>
                    <div>Pricing (${pricingDetails?.pricePerPage?.toFixed(2) || "0.00"} / page)</div>
                    <div className="page-count">{pages} page{pages !== 1 ? "s" : ""}</div>
                  </div>
                  <span className="value">${totalPrice.toFixed(2)}</span>
                </div>

                {/* Detailed breakdown for cross translations */}
                {pricingDetails && pricingDetails.translationType === "cross" && (
                  <div className="price-breakdown">
                    <div className="breakdown-item">
                      <span>First Translation:</span>
                      <span>${pricingDetails.firstLegPrice.toFixed(2)} × {pages} pages</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Second Translation:</span>
                      <span>${pricingDetails.secondLegPrice.toFixed(2)} × {pages} pages</span>
                    </div>
                  </div>
                )}

                <div className="discount-section">
                  <div className="discount-label">Enter Discount Code</div>
                  <input type="text" placeholder="Enter code" className="discount-input" />
                </div>

                <div className="summary-item">
                  <span>Estimated Delivery</span>
                  <span className="value">{estimatedDelivery || "Contact for estimate"}</span>
                </div>

                <div className="total-price">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="checkout-footer">
              <div className="reviews-questions">
                <div className="reviews">
                  <div className="review-count">Based on 9,678 reviews</div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="star">
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="trustpilot">
                    <img src="/placeholder.svg?height=20&width=80" alt="Trustpilot" />
                  </div>
                </div>

                <div className="questions">
                  <h3>Have Questions?</h3>
                  <ul>
                    <li>
                      <Phone className="icon" />
                      <span>
                        Call us:{" "}
                        <a href="tel:+447365600193" className="contact-link">
                          +447365600193
                        </a>
                      </span>
                    </li>
                    <li>
                      <HelpCircle className="icon" />
                      <a href="#" className="contact-link">
                        Check our FAQ below
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <button 
                className="payment-button" 
                onClick={handleSubmit}
                disabled={loading || !fromLanguage || !toLanguage || !certificationType || (email && !validateEmail(email)) || totalPrice <= 0}
              >
                {loading ? "Loading..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
