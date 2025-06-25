import React from "react";
import "../styles/components.css";

function FilterGroup({ children, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };
  return (
    <form className="filters" onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

export default FilterGroup;
