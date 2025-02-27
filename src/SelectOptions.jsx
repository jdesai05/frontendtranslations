import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import "./SelectOptions.css";

const SelectOptions = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Default selections
  const [translation, setTranslation] = useState("Standard");
  const [certification, setCertification] = useState("Certified Translator (NAATI)");
  const [apostille, setApostille] = useState(false);
  const [physicalCopy, setPhysicalCopy] = useState(false);
  const [totalPrice, setTotalPrice] = useState(location.state?.price || 0);

  // Address state (Fixed: Now an object instead of an empty string)
  const [address, setAddress] = useState({
    street: "",
    apartment: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
  });

  // Handle address input change (Fixed: Now correctly updates object properties)
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  // Data from previous step
  const {
    service,
    fromLang,
    toLang,
    file,
    priority,
    numPages,
    email,
    price: basePrice,
    delivery,
  } = location.state || {};
  
  // Pricing details
  const prices = {
    translation: {
      Standard: 15,
      Professional: 20,
      Specialist: 25,
    },
    certification: {
      "Certified Translator (NAATI)": 0,
      "Standard Certification": 5,
    },
    apostille: 10,
    physicalCopy: 5,
  };

  // Update price when selection changes
  useEffect(() => {
    const translationCost = prices.translation[translation] * numPages;
    const certificationCost = prices.certification[certification];
    const apostilleCost = apostille ? prices.apostille : 0;
    const physicalCopyCost = physicalCopy ? prices.physicalCopy : 0;

    const newTotalPrice = translationCost + certificationCost + apostilleCost + physicalCopyCost;
    setTotalPrice(newTotalPrice);
  }, [translation, certification, apostille, physicalCopy, numPages]);

  return (
    <div className="translation-service-container">
      <ProgressBar currentStep={2} />

      {/* Translation Type Selection */}
      <div className="section">
        <h2>Select Translation Type</h2>
        <div className="options-container">
          {["Standard", "Professional", "Specialist"].map((type) => (
            <div
              key={type}
              className={`translation-option ${translation === type ? "selected" : ""}`}
              onClick={() => setTranslation(type)}
            >
              <h3>{type} Translation {type === "Specialist" && <span className="recommended">Recommended</span>}</h3>
              <ul>
                <li>{type === "Standard" ? "Professional translators" : type === "Professional" ? "Expert linguists" : "Certified experts"}</li>
                <li>{type === "Standard" ? "Accurate and reliable" : type === "Professional" ? "Industry-specific accuracy" : "Guaranteed quality"}</li>
              </ul>
              <span className="price">${prices.translation[type]}/page</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certification Selection */}
      <div className="section">
        <h2>Select Certification</h2>
        <div className="options-container">
          {Object.keys(prices.certification).map((certType) => (
            <div
              key={certType}
              className={`certification-option ${certification === certType ? "selected" : ""}`}
              onClick={() => setCertification(certType)}
            >
              <h3>{certType}</h3>
              <p>{certType === "Certified Translator (NAATI)" ? "Accepted worldwide" : "For personal use"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Services */}
      <div className="section">
        <h2>Additional Services</h2>
        <div className="checkbox-container">
          <label>
            <input type="checkbox" checked={apostille} onChange={() => setApostille(!apostille)} />
            Add Apostille (Legalisation) (+${prices.apostille})
          </label>
        </div>
        <div className="checkbox-container">
          <label>
            <input type="checkbox" checked={physicalCopy} onChange={() => setPhysicalCopy(!physicalCopy)} />
            Request a Physical Copy (+${prices.physicalCopy})
          </label>
        </div>
      </div>

      {/* Address Input (Shown only if Physical Copy is selected) */}
      {physicalCopy && (
        <div className="section">
          <h2>Enter Delivery Address</h2>
          <input
            type="text"
            name="street"
            className="address-input"
            placeholder="Street Address"
            value={address.street}
            onChange={handleAddressChange}
          />
          <input
            type="text"
            name="apartment"
            className="address-input"
            placeholder="Apartment, studio, or floor"
            value={address.apartment}
            onChange={handleAddressChange}
          />
          <div className="address-row">
            <input
              type="text"
              name="city"
              className="address-input half-width"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="state"
              className="address-input half-width"
              placeholder="State / Region"
              value={address.state}
              onChange={handleAddressChange}
            />
          </div>
          <div className="address-row">
            <input
              type="text"
              name="postcode"
              className="address-input half-width"
              placeholder="Postcode"
              value={address.postcode}
              onChange={handleAddressChange}
            />
            <select
              name="country"
              className="address-input half-width"
              value={address.country}
              onChange={handleAddressChange}
            >
              <option>India</option>
              <option>USA</option>
              <option>UK</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
        </div>
      )}

      {/* Quote Summary */}
      <div className="quote-summary">
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
          <span className="summary-value total-price">${totalPrice}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button
          className="previous-button"
          onClick={() => navigate("/", { state: { service, fromLang, toLang, file, priority, numPages, email, price: basePrice, delivery } })}
        >
          Previous
        </button>
        <button
          className="next-button"
          onClick={() => {
            if (physicalCopy && !address.street.trim()) {
              alert("Please enter a valid address for the physical copy.");
              return;
            }
            navigate("/payment", { state: { totalPrice, address: physicalCopy ? address : null } });
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectOptions;
