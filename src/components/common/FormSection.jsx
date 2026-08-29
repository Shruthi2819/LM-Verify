import React from "react";
import Card from "./Card";

/**
 * FormSection — Groups form fields into standard visual blocks.
 */
function FormSection({ title, description, children, className = "" }) {
  return (
    <Card className={className}>
      <Card.Header className="border-b border-slate-100 pb-3 mb-4">
        {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </Card.Header>
      <Card.Body className="space-y-4">
        {children}
      </Card.Body>
    </Card>
  );
}

export default FormSection;
