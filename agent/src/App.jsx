import { useEffect, useRef, useState, useCallback } from 'react';

function App() {
  const [htmlContent, setHtmlContent] = useState('');
  const containerRef = useRef(null);

  const fetchScript = useCallback(async () => {
    try {
      const res = await fetch('/apps/public/api/v1/public/widget-scripts');
      const data = await res.json();

      if (data.success && data.script) {
        setHtmlContent(data.script);
      }
    } catch (err) {
      console.error('Failed to fetch script:', err);
    }
  }, []);

  useEffect(() => {
    fetchScript();
  }, [fetchScript]);

  useEffect(() => {
    if (!htmlContent) return;

    // Optional: clear container content if needed
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create a script element and set its content to the fetched script
    const scriptEl = document.createElement('script');
    scriptEl.type = 'text/javascript';
    scriptEl.text = htmlContent;

    document.body.appendChild(scriptEl);

    // Cleanup: remove the script on component unmount or htmlContent change
    return () => {
      document.body.removeChild(scriptEl);
    };
  }, [htmlContent]);

  return <div ref={containerRef} />;
}

export default App;
