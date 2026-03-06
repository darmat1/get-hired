// components/promo/trustpilot-widget.tsx
"use client";

import Script from "next/script";

export function TrustpilotWidget() {
  return (
    <>
      <Script
        src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="afterInteractive"
      />
      <div
        className="trustpilot-widget"
        data-locale="en-US"
        data-template-id="56278e9abfbbba0bdcd568bc"
        data-businessunit-id="69a8525ee76eb2190507f770"
        data-style-height="52px"
        data-style-width="100%"
        data-token="739721ae-c1db-408f-be15-49d017af8ad4"
      >
        <a
          href="https://www.trustpilot.com/review/gethired.work"
          target="_blank"
          rel="noopener"
        >
          Trustpilot
        </a>
      </div>
    </>
  );
}
