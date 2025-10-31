import { useEffect, useRef } from "react";

interface TwitterEmbedProps {
  link: string;
}

export function TwitterEmbed({ link }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure twitter script is loaded
    const existingScript = document.getElementById("twitter-wjs");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If already present, reload tweets in case of re-render
      (window as any).twttr?.widgets?.load(containerRef.current);
    }
  }, [link]);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <blockquote className="twitter-tweet" data-theme="light">
        <a href={link.replace("x.com", "twitter.com")}></a>
      </blockquote>
    </div>
  );
}
