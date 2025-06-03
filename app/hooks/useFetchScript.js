import { useEffect, useState, useCallback } from "react";

const useFetchScript = () => {
  const [script, setScript] = useState("");

  const fetchScript = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/widget-scripts");
      const data = await response.json();
      if (data.success && data.script) {
        setScript(data.script);
      } else {
        setScript("");
      }
    } catch (err) {
      console.error("Failed to fetch script:", err);
    }
  }, []);

  useEffect(() => {
    fetchScript();
  }, [fetchScript]);

  return { script, refetch: fetchScript };
};

export default useFetchScript;
