import { useEffect } from "react";

export default function Layout({ children }) {
  useEffect(() => {
    if (!document.getElementById("adsense-script")) {
      const script = document.createElement("script");
      script.id = "adsense-script";
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9193408952526894";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  return children;
}