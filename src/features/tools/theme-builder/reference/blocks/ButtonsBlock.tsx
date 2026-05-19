"use client";

import { RefBlockTitle, ReferenceButton } from "../core";

export function ButtonsBlock() {
  return (
    <div>
      <RefBlockTitle>Buttons</RefBlockTitle>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["primary", "secondary", "outline", "accent"] as const).map((v) => (
          <ReferenceButton
            key={v}
            variant={v}
            tokenTarget={v === "outline" ? "primary" : v}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </ReferenceButton>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <ReferenceButton variant="ghost" size="sm" tokenTarget="mutedFg">
          Ghost
        </ReferenceButton>
        <ReferenceButton variant="destructive" size="sm" tokenTarget="destructive">
          Delete
        </ReferenceButton>
        <ReferenceButton variant="primary" size="lg" tokenTarget="primary">
          Large ⟶
        </ReferenceButton>
      </div>
      <div className="flex gap-2">
        <ReferenceButton variant="primary" size="sm" pill tokenTarget="primary">
          Pill
        </ReferenceButton>
        <ReferenceButton variant="outline" size="sm" pill tokenTarget="primary">
          Outline Pill
        </ReferenceButton>
      </div>
    </div>
  );
}
