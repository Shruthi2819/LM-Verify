/**
 * Card component — white surface with subtle border and shadow.
 *
 * Usage:
 *   <Card>...</Card>
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Actions</Card.Footer>
 */

function Card({ children, className = "", noPadding = false }) {
  return (
    <div
      className={[
        "bg-white rounded-lg border border-slate-200 shadow-sm",
        noPadding ? "" : "p-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return (
    <div className={["mb-4 pb-3 border-b border-slate-100", className].join(" ")}>
      {children}
    </div>
  );
}

function CardBody({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ children, className = "" }) {
  return (
    <div className={["mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2", className].join(" ")}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
