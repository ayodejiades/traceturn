// Measure one specific selector's box against the viewport, to tell "element is
// too wide" apart from "element is inside a scroll container and is fine".
const { chromium } = require("./pw").loadPlaywright();

const BASE = process.env.BASE || "http://localhost:3103";
const ROUTE = process.env.ROUTE || "/onboarding";
const SEL = process.env.SEL || 'nav[aria-label="Progress"]';
const WIDTH = Number(process.env.WIDTH || 390);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 844 } });
  await page.goto(BASE + ROUTE, { waitUntil: "networkidle" });

  const doc = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
  }));
  console.log(`route=${ROUTE} doc.scrollW=${doc.scrollW} doc.clientW=${doc.clientW} body.scrollW=${doc.bodyScrollW}`);

  const el = await page.$(SEL);
  if (!el) {
    console.log(`selector not found: ${SEL}`);
  } else {
    const info = await el.evaluate((node) => {
      const r = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      const chain = [];
      let p = node.parentElement;
      while (p && p !== document.documentElement) {
        const pr = p.getBoundingClientRect();
        const pcs = getComputedStyle(p);
        chain.push(
          `${p.tagName.toLowerCase()}.${(p.className || "").toString().slice(0, 60)} ` +
            `w=${Math.round(pr.width)} right=${Math.round(pr.right)} ovx=${pcs.overflowX} minW=${pcs.minWidth}`
        );
        p = p.parentElement;
      }
      return {
        w: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        scrollW: node.scrollWidth,
        clientW: node.clientWidth,
        minW: cs.minWidth,
        ovx: cs.overflowX,
        chain,
      };
    });
    console.log(`\n${SEL}\n  box w=${info.w} left=${info.left} right=${info.right}`);
    console.log(`  scrollW=${info.scrollW} clientW=${info.clientW} minW=${info.minW} overflowX=${info.ovx}`);
    console.log("  ancestors:");
    info.chain.forEach((c) => console.log("    " + c));
  }
  await browser.close();
})();
