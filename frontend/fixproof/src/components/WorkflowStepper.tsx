import React from 'react';
import { WorkflowStep } from '../types';
import { Check } from 'lucide-react';

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
}

interface StepDef {
  number: number;
  label: string;
  isCompleted: (step: WorkflowStep) => boolean;
  isActive: (step: WorkflowStep) => boolean;
}

const STEPS: StepDef[] = [
  {
    number: 1,
    label: 'Select Fixture',
    isCompleted: (step) =>
      ['baseline_completed', 'diagnosing', 'fix_ready', 'awaiting_approval', 'applying_fix', 'running_verification', 'verified'].includes(
        step
      ),
    isActive: (step) => step === 'idle' || step === 'running_baseline'
  },
  {
    number: 2,
    label: 'Run Baseline Test',
    isCompleted: (step) =>
      ['fix_ready', 'awaiting_approval', 'applying_fix', 'running_verification', 'verified'].includes(step),
    isActive: (step) => step === 'running_baseline' || step === 'baseline_completed'
  },
  {
    number: 3,
    label: 'AI Diagnosis & Fix',
    isCompleted: (step) =>
      ['awaiting_approval', 'applying_fix', 'running_verification', 'verified'].includes(step),
    isActive: (step) => step === 'diagnosing' || step === 'fix_ready'
  },
  {
    number: 4,
    label: 'Approve & Apply',
    isCompleted: (step) => ['running_verification', 'verified'].includes(step),
    isActive: (step) => step === 'awaiting_approval' || step === 'applying_fix'
  },
  {
    number: 5,
    label: 'Verify & Prove',
    isCompleted: (step) => step === 'verified',
    isActive: (step) => step === 'running_verification' || step === 'verified'
  }
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ currentStep }) => {
  return (
    <div className="stepper" role="navigation" aria-label="Verification Workflow Progress">
      {STEPS.map((step, index) => {
        const completed = step.isCompleted(currentStep);
        const active = step.isActive(currentStep);

        return (
          <React.Fragment key={step.number}>
            <div
              className={`step-item ${completed ? 'completed' : ''} ${active && !completed ? 'active' : ''}`}
            >
              <div className="step-number">
                {completed ? <Check size={12} strokeWidth={3} /> : step.number}
              </div>
              <span>{step.label}</span>
            </div>

            {index < STEPS.length - 1 && (
              <div className={`step-divider ${completed ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

