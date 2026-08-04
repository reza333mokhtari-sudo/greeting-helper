import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ slug: z.string().min(1).max(120) });

/** Public read of a published CMS page (anon SELECT policy). */
export const getPage = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => Input.parse(i))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: row } = await client
      .from("cms_pages")
      .select("title,body,updated_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return row as { title: string; body: string; updated_at: string } | null;
  });

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const page = await getPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Page"} — Dungeon Scrawl Map Maker` },
      { name: "description", content: (loaderData?.body ?? "").slice(0, 150) || "A content page from the Dungeon Scrawl map maker." },
      { property: "og:title", content: loaderData?.title ?? "Page" },
      { property: "og:description", content: (loaderData?.body ?? "").slice(0, 150) },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <Shell title="Something went wrong">We couldn't load this page. Please try again.</Shell>,
  notFoundComponent: () => <Shell title="Page not found">That page doesn't exist or isn't published yet.</Shell>,
  component: PageView,
});

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-3 text-2xl font-semibold text-arcane">{title}</h1>
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link to="/" className="mt-6 inline-block text-sm text-primary underline">
        Back to the map editor
      </Link>
    </main>
  );
}

function PageView() {
  const page = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="mb-2 text-3xl font-semibold text-arcane">{page.title}</h1>
      <p className="mb-8 text-xs text-muted-foreground">Updated {new Date(page.updated_at).toLocaleDateString()}</p>
      <article className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{page.body}</article>
      <Link to="/" className="mt-10 inline-block text-sm text-primary underline">
        Back to the map editor
      </Link>
    </main>
  );
}
