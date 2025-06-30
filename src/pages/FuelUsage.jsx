import React, { useState, useEffect } from "react";
import FuelUsageSiteInchargeForm from "../components/FuelUsageSiteInchargeForm";
import FuelUsageDriverForm from "../components/FuelUsageDriverForm";
import { useUserStore } from "../store/userStore";

function FuelUsage() {
  const user = useUserStore((state) => state.user);
  const role = user?.role; // assuming user.role is either "site-incharge" or "driver"
  const [selectedTab, setSelectedTab] = useState("siteIncharge");

  // Set default tab based on role
  useEffect(() => {
    if (role === "driver") setSelectedTab("driver");
    else if (role === "site-incharge") setSelectedTab("siteIncharge");
  }, [role]);

  const handleTabClick = (tab) => {
    // Prevent switching to disabled tab
    if (role === "site-incharge" && tab === "driver") return;
    if (role === "driver" && tab === "siteIncharge") return;
    setSelectedTab(tab);
  };

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
          onClick={() => handleTabClick("siteIncharge")}
          disabled={role === "driver"}
        >
          Site Incharge
        </button>
        <button
          type="button"
          className={`btn ${selectedTab === "driver" ? "btn-primary" : "btn-secondary"}`}
          style={{ borderRadius: "0 8px 8px 0", minWidth: 120 }}
          onClick={() => handleTabClick("driver")}
          disabled={role === "site-incharge"}
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
