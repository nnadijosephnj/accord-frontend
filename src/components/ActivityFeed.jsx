import React from "react";

/**
 * ActivityFeed — a chronological list of events / activity items.
 *
 * @param {{ items: Array<{ icon: React.ReactNode, variant?: string, title: string, description?: string, time?: string, onClick?: () => void }> }} props
 *   variant: 'primary' | 'success' | 'warning' | 'danger' (controls icon background)
 */
export default function ActivityFeed({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="activity-feed">
      {items.map((item, index) => (
        <div
          key={index}
          className="activity-feed-item"
          onClick={item.onClick}
          role={item.onClick ? "button" : undefined}
          tabIndex={item.onClick ? 0 : undefined}
          style={item.onClick ? { cursor: "pointer" } : undefined}
        >
          <div className={`activity-feed-icon ${item.variant || ""}`}>
            {item.icon}
          </div>
          <div className="activity-feed-body">
            <p className="activity-feed-title">{item.title}</p>
            {item.description ? <p className="activity-feed-desc">{item.description}</p> : null}
          </div>
          {item.time ? <span className="activity-feed-time">{item.time}</span> : null}
        </div>
      ))}
    </div>
  );
}
