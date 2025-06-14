import React, { useCallback, useEffect, useState } from "react";
import LiveActivityFeed from "../activity/feed";

const Activity = () => {
  const [activity, setActivity] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    const response = await fetch(`/api/v1/live-activity`, { method: "GET" });

    const data = await response.json();

    const { success, activity: activityData, error } = data;

    if (success && activityData) {
        console.log('activityData: ', activityData);
      setActivity(activityData);
    } else if (!success && error) {
      shopify.toast.show(error, { duration: 5000 });
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <>
      {activity && (
        <>
          <LiveActivityFeed data={activity} /> 
        </>
      )}
    </>
  );
};

export default Activity;
