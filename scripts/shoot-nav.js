// Capture the mobile nav in its open state, which the default shot misses.
const { chromium } = require("./pw").loadPlaywright();

const BASE = process.env.BASE || "http://localhost:3109";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.locator('button[aria-controls="site-mobile-nav"]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/nav-open.png" });
  console.log("captured /tmp/nav-open.png");
  await browser.close();
})();
