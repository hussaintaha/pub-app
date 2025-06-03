import { useCallback, useEffect, useState } from 'react';

const useFetchThemes = () => {
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState(null);

  const fetchThemesHandler = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/themes", { method: "GET" });
      const result = await response.json();

      const { success, themes: themeData, error } = result;

      if (success && themeData) {
        setThemes(themeData);
        setError(null);
      } else {
        setError(error || "Failed to fetch themes.");
        shopify.toast.show(error, { duration: 5000, isError: true });
      }
    } catch (err) {
      console.error("Error fetching themes:", err);
      setError("Unexpected error occurred.");
    }
  }, []);

  useEffect(() => {
    fetchThemesHandler();
  }, [fetchThemesHandler]);

  return { themes, error };
};

export default useFetchThemes;
