import React, { useState } from "react";
import FuelUsageSiteInchargeForm from "../components/FuelUsageSiteInchargeForm";
import FuelUsageDriverForm from "../components/FuelUsageDriverForm";

function FuelUsage() {
  const [selectedTab, setSelectedTab] = useState("siteIncharge");

  return (
    <div id="usage" className="content-panel">
      <h2 style={{ marginBottom: '20px', color: '#015998', fontWeight: 700, fontSize: 27 }}>
        Fuel Usage Entry
      </h2>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
        <button
          type="button"
          className={`btn ${selectedTab === "siteIncharge" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "8px 0 0 8px", minWidth: 120 }}
          onClick={() => setSelectedTab("siteIncharge")}
        >
          Site Incharge
        </button>
        <button
          type="button"
          className={`btn ${selectedTab === "driver" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "0 8px 8px 0", minWidth: 120 }}
          onClick={() => setSelectedTab("driver")}
        >
          Driver
        </button>
      </div>
      {selectedTab === "siteIncharge" ? (
        <FuelUsageSiteInchargeForm />
      ) : (
        <FuelUsageDriverForm />
      )}
    </div>
  );
}

export default FuelUsage;
