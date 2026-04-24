import React from "react";
import { Check } from "lucide-react";

/**
 * StepTracker — horizontal timeline with dots, connecting lines, and labels.
 *
 * @param {{ steps: Array<{ label: string, time?: string }>, currentStep: number }} props
 *   currentStep is 0-indexed. Steps at indices < currentStep are "completed",
 *   the step at currentStep is "active", and everything after is "upcoming".
 */
export default function StepTracker({ steps = [], currentStep = 0 }) {
  return (
    <div className="step-tracker">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const dotClass = isCompleted ? "completed" : isActive ? "active" : "";
        const labelClass = isCompleted ? "completed" : isActive ? "active" : "";
        const isLastStep = index === steps.length - 1;

        return (
          <div key={step.label} className="step-tracker-item">
            <div className={`step-tracker-dot ${dotClass}`}>
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <span className={`step-tracker-label ${labelClass}`}>{step.label}</span>
            {step.time ? <span className="step-tracker-time">{step.time}</span> : null}
            {!isLastStep ? (
              <div className={`step-tracker-line ${isCompleted ? "completed" : ""}`} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
