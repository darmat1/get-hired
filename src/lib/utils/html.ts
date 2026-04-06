export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&apos;": "'",
    "&#39;": "'",
    "&nbsp;": " ",
    "&mdash;": "—",
    "&ndash;": "–",
    "&rsquo;": "’",
    "&lsquo;": "‘",
    "&ldquo;": "“",
    "&rdquo;": "”",
    "&bull;": "•",
  };

  return text.replace(/&[a-z0-9#]+;/gi, (match) => {
    return entities[match] || match;
  });
}
