import React from "react";

/**
 * EmptyState — consistent zero-state display for any list/section.
 *
 * @param {{ icon: React.ReactNode, title: string, description: string, action?: React.ReactNode }} props
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <div className="space-y-2">
        <p className="empty-state-title">{title}</p>
        <p className="empty-state-desc">{description}</p>
      </div>
      {action || null}
    </div>
  );
}
