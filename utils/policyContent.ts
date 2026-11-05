// Policy text is written by admins in a rich-text editor and often arrives
// with leftovers: one record holding several policies, "Title:" / "Content:"
// scaffolding lines, nested <div> wrappers and drafting notes. This turns that
// HTML into clean, separate sections the app can list and render.

export interface PolicySection {
  title: string;
  html: string;
}

const DRAFT_HEADING = /admin panel|suggested data|suggested slug/i;

const stripTags = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

function clean(html: string): string {
  return (
    html
      .replace(/&nbsp;/gi, " ")
      // editor wrappers add no meaning
      .replace(/<\/?div[^>]*>/gi, "")
      // <li><p>text</p></li> -> <li>text</li>
      .replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>")
      // empty paragraphs
      .replace(/<p>\s*<\/p>/gi, "")
      // "Content:" label line
      .replace(/<p>\s*Content\s*:\s*<\/p>/gi, "")
  );
}

// Short lines without sentence punctuation are sub-headings in these drafts
// ("Information We Collect"); give them heading markup.
function promoteSubHeadings(html: string): string {
  return html.replace(/<p>\s*([^<]{3,60}?)\s*<\/p>/gi, (match, text: string) =>
    /[.:;,!?]$/.test(text) ? match : `<h3>${text}</h3>`
  );
}

export function parsePolicy(fallbackTitle: string, rawHtml: string): PolicySection[] {
  const html = clean(rawHtml ?? "");
  const headings = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];

  const build = (title: string, body: string): PolicySection | null => {
    // use the explicit "Title:" line when the admin wrote one
    const titleLine = body.match(/<p>\s*Title\s*:\s*([^<]+?)\s*<\/p>/i);
    const finalTitle = (titleLine?.[1] ?? title).trim();
    const withoutLabel = body.replace(/<p>\s*Title\s*:[^<]*<\/p>/gi, "");
    const content = promoteSubHeadings(withoutLabel).trim();
    if (!stripTags(content)) return null;
    return { title: finalTitle, html: content };
  };

  // No h2 headings: the whole record is one policy.
  if (headings.length === 0) {
    const one = build(fallbackTitle, html);
    return one ? [one] : [];
  }

  const sections: PolicySection[] = [];

  const intro = html.slice(0, headings[0].index ?? 0);
  if (stripTags(intro)) {
    const s = build(fallbackTitle, intro);
    if (s) sections.push(s);
  }

  headings.forEach((h, i) => {
    const start = (h.index ?? 0) + h[0].length;
    const end = i + 1 < headings.length ? (headings[i + 1].index ?? html.length) : html.length;
    const heading = stripTags(h[1]).replace(/^\d+\s*[.)]\s*/, "");
    if (DRAFT_HEADING.test(heading)) return;
    const s = build(heading || fallbackTitle, html.slice(start, end));
    if (s) sections.push(s);
  });

  return sections;
}
