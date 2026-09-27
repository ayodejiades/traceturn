// Capture full-page screenshots of chosen routes, to review the warm palette
// across surfaces rather than only the hero. Run against a live server.
const { chromium } = require("./pw").loadPlaywright();

const BASE = process.env.BASE || "http://localhost:3106";
const ROUTES = (process.env.ROUTES || "/,/proof,/verify,/onboarding").split(",");
const WIDTH = Number(process.env.WIDTH || 1440);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
  for (const route of ROUTES) {
    const name = route === "/" ? "home" : route.replace(/\//g, "-").replace(/^-/, "");
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.screenshot({ path: `/tmp/full-${name}.png`, fullPage: true });
    console.log(`captured /tmp/full-${name}.png`);
  }
  await browser.close();
})();
