import { Text } from "@react-pdf/renderer";
import React from "react";

/**
 * FormattedText parses a simple HTML-like string containing <b>, <strong>, <i>, and <em> tags
 * and converts them into react-pdf <Text> components with appropriate styles.
 */
export function FormattedText({ html, style }: { html: string; style?: any }) {
  if (!html) return null;

  // Normalize tags (replace strong with b, em with i for easier parsing)
  const normalized = html
    .replace(/<strong>/g, "<b>")
    .replace(/<\/strong>/g, "</b>")
    .replace(/<em>/g, "<i>")
    .replace(/<\/em>/g, "</i>")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<br\s*\/?>/g, "\n");

  // Regex to split by tags while keeping them in the resulting array
  // This matches <b>...</b> or <i>...</i>
  const parts = normalized.split(/(<b>.*?<\/b>|<i>.*?<\/i>)/g);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.startsWith("<b>")) {
          const content = part.replace(/<\/?b>/g, "");
          return (
            <Text key={index} style={{ fontWeight: "bold" }}>
              {content}
            </Text>
          );
        }
        if (part.startsWith("<i>")) {
          const content = part.replace(/<\/?i>/g, "");
          return (
            <Text key={index} style={{ fontStyle: "italic" }}>
              {content}
            </Text>
          );
        }
        // Plain text - remove any remaining stray tags
        const cleanPart = part.replace(/<[^>]*>?/gm, "");
        return cleanPart;
      })}
    </Text>
  );
}
