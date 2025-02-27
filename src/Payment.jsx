import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Payment.css";
import ProgressBar from "./ProgressBar";

const Payment = () => {
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    country: "India",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  // Get the totalPrice from location.state passed from SelectOptions
  const totalPrice = location.state?.totalPrice || 0;

  return (
    <div className="payment-container">
      {/* Progress Bar */}
      <ProgressBar currentStep={3} />

      <div className="payment-form">
        <h2>Pay with a Credit / Debit card</h2>

        {/* Name Input */}
        <label>Your Name <span className="required">*</span></label>
        <input
          type="text"
          name="name"
          className="payment-input"
          placeholder="John Smith"
          value={paymentDetails.name}
          onChange={handleChange}
        />

        {/* Email and Phone Input */}
        <div className="payment-row">
          <div className="half-width">
            <label>Your Email Address <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              className="payment-input"
              placeholder="john.smith@gmail.com"
              value={paymentDetails.email}
              onChange={handleChange}
            />
          </div>
          <div className="half-width">
            <label>Your Phone Number <span className="required">*</span></label>
            <div className="phone-input">
              <span className="flag">🇮🇳</span>
              <input
                type="text"
                name="phone"
                className="payment-input phone-number"
                placeholder="Phone number"
                value={paymentDetails.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div className="card-section">
          <label>Card number</label>
          <div className="card-input">
            <input
              type="text"
              name="cardNumber"
              className="payment-input"
              placeholder="1234 1234 1234 1234"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
            />
            <span className="card-icon">💳</span>
          </div>

          <div className="card-row">
            <div className="third-width">
              <label>Expiration date</label>
              <input
                type="text"
                name="expiry"
                className="payment-input"
                placeholder="MM / YY"
                value={paymentDetails.expiry}
                onChange={handleChange}
              />
            </div>
            <div className="third-width">
              <label>Security code</label>
              <div className="cvc-input">
                <input
                  type="text"
                  name="cvc"
                  className="payment-input"
                  placeholder="CVC"
                  value={paymentDetails.cvc}
                  onChange={handleChange}
                />
                <span className="cvc-icon">🔒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Country Selection */}
        <label>Country</label>
        <select
          name="country"
          className="payment-input"
          value={paymentDetails.country}
          onChange={handleChange}
        >
          <option>India</option>
          <option>USA</option>
          <option>UK</option>
          <option>Canada</option>
          <option>Australia</option>
        </select>

        {/* Payment Actions */}
        <div className="payment-actions">
          <a href="#" className="back-link">← Back to Options</a>
          <button className="pay-button">
            Pay ${totalPrice}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
