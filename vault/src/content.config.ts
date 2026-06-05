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
  /** Block-builder pages — authored as JSON (block model), rendered statically. */
  pages: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
    schema: z.object({
      title: z.string(),
      summary: z.string().optional(),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      updated: z.string().optional(),
      author: z.string().optional(),
      heroImage: z.string().optional(),
      draft: z.boolean().optional().default(false),
      blocks: z.array(
        z.object({ type: z.string(), props: z.record(z.any()).default({}) })
      ),
      palettes: z.record(z.record(z.string())).optional(),
    }),
  }),
};
