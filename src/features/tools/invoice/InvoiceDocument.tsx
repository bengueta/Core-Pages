import {
  calcTotals,
  formatMoney,
  lineTotal,
  readableOn,
  type Asset,
  type Block,
  type InvoiceDoc,
} from "./engine";

const PAPER_INK = "#1a1a22";
const PAPER_MUTED = "#6b7280";
const PAPER_LINE = "#e5e7eb";

const DOC_TITLES: Record<InvoiceDoc["docType"], string> = { quote: "הצעת מחיר", invoice: "חשבונית עסקה" };

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function TotalRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 14px", fontSize: muted ? 12 : 13 }}>
      <span style={{ color: PAPER_MUTED }}>{label}</span>
      <span style={{ color: muted ? PAPER_MUTED : PAPER_INK, fontWeight: muted ? 500 : 600 }}>{value}</span>
    </div>
  );
}

function renderBlock(block: Block, doc: InvoiceDoc, assets: Asset[], accent: string): React.ReactNode {
  const fmt = (v: number) => formatMoney(v, doc.currency);
  const onAccent = readableOn(accent);
  const centered = block.span === 2;

  switch (block.type) {
    case "brand": {
      const logo = assets.find((a) => a.id === doc.logoAssetId && a.kind === "logo");
      return (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", justifyContent: centered ? "center" : "flex-start", textAlign: centered ? "center" : "start" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.dataURL} alt="" style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
          ) : null}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: PAPER_INK, letterSpacing: "-0.01em" }}>{doc.bizName || "שם העסק"}</div>
            {doc.bizId ? <div style={{ fontSize: 12, color: PAPER_MUTED, marginTop: 2 }}>ח.פ / עוסק: {doc.bizId}</div> : null}
            {doc.bizAddr ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>{doc.bizAddr}</div> : null}
            {doc.bizPhone ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>טל׳ {doc.bizPhone}</div> : null}
            {doc.bizEmail ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>{doc.bizEmail}</div> : null}
          </div>
        </div>
      );
    }
    case "meta":
      return (
        <div style={{ textAlign: centered ? "center" : "left" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: accent, letterSpacing: "-0.01em" }}>{DOC_TITLES[doc.docType]}</div>
          <div style={{ fontSize: 12, color: PAPER_MUTED, marginTop: 6 }}>
            מספר: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{doc.docNumber || "—"}</span>
          </div>
          <div style={{ fontSize: 12, color: PAPER_MUTED }}>
            תאריך: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{formatDate(doc.issueDate)}</span>
          </div>
          {doc.docType === "quote" ? (
            <div style={{ fontSize: 12, color: PAPER_MUTED }}>
              בתוקף עד: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{formatDate(addDays(doc.issueDate, doc.validDays))}</span>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: PAPER_MUTED }}>
              לתשלום עד: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{formatDate(addDays(doc.issueDate, doc.dueDays))}</span>
            </div>
          )}
        </div>
      );
    case "client":
      return (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.06em" }}>לכבוד</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: PAPER_INK, marginTop: 3 }}>{doc.clientName || "שם הלקוח"}</div>
          {doc.clientId ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>ח.פ / ת.ז: {doc.clientId}</div> : null}
          {doc.clientAddr ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>{doc.clientAddr}</div> : null}
        </div>
      );
    case "items": {
      const cellHead: React.CSSProperties = { padding: "9px 12px", fontSize: 11.5, fontWeight: 700, color: onAccent, letterSpacing: "0.02em" };
      const cell: React.CSSProperties = { padding: "11px 12px", fontSize: 13, color: PAPER_INK, borderBottom: `1px solid ${PAPER_LINE}`, verticalAlign: "top" };
      return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: accent }}>
              <th style={{ ...cellHead, textAlign: "right", borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>תיאור</th>
              <th style={{ ...cellHead, textAlign: "center", width: 70 }}>כמות</th>
              <th style={{ ...cellHead, textAlign: "start", width: 110 }}>מחיר יחידה</th>
              <th style={{ ...cellHead, textAlign: "start", width: 120, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((it) => (
              <tr key={it.id}>
                <td style={{ ...cell, fontWeight: 600 }}>{it.desc || "—"}</td>
                <td style={{ ...cell, textAlign: "center" }}>{Number.isFinite(it.qty) ? it.qty : 0}</td>
                <td style={{ ...cell, textAlign: "start" }}>{fmt(it.price)}</td>
                <td style={{ ...cell, textAlign: "start", fontWeight: 700 }}>{fmt(lineTotal(it))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "totals": {
      const t = calcTotals(doc);
      return (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{ width: 280, maxWidth: "100%" }}>
            <TotalRow label="סכום ביניים" value={fmt(t.subtotal)} />
            {t.discount > 0 ? <TotalRow label="הנחה" value={`- ${fmt(t.discount)}`} /> : null}
            {doc.pricesIncludeVat ? (
              <TotalRow label={`כולל מע״מ ${doc.vatRate}%`} value={fmt(t.vat)} muted />
            ) : (
              <>
                {t.discount > 0 ? <TotalRow label="לפני מע״מ" value={fmt(t.net)} /> : null}
                <TotalRow label={`מע״מ ${doc.vatRate}%`} value={fmt(t.vat)} />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "11px 14px", background: accent, borderRadius: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: onAccent }}>סה״כ לתשלום</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: onAccent }}>{fmt(t.total)}</span>
            </div>
          </div>
        </div>
      );
    }
    case "signature": {
      const sig = assets.find((a) => a.id === block.signatureAssetId && a.kind === "signature");
      const align = block.align ?? "right";
      const justify = align === "center" ? "center" : align === "left" ? "flex-end" : "flex-start";
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: justify === "center" ? "center" : justify === "flex-end" ? "flex-end" : "flex-start" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.06em", marginBottom: 6 }}>{block.title || "חתימה"}</div>
          <div style={{ width: 180, height: 64, borderBottom: `1.5px solid ${PAPER_INK}`, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 2 }}>
            {sig ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sig.dataURL} alt="" style={{ maxWidth: "100%", maxHeight: 60, objectFit: "contain" }} />
            ) : null}
          </div>
          {block.signerName ? <div style={{ fontSize: 12.5, fontWeight: 600, color: PAPER_INK, marginTop: 5 }}>{block.signerName}</div> : null}
          <div style={{ fontSize: 11, color: PAPER_MUTED, marginTop: 2 }}>{formatDate(doc.issueDate)}</div>
        </div>
      );
    }
    case "payment":
      return doc.payInfo.trim() ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.06em", marginBottom: 5 }}>{block.title || "פרטי תשלום"}</div>
          <div style={{ fontSize: 12, color: PAPER_MUTED, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{doc.payInfo}</div>
        </div>
      ) : null;
    case "notes":
      return doc.notes.trim() ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.06em", marginBottom: 5 }}>{block.title || "הערות ותנאים"}</div>
          <div style={{ fontSize: 12, color: PAPER_MUTED, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{doc.notes}</div>
        </div>
      ) : null;
    case "text":
      return (
        <div style={{ textAlign: block.align === "center" ? "center" : block.align === "left" ? "left" : "start" }}>
          {block.title ? <div style={{ fontSize: 13, fontWeight: 700, color: PAPER_INK, marginBottom: 4 }}>{block.title}</div> : null}
          <div style={{ fontSize: 12.5, color: PAPER_MUTED, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{block.body || ""}</div>
        </div>
      );
    case "divider":
      return <div style={{ height: 2, background: accent, opacity: 0.85, borderRadius: 2 }} />;
    case "spacer":
      return <div style={{ height: block.height ?? 24 }} />;
    default:
      return null;
  }
}

export function InvoiceDocument({ doc, assets }: { doc: InvoiceDoc; assets: Asset[] }) {
  const accent = doc.accentColor || "#8a6327";
  const visible = doc.blocks.filter((b) => !b.hidden);

  return (
    <div dir="rtl" style={{ background: "#ffffff", color: PAPER_INK, padding: "40px 40px 34px", fontFamily: "inherit", lineHeight: 1.5 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px", alignItems: "start" }}>
        {visible.map((b) => {
          const content = renderBlock(b, doc, assets, accent);
          if (content == null) return null;
          return (
            <div key={b.id} style={{ gridColumn: b.span === 2 ? "1 / -1" : "span 1", minWidth: 0 }}>
              {content}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 28, textAlign: "center", fontSize: 11, color: PAPER_MUTED }}>
        תודה על שיתוף הפעולה · {doc.bizName || ""}
      </div>
    </div>
  );
}
