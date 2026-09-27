// Visual check: confirm the mobile disclosure nav works at each breakpoint and
// that no page throws. Run against a live server (pnpm start -p 3100).
const { chromium } = require("./pw").loadPlaywright();

const BASE = process.env.BASE || "http://localhost:3100";
const ROUTES = ["/", "/proof", "/verify", "/demo", "/lab", "/onboarding", "/dashboard"];
const VIEWPORTS = [
  ["mobile", 390, 844],
  ["tablet", 768, 1024],
  ["desktop", 1440, 900],
];

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  for (const [name, width, height] of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`${name} console: ${m.text().slice(0, 140)}`);
    });

    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const btn = page.locator('button[aria-controls="site-mobile-nav"]');
    const visible = await btn.isVisible();
    let links = 0;
    let expanded = "n/a";
    if (visible) {
      await btn.click();
      await page.waitForTimeout(300);
      links = await page.locator("#site-mobile-nav a").count();
      expanded = await btn.getAttribute("aria-expanded");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      const closedAfterEsc = (await page.locator("#site-mobile-nav").count()) === 0;
      expanded += closedAfterEsc ? "+esc-closes" : "+ESC-BROKEN";
    }
    console.log(
      `${name.padEnd(8)} ${String(width).padStart(4)}px  hamburger=${visible}  panelLinks=${links}  ${expanded}`
    );
    await page.screenshot({ path: `/tmp/shot-${name}.png` });
    await page.close();
  }

  // Sweep every route at mobile width for overflow, the usual cause of a
  // horizontal scrollbar that screenshots do not show.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (e) => errors.push(`route: ${e.message}`));
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    console.log(`${route.padEnd(13)} hOverflow=${overflow}px ${overflow > 2 ? "  <-- OVERFLOW" : ""}`);
  }
  await page.close();

  console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console/page errors");
  await browser.close();
})();
