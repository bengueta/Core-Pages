import puppeteer from "puppeteer-core";

const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const URL = "http://localhost:3020/quote/";

const sampleDoc = {
  docType: "quote", bizName: "בית קפה הגליל", bizId: "514", bizAddr: "הרצל 10", bizPhone: "050", bizEmail: "a@b.co",
  logoAssetId: null, clientName: "דוד כהן", clientId: "302", clientAddr: "תל אביב",
  docNumber: "1001", issueDate: "2026-06-04", validDays: 14, dueDays: 30,
  items: [{ id: "i1", desc: "ייעוץ", qty: 2, price: 1500 }],
  currency: "ILS", vatRate: 18, pricesIncludeVat: false, discountMode: "none", discountValue: 0, accentColor: "#8a6327",
  payInfo: "", notes: "הערה",
  blocks: [
    { id: "b1", type: "brand", span: 1 }, { id: "b2", type: "meta", span: 1 }, { id: "b3", type: "client", span: 2 },
    { id: "b4", type: "items", span: 2 }, { id: "b5", type: "totals", span: 2 }, { id: "b6", type: "signature", span: 1 }, { id: "b7", type: "notes", span: 2 },
  ],
};

const log = [];
const errors = [];

async function clickByText(page, text) {
  const handle = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll("button, a, [role=button]")];
    return els.find((e) => e.textContent && e.textContent.replace(/\s+/g, " ").includes(t)) || null;
  }, text);
  const el = handle.asElement();
  if (!el) return false;
  await el.click();
  return true;
}

const main = async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=412,900"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 900, isMobile: true, hasTouch: true });
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await page.goto(URL, { waitUntil: "networkidle2" });
  // seed storage
  await page.evaluate((doc) => {
    localStorage.setItem("tool_invoice_library", JSON.stringify([{ id: "s1", name: "הצעת מחיר 1001", savedAt: new Date().toISOString(), doc }]));
    localStorage.setItem("tool_invoice_clients", JSON.stringify([{ id: "c1", name: "דוד כהן", clientId: "302", addr: "תל אביב" }]));
    localStorage.setItem("tool_invoice_services", JSON.stringify([{ id: "sv1", desc: "ייעוץ", price: 1500 }]));
  }, sampleDoc);
  await page.reload({ waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));

  // Go to Saves tab
  const tabClicked = await clickByText(page, "שמירות");
  log.push("clicked שמירות tab: " + tabClicked);
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: "/tmp/e2e-saves.png" });

  // Count saved-doc cards + check the "open" button exists
  const counts = await page.evaluate(() => {
    const txt = document.body.innerText;
    return {
      hasSavedDocName: txt.includes("הצעת מחיר 1001"),
      hasClientChip: txt.includes("דוד כהן"),
      hasServiceChip: txt.includes("ייעוץ"),
      openButtons: document.querySelectorAll('[aria-label="פתח"]').length,
      deleteButtons: document.querySelectorAll('[aria-label="מחק"]').length,
    };
  });
  log.push("saves content: " + JSON.stringify(counts));

  // Click first "פתח" (open) and see if view changes to builder (Document Builder header button + block builder)
  const openClicked = await page.evaluate(() => {
    const b = document.querySelector('[aria-label="פתח"]');
    if (b) { b.click(); return true; } return false;
  });
  await new Promise((r) => setTimeout(r, 700));
  const afterOpen = await page.evaluate(() => ({
    inBuilder: !!document.getElementById("invoice-doc"),
    bodyHas: document.body.innerText.includes("מבנה המסמך") || document.body.innerText.includes("ייצא"),
  }));
  log.push("after clicking open: " + JSON.stringify({ openClicked, ...afterOpen }));
  await page.screenshot({ path: "/tmp/e2e-after-open.png" });

  // Go back to saves and test delete
  await clickByText(page, "תבניות ושמירות").catch(() => {});
  await new Promise((r) => setTimeout(r, 400));
  await clickByText(page, "שמירות").catch(() => {});
  await new Promise((r) => setTimeout(r, 400));
  const delClicked = await page.evaluate(() => { const b = document.querySelector('[aria-label="מחק"]'); if (b) { b.click(); return true; } return false; });
  await new Promise((r) => setTimeout(r, 400));
  const confirmShown = await page.evaluate(() => document.body.innerText.includes("אישור מחיקה"));
  log.push("delete: " + JSON.stringify({ delClicked, confirmShown }));
  await clickByText(page, "ביטול");
  await new Promise((r) => setTimeout(r, 300));

  // Clients tab
  await clickByText(page, "לקוחות");
  await new Promise((r) => setTimeout(r, 400));
  const clientsTab = await page.evaluate(() => ({ hasAddForm: document.body.innerText.includes("הוספת לקוח"), hasClient: document.body.innerText.includes("דוד כהן") }));
  log.push("clients tab: " + JSON.stringify(clientsTab));
  // add a client
  await page.evaluate(() => { const i = document.querySelector('input[placeholder="שם הלקוח / החברה"]'); if (i) { i.focus(); i.value = ""; } });
  await page.type('input[placeholder="שם הלקוח / החברה"]', "לקוח חדש בדיקה");
  await clickByText(page, "הוסף לספר הלקוחות");
  await new Promise((r) => setTimeout(r, 400));
  const added = await page.evaluate(() => document.body.innerText.includes("לקוח חדש בדיקה"));
  log.push("client added: " + added);
  await page.screenshot({ path: "/tmp/e2e-clients.png" });

  // Templates: open business config
  await clickByText(page, "תבניות");
  await new Promise((r) => setTimeout(r, 400));
  const tplCount = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => /מסמך עסקי|הצעה מעוצבת/.test(b.textContent || "")).length);
  await clickByText(page, "מסמך עסקי");
  await new Promise((r) => setTimeout(r, 400));
  const cfgShown = await page.evaluate(() => document.body.innerText.includes("הגדרת המסמך") && document.body.innerText.includes("סוג מסמך"));
  await clickByText(page, "צור מסמך");
  await new Promise((r) => setTimeout(r, 600));
  const inBuilder2 = await page.evaluate(() => !!document.getElementById("invoice-doc"));
  log.push("templates: " + JSON.stringify({ tplCount, cfgShown, inBuilder2 }));

  await browser.close();
  console.log("=== E2E LOG ===");
  log.forEach((l) => console.log(" -", l));
  console.log("=== ERRORS (" + errors.length + ") ===");
  errors.slice(0, 15).forEach((e) => console.log(" ! ", e));
};

main().catch((e) => { console.error("E2E FAILED:", e); process.exit(1); });
