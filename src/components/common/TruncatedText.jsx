/**
 * Renders single-line truncated text with a native HTML `title` attribute
 * so hovering displays the full content in the browser's standard tooltip.
 */
export default function TruncatedText({
  as: Tag = "span",
  text,
  children,
  className = "",
  ...props
}) {
  const content = text ?? children;
  const titleText =
    content !== null && content !== undefined && String(content).trim() !== ""
      ? String(content)
      : undefined;

  return (
    <Tag title={titleText} className={className} {...props}>
      {content}
    </Tag>
  );
}
