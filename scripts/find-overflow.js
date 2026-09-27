// Diagnostic: find elements wider than the viewport on a given route. Horizontal
// scroll on mobile is usually one fixed-width child, not a page-level mistake.
const { chromium } = require("./pw").loadPlaywright();

const BASE = process.env.BASE || "http://localhost:3101";
const ROUTE = process.env.ROUTE || "/verify";
const WIDTH = Number(process.env.WIDTH || 390);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 844 } });
  await page.goto(BASE + ROUTE, { waitUntil: "networkidle" });

  const offenders = await page.evaluate((vw) => {
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (el.closest("[data-allow-overflow]")) continue;
      if (r.right > vw + 2 || (r.left < -2 && r.left > -9990)) {
        // Report the element and the nearest ancestor that constrains it.
        const cls = (el.className || "").toString().slice(0, 110);
        out.push({
          tag: el.tagName.toLowerCase(),
          cls,
          w: Math.round(r.width),
          left: Math.round(r.left),
          right: Math.round(r.right),
          overflowX: getComputedStyle(el).overflowX,
        });
      }
    }
    return out;
  }, WIDTH);

  console.log(`route=${ROUTE} viewport=${WIDTH}  scrollOverflow=${
    await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  }px`);
  if (!offenders.length) {
    console.log("no overflowing elements found");
  } else {
    // Deepest / widest first: the leaf is usually the real cause.
    offenders.sort((a, b) => a.cls.length - b.cls.length);
    for (const o of offenders.slice(0, 12)) {
      console.log(
        `  <${o.tag}> w=${o.w} left=${o.left} right=${o.right} overflowX=${o.overflowX}\n     ${o.cls}`
      );
    }

    // List the direct children of <body>, which is where a stray wide block
    // usually lives, so the culprit is identifiable by its own box.
    console.log("\nbody children:");
    const kids = await page.evaluate(() => {
      const out = [];
      for (const el of document.body.children) {
        const r = el.getBoundingClientRect();
        out.push(
          `  <${el.tagName.toLowerCase()}> id=${el.id || "-"} w=${Math.round(r.width)} ` +
            `right=${Math.round(r.right)} scrollW=${el.scrollWidth} ` +
            `cls=${(el.className || "").toString().slice(0, 70)}`
        );
      }
      return out;
    });
    kids.forEach((k) => console.log(k));

    // Walk down from <main>, reporting any descendant whose own scrollWidth
    // exceeds the viewport. This pinpoints the exact block that is too wide,
    // rather than listing its many descendants that merely extend past.
    console.log("\nwidest self-overflowing blocks:");
    const blocks = await page.evaluate((vw) => {
      const out = [];
      for (const el of document.querySelectorAll("main *")) {
        if (el.scrollWidth > vw + 2 && el.getBoundingClientRect().width <= vw + 2) {
          out.push({
            tag: el.tagName.toLowerCase(),
            sw: el.scrollWidth,
            cls: (el.className || "").toString().slice(0, 90),
            txt: (el.textContent || "").trim().slice(0, 50),
          });
        }
      }
      return out.sort((a, b) => a.sw - b.sw).slice(0, 6);
    }, WIDTH);
    for (const b of blocks) {
      console.log(`  <${b.tag}> scrollW=${b.sw}  ${b.cls}\n     "${b.txt}"`);
    }
  }
  await browser.close();
})();
