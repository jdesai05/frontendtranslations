import React from "react";

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: "red", padding: "10px" }}>
      <ul style={{ 
        listStyle: "none", 
        display: "flex", 
        justifyContent: "center", 
        margin: 0, 
        padding: 0 
      }}>
        {["About Us", "Services", "Languages", "Location", "Case Studies", "Blog"].map((item, index) => (
          <li key={index} style={{ 
            margin: "0 15px", 
            color: "white", 
            fontSize: "18px", 
            fontWeight: "bold" 
          }}>
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
