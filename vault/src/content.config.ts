import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
  vault: defineCollection({
    loader: glob({ pattern: "**/*.mdx", base: "./src/content/vault" }),
    schema: z.object({
      title: z.string(),
      summary: z.string(),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      /** ISO-ish date text for sorting / display — YYYY-MM-DD recommended */
      updated: z.string(),
      draft: z.boolean().optional().default(false),
    }),
  }),
};
