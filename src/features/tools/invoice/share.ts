"use client";

/**
 * Client-side document export + native sharing (e.g. WhatsApp).
 * Heavy libs are dynamically imported so they never weigh down the tool.
 * Everything happens in the browser — the file is built locally and handed to
 * the OS share sheet; nothing is uploaded.
 */

export type ShareResult = "shared" | "downloaded" | "canceled";

async function buildPdfBlob(el: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, jspdf] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const JsPDF = jspdf.jsPDF;

  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const pdf = new JsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height / canvas.width) * imgW;
  const img = canvas.toDataURL("image/jpeg", 0.92);

  if (imgH <= pageH) {
    pdf.addImage(img, "JPEG", 0, 0, imgW, imgH);
  } else {
    // Slice a tall document across multiple A4 pages.
    let position = 0;
    let remaining = imgH;
    while (remaining > 0) {
      pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
      remaining -= pageH;
      if (remaining > 0) {
        pdf.addPage();
        position -= pageH;
      }
    }
  }
  return pdf.output("blob");
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Build a PDF of the element and offer it via the native share sheet (WhatsApp,
 * mail, etc.). Falls back to a direct download when file-sharing isn't supported.
 */
export async function shareDocument(el: HTMLElement, filename: string, title: string): Promise<ShareResult> {
  const blob = await buildPdfBlob(el);
  const file = new File([blob], filename, { type: "application/pdf" });

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "canceled";
      // fall through to download on any share failure
    }
  }

  download(blob, filename);
  return "downloaded";
}

/** True when the browser can share files (mobile Safari / Android Chrome). */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  try {
    const probe = new File([new Blob()], "p.pdf", { type: "application/pdf" });
    return typeof nav.share === "function" && !!nav.canShare?.({ files: [probe] });
  } catch {
    return false;
  }
}
