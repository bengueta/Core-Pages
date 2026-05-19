"use client";

import { RefBlockTitle } from "../core";

export function FormBlock() {
  return (
    <div data-e="background">
      <RefBlockTitle>Form</RefBlockTitle>
      <div className="flex flex-col gap-3">
        {[
          { l: "Full name", v: "Ben Gueta", p: "Enter name..." },
          { l: "Email", v: "", p: "ben@example.com" },
        ].map((f) => (
          <div key={f.l}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-fg)", display: "block", marginBottom: 4 }}>{f.l}</label>
            <input defaultValue={f.v} placeholder={f.p} className="t-input" />
          </div>
        ))}
      </div>
    </div>
  );
}
