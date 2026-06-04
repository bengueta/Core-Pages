"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PenLine, Share2, ShieldCheck } from "lucide-react";

import { ActionButton, getTokens } from "../shared";
import { InvoiceDocument } from "./InvoiceDocument";
import { ClientSignModal } from "./ClientSignModal";
import { DOC_TYPE_LABEL, calcTotals, formatMoney, newItemId, type Block, type InvoiceDoc } from "./engine";
import type { LiveAsset } from "./storage";
import { shareDocument } from "./share";
import { DEFAULT_INTENT, computeDocHash } from "./sign";

const DOC_TITLES = DOC_TYPE_LABEL;

/** Make sure there's a client signature block to sign into. */
function ensureClientSig(doc: InvoiceDoc): InvoiceDoc {
  if (doc.blocks.some((b) => b.type === "signature" && (b.sigMode ?? "business") === "client")) return doc;
  const block: Block = { id: newItemId(), type: "signature", span: 2, sigMode: "client", align: "right", intent: DEFAULT_INTENT };
  return { ...doc, blocks: [...doc.blocks, block] };
}

/**
 * The recipient's view (opened from a #sign= link). Read-only document + a
 * prominent sign action; once signed, the client gets a signed PDF to send back.
 */
export function SigningView({ isDark, doc: initial, assets }: { isDark: boolean; doc: InvoiceDoc; assets: LiveAsset[] }) {
  const tokens = getTokens(isDark);
  const [doc, setDoc] = useState<InvoiceDoc>(() => ensureClientSig(initial));
  const [signOpen, setSignOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const [sharing, setSharing] = useState(false);

  const sigBlock = useMemo(
    () => doc.blocks.find((b) => b.type === "signature" && (b.sigMode ?? "business") === "client") ?? doc.blocks.find((b) => b.type === "signature"),
    [doc.blocks]
  );
  const totals = useMemo(() => calcTotals(doc), [doc]);

  const complete = async (dataURL: string, name: string) => {
    if (!sigBlock) return;
    const hash = await computeDocHash(doc);
    setDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === sigBlock.id ? { ...b, sigMode: "client", clientSignature: dataURL, signerName: name, signedAt: new Date().toISOString(), signedHash: hash } : b)),
    }));
    setSigned(true);
    setSignOpen(false);
  };

  const shareBack = async () => {
    const el = document.getElementById("invoice-doc");
    if (!el || sharing) return;
    setSharing(true);
    try {
      const base = doc.docType === "quote" ? "הצעת-מחיר-חתומה" : "חשבונית-חתומה";
      await shareDocument(el, `${base}-${doc.docNumber || ""}.pdf`, `${DOC_TITLES[doc.docType]} חתום`);
    } catch {
      window.alert("שגיאה ביצירת הקובץ");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div dir="rtl" id="tools-invoice" style={{ minHeight: "100vh", color: tokens.label1 }}>
      <style>{`
        #tools-invoice{font-family: var(--font-heebo), -apple-system, system-ui, sans-serif; -webkit-font-smoothing:antialiased;}
        #tools-invoice #sbg{position:fixed;inset:0;z-index:0;background:linear-gradient(158deg, ${isDark ? "#0c1018 0%, #07090f 100%" : "#f4f4f6 0%, #ececef 100%"});}
        #invoice-doc{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.18),0 18px 50px rgba(0,0,0,.3);}
        @media print{ #sbg,.s-no-print{display:none !important} #invoice-doc{box-shadow:none !important;border-radius:0 !important} }
      `}</style>
      <div id="sbg" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "24px 16px 140px" }}>
        <div className="s-no-print" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <ShieldCheck size={22} style={{ color: tokens.green }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>מסמך לחתימה</div>
            <div style={{ fontSize: 12.5, color: tokens.label2 }}>{`${doc.bizName} · ${DOC_TITLES[doc.docType]} ${doc.docNumber || ""}`.trim()}</div>
          </div>
        </div>

        <div id="invoice-doc">
          <InvoiceDocument doc={doc} assets={assets} />
        </div>

        {signed ? (
          <div className="s-no-print" style={{ marginTop: 16, textAlign: "center", color: tokens.green, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={30} />
            <div style={{ fontSize: 15, fontWeight: 700 }}>נחתם בהצלחה</div>
            <div style={{ fontSize: 12.5, color: tokens.label2 }}>שלחו את ה-PDF החתום בחזרה לעסק</div>
          </div>
        ) : (
          <div className="s-no-print" style={{ marginTop: 14, fontSize: 12.5, color: tokens.label3, textAlign: "center" }}>
            סה״כ לתשלום {formatMoney(totals.total, doc.currency)} · קראו ולחצו “חתום כאן”
          </div>
        )}
      </div>

      {/* Fixed bottom action */}
      <div className="s-no-print" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50, padding: "12px 16px calc(14px + env(safe-area-inset-bottom,0px))", background: isDark ? "rgba(18,18,24,0.94)" : "rgba(248,248,250,0.96)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderTop: `0.5px solid ${tokens.sep}` }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", gap: 10 }}>
          {signed ? (
            <ActionButton tokens={tokens} color={tokens.green} onPress={shareBack} icon={<Share2 size={18} />} full>
              {sharing ? "מכין PDF…" : "שתף PDF חתום בחזרה"}
            </ActionButton>
          ) : (
            <ActionButton tokens={tokens} color={tokens.green} onPress={() => setSignOpen(true)} icon={<PenLine size={18} />} full>
              חתום כאן
            </ActionButton>
          )}
        </div>
      </div>

      {signOpen ? (
        <ClientSignModal
          tokens={tokens}
          summary={`${doc.bizName} · ${DOC_TITLES[doc.docType]} ${doc.docNumber || ""} · ${formatMoney(totals.total, doc.currency)}`.trim()}
          intent={sigBlock?.intent || DEFAULT_INTENT}
          initialName={doc.clientName || ""}
          onComplete={complete}
          onCancel={() => setSignOpen(false)}
        />
      ) : null}
    </div>
  );
}
