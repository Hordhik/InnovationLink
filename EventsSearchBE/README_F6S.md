F6S (https://www.f6s.com/events/)

Notes
-----
- F6S uses anti-bot protections (hCaptcha / interstitial) that often serve a "Checking your browser" page to automated requests.
- The scraper includes a best-effort static HTML parser, but when the site is protected the scraper will detect the interstitial and skip F6S to avoid blocking the whole scraping run.

Recommended next steps if you need reliable F6S data
---------------------------------------------------
1) Use a headless browser (Playwright/Selenium) and a real browser session to render the page. Note: this will still hit hCaptcha and may require a solved session cookie or a captcha-solving service.
2) Investigate a private/public JSON endpoint or RSS feed used by the site via browser network inspection; if found, fetch that directly.
3) Consider asking F6S for an API or data export for legitimate use (recommended for production).

Why we skip when blocked
------------------------
- Automatically trying to bypass captchas is fragile and may violate the site's terms of service.
- Skipping F6S when blocked keeps the rest of the scrapers reliable and avoids unnecessary retries.

How the code behaves now
------------------------
- The scraper returns an empty list and logs a short message when it detects an interstitial.
- If the page returns normal HTML, the scraper will attempt to parse event cards and/or JSON-LD.
