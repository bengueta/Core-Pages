"use client";

import { Plus } from "lucide-react";

import { ActionButton, HebrewDatePicker, IOSInput, SegmentedControl } from "../shared";
import type { Tokens } from "../shared";
import { AssetPicker } from "./AssetManager";
import { AreaField, ItemRow, TextField } from "./fields";
import { DEFAULT_INTENT, formatSignedAt } from "./sign";
import {
  CURRENCY_SYMBOL,
  type AssetKind,
  type Block,
  type BlockAlign,
  type Currency,
  type DiscountMode,
  type InvoiceDoc,
  type LineItem,
} from "./engine";
import type { LiveAsset } from "./storage";

const ALIGN_OPTS: Array<{ value: BlockAlign; label: string }> = [
  { value: "right", label: "ימין" },
  { value: "center", label: "מרכז" },
  { value: "left", label: "שמאל" },
];

export function BlockEditor({
  tokens,
  doc,
  block,
  assets,
  onDocChange,
  updateBlock,
  addItem,
  patchItem,
  removeItem,
  onManageAssets,
  onSignClient,
}: {
  tokens: Tokens;
  doc: InvoiceDoc;
  block: Block;
  assets: LiveAsset[];
  onDocChange: (patch: Partial<InvoiceDoc>) => void;
  updateBlock: (patch: Partial<Block>) => void;
  addItem: () => void;
  patchItem: (id: string, patch: Partial<LineItem>) => void;
  removeItem: (id: string) => void;
  onManageAssets: (kind: AssetKind) => void;
  onSignClient: (blockId: string) => void;
}) {
  const symbol = CURRENCY_SYMBOL[doc.currency];
  const rowPad = "12px 16px";

  switch (block.type) {
    case "brand":
      return (
        <div>
          <div style={{ padding: rowPad, borderBottom: `0.5px solid ${tokens.sep}` }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>לוגו (מספריית הנכסים)</label>
            <AssetPicker tokens={tokens} assets={assets} kind="logo" value={doc.logoAssetId} onChange={(id) => onDocChange({ logoAssetId: id })} onManage={() => onManageAssets("logo")} />
          </div>
          <TextField tokens={tokens} label="שם העסק" value={doc.bizName} onChange={(v) => onDocChange({ bizName: v })} placeholder="שם העסק שלך" />
          <TextField tokens={tokens} label="ח.פ / עוסק מורשה" value={doc.bizId} onChange={(v) => onDocChange({ bizId: v })} placeholder="מספר עוסק" dir="ltr" />
          <TextField tokens={tokens} label="כתובת" value={doc.bizAddr} onChange={(v) => onDocChange({ bizAddr: v })} placeholder="רחוב, עיר" />
          <TextField tokens={tokens} label="טלפון" value={doc.bizPhone} onChange={(v) => onDocChange({ bizPhone: v })} placeholder="050-0000000" dir="ltr" />
          <TextField tokens={tokens} label="אימייל" value={doc.bizEmail} onChange={(v) => onDocChange({ bizEmail: v })} placeholder="name@email.com" dir="ltr" last />
        </div>
      );
    case "meta":
      return (
        <div>
          <TextField tokens={tokens} label="מספר מסמך" value={doc.docNumber} onChange={(v) => onDocChange({ docNumber: v })} placeholder="1001" dir="ltr" />
          <div style={{ padding: "10px 16px", borderBottom: `0.5px solid ${tokens.sep}` }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 6 }}>תאריך הנפקה</label>
            <HebrewDatePicker tokens={tokens} value={doc.issueDate} onChange={(v) => onDocChange({ issueDate: v })} />
          </div>
          <div style={{ padding: rowPad, borderBottom: `0.5px solid ${tokens.sep}` }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>מטבע</label>
            <SegmentedControl<Currency>
              tokens={tokens}
              value={doc.currency}
              onChange={(v) => onDocChange({ currency: v })}
              options={[
                { value: "ILS", label: "₪" },
                { value: "USD", label: "$" },
                { value: "EUR", label: "€" },
                { value: "GBP", label: "£" },
              ]}
            />
          </div>
          {doc.docType === "quote" ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: rowPad }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1 }}>תוקף ההצעה</span>
              <IOSInput tokens={tokens} value={doc.validDays} onChange={(v) => onDocChange({ validDays: v })} suf="ימים" />
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: rowPad }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1 }}>תנאי תשלום</span>
              <IOSInput tokens={tokens} value={doc.dueDays} onChange={(v) => onDocChange({ dueDays: v })} suf="ימים" />
            </div>
          )}
        </div>
      );
    case "client":
      return (
        <div>
          <TextField tokens={tokens} label="שם הלקוח" value={doc.clientName} onChange={(v) => onDocChange({ clientName: v })} placeholder="שם הלקוח / החברה" />
          <TextField tokens={tokens} label="ח.פ / ת.ז" value={doc.clientId} onChange={(v) => onDocChange({ clientId: v })} placeholder="מספר מזהה" dir="ltr" />
          <TextField tokens={tokens} label="כתובת" value={doc.clientAddr} onChange={(v) => onDocChange({ clientAddr: v })} placeholder="רחוב, עיר" last />
        </div>
      );
    case "items":
      return (
        <div>
          {doc.items.map((it, i) => (
            <ItemRow
              key={it.id}
              tokens={tokens}
              item={it}
              symbol={symbol}
              currency={doc.currency}
              onChange={(patch) => patchItem(it.id, patch)}
              onRemove={() => removeItem(it.id)}
              canRemove={doc.items.length > 1}
              last={i === doc.items.length - 1}
            />
          ))}
          <div style={{ padding: "12px 14px", borderTop: `0.5px solid ${tokens.sep}` }}>
            <ActionButton tokens={tokens} color={tokens.blue} onPress={addItem} icon={<Plus size={16} />} small full>
              הוסף פריט
            </ActionButton>
          </div>
        </div>
      );
    case "totals":
      return (
        <div>
          <div style={{ padding: rowPad, borderBottom: `0.5px solid ${tokens.sep}` }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>תמחור</label>
            <SegmentedControl<string>
              tokens={tokens}
              value={doc.pricesIncludeVat ? "incl" : "excl"}
              onChange={(v) => onDocChange({ pricesIncludeVat: v === "incl" })}
              options={[
                { value: "excl", label: "לא כולל מע״מ" },
                { value: "incl", label: "כולל מע״מ" },
              ]}
            />
          </div>
          <div style={{ padding: rowPad, borderBottom: `0.5px solid ${tokens.sep}` }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>הנחה</label>
            <SegmentedControl<DiscountMode>
              tokens={tokens}
              value={doc.discountMode}
              onChange={(v) => onDocChange({ discountMode: v })}
              options={[
                { value: "none", label: "ללא" },
                { value: "percent", label: "אחוז" },
                { value: "amount", label: "סכום" },
              ]}
            />
            {doc.discountMode !== "none" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <IOSInput tokens={tokens} value={doc.discountValue} onChange={(v) => onDocChange({ discountValue: v })} pre={doc.discountMode === "amount" ? symbol : undefined} suf={doc.discountMode === "percent" ? "%" : undefined} />
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: rowPad }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1 }}>מע״מ</span>
            <IOSInput tokens={tokens} value={doc.vatRate} onChange={(v) => onDocChange({ vatRate: v })} suf="%" />
          </div>
        </div>
      );
    case "signature": {
      const mode = block.sigMode ?? "business";
      return (
        <div>
          <div style={{ padding: rowPad, borderBottom: `0.5px solid ${tokens.sep}` }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>סוג חתימה</label>
            <SegmentedControl<string>
              tokens={tokens}
              value={mode}
              onChange={(v) => updateBlock({ sigMode: v as "business" | "client" })}
              options={[
                { value: "business", label: "חתימת העסק" },
                { value: "client", label: "חתימת לקוח" },
              ]}
            />
          </div>

          {mode === "business" ? (
            <div style={{ padding: rowPad, borderBottom: `0.5px solid ${tokens.sep}` }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>חתימה (מספריית הנכסים)</label>
              <AssetPicker tokens={tokens} assets={assets} kind="signature" value={block.signatureAssetId} onChange={(id) => updateBlock({ signatureAssetId: id })} onManage={() => onManageAssets("signature")} />
            </div>
          ) : (
            <>
              <AreaField tokens={tokens} label="הצהרת כוונה (מוצגת ללקוח)" value={block.intent ?? DEFAULT_INTENT} onChange={(v) => updateBlock({ intent: v })} placeholder={DEFAULT_INTENT} />
              <div style={{ padding: rowPad, borderTop: `0.5px solid ${tokens.sep}`, borderBottom: `0.5px solid ${tokens.sep}` }}>
                {block.clientSignature ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.clientSignature} alt="" style={{ height: 40, maxWidth: 140, objectFit: "contain", background: "#fff", borderRadius: 8, padding: 4 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: tokens.green }}>נחתם ✓ {block.signerName ? `· ${block.signerName}` : ""}</div>
                        <div style={{ fontSize: 11, color: tokens.label3 }}>{formatSignedAt(block.signedAt ?? "")}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <ActionButton tokens={tokens} color={tokens.blue} onPress={() => onSignClient(block.id)} small>החתם מחדש</ActionButton>
                      <ActionButton tokens={tokens} color={tokens.red} onPress={() => updateBlock({ clientSignature: null, signedAt: undefined, signedHash: undefined })} small>נקה חתימה</ActionButton>
                    </div>
                  </div>
                ) : (
                  <ActionButton tokens={tokens} color={tokens.green} onPress={() => onSignClient(block.id)} icon={<Plus size={16} />} small full>החתמת לקוח עכשיו</ActionButton>
                )}
              </div>
            </>
          )}

          <TextField tokens={tokens} label="כותרת" value={block.title ?? ""} onChange={(v) => updateBlock({ title: v })} placeholder="חתימה" />
          {mode === "business" ? (
            <TextField tokens={tokens} label="שם החותם" value={block.signerName ?? ""} onChange={(v) => updateBlock({ signerName: v })} placeholder="שם מלא" />
          ) : null}
          <div style={{ padding: rowPad }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>יישור</label>
            <SegmentedControl<BlockAlign> tokens={tokens} value={block.align ?? "right"} onChange={(v) => updateBlock({ align: v })} options={ALIGN_OPTS} />
          </div>
        </div>
      );
    }
    case "payment":
      return <AreaField tokens={tokens} label="חשבון בנק / אמצעי תשלום" value={doc.payInfo} onChange={(v) => onDocChange({ payInfo: v })} placeholder="בנק / סניף / חשבון, או קישור לתשלום…" />;
    case "notes":
      return <AreaField tokens={tokens} label="טקסט חופשי" value={doc.notes} onChange={(v) => onDocChange({ notes: v })} placeholder="תנאי תשלום, תוקף, הערות…" />;
    case "text":
      return (
        <div>
          <TextField tokens={tokens} label="כותרת (לא חובה)" value={block.title ?? ""} onChange={(v) => updateBlock({ title: v })} placeholder="כותרת" />
          <AreaField tokens={tokens} label="תוכן" value={block.body ?? ""} onChange={(v) => updateBlock({ body: v })} placeholder="טקסט חופשי…" />
          <div style={{ padding: rowPad }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 8 }}>יישור</label>
            <SegmentedControl<BlockAlign> tokens={tokens} value={block.align ?? "right"} onChange={(v) => updateBlock({ align: v })} options={ALIGN_OPTS} />
          </div>
        </div>
      );
    case "spacer":
      return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: rowPad }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1 }}>גובה הרווח</span>
          <IOSInput tokens={tokens} value={block.height ?? 24} onChange={(v) => updateBlock({ height: v })} suf="px" />
        </div>
      );
    case "divider":
      return <p style={{ fontSize: 13, color: tokens.label3, padding: rowPad }}>קו מפריד בצבע המותג — אין מה לערוך.</p>;
    default:
      return null;
  }
}
