"use client";

import Script from "next/script";

import { useConsent } from "./ConsentProvider";

const GOOGLE_ANALYTICS_ID = "G-X5S5S1HR9S";
const CLARITY_PROJECT_ID = "xlccmq9bsc";

export default function AnalyticsScripts() {
  const { consent } = useConsent();

  if (consent !== "accepted") {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />

      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer =
            window.dataLayer || [];

          function gtag() {
            window.dataLayer.push(arguments);
          }

          window.gtag = gtag;

          gtag("consent", "default", {
            analytics_storage: "granted",
            ad_storage: "denied"
          });

          gtag("js", new Date());

          gtag("config", "${GOOGLE_ANALYTICS_ID}", {
            page_title: document.title,
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>

      {/* Microsoft Clarity */}

      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
      >
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){
              (c[a].q=c[a].q||[]).push(arguments)
            };

            t=l.createElement(r);
            t.async=1;
            t.src="https://www.clarity.ms/tag/"+i;

            y=l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t,y);
          })(
            window,
            document,
            "clarity",
            "script",
            "${CLARITY_PROJECT_ID}"
          );

          window.clarity("consentv2", {
            ad_Storage: "denied",
            analytics_Storage: "granted"
          });
        `}
      </Script>
    </>
  );
}