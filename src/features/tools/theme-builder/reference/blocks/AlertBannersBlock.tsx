"use client";

import { RefBlockTitle, ReferenceAlert } from "../core";

const ITEMS = [
  {
    variant: "info" as const,
    title: "Scheduled maintenance",
    description: "We will be offline tonight from 2–3 AM for updates.",
    token: "info",
  },
  {
    variant: "success" as const,
    title: "Theme preset saved",
    description: "Your changes are stored in this session.",
    token: "success",
  },
  {
    variant: "warning" as const,
    title: "Check contrast",
    description: "Verify accent and background meet your accessibility bar.",
    token: "warning",
  },
  {
    variant: "destructive" as const,
    title: "Action could not be completed",
    description: "Try again or contact support if the issue persists.",
    token: "destructive",
  },
];

export function AlertBannersBlock() {
  return (
    <div className="flex flex-col gap-2">
      <RefBlockTitle>Alert banners</RefBlockTitle>
      {ITEMS.map((item) => (
        <ReferenceAlert
          key={item.token}
          variant={item.variant}
          title={item.title}
          description={item.description}
          tokenTarget={item.token}
        />
      ))}
    </div>
  );
}
