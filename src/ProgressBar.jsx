import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ currentStep }) => {
  const steps = ['Choose Service', 'Select Options', 'Payment'];

  return (
    <div className="progress-bar">
      {steps.map((step, index) => (
        <div key={index} className={`step ${index + 1 <= currentStep ? 'active' : ''}`}>
          <div className="step-number">{index + 1}</div>
          <div className="step-text">{step}</div>
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;

