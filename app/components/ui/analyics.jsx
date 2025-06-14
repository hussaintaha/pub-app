import React, { useCallback, useEffect, useState } from "react";
import Core from "../analytics/core";
import AnalyticsTrends from "../analytics/analyticsTrends";
import GeoPerformance from "../analytics/GeoPerformance";

const AnalyicsUpdate = () => {
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    const response = await fetch(`/api/v1/analytics`, { method: "GET" });

    const data = await response.json();

    const { success, analytics: analyticsData, error } = data;

    if (success && analyticsData) {
      setAnalytics(analyticsData?.analytics);
    } else if (!success && error) {
      shopify.toast.show(error, { duration: 5000 });
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <>
      {analytics && (
        <>
          <Core analytics={analytics} />
          <AnalyticsTrends trends={analytics?.trends} />
          <GeoPerformance geographicData={analytics?.geographic_data} />
        </>
      )}
    </>
  );
};

export default AnalyicsUpdate;
