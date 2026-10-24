/**
 * FixProof Core TypeScript Types
 * Specification compliant for AI code-fix verification
 */

export type ExecutionMode = 'verified' | 'analysis_only';

export type TestStatus = 'passed' | 'failed' | 'not_run';

export type BackendConnectionState = 'connected' | 'disconnected' | 'unknown';

export interface TestExecutionResult {
  status: TestStatus;
  command: string;
  exitCode: number | null;
  durationMs: number | null;
  stdout: string;
  stderr: string;
  retried?: boolean;
  isRecordedDemo?: boolean;
  timestamp?: string;
}

export interface Diagnosis {
  cause: string;
  explanation: string;
  confidence?: number;
  detectedAt?: string;
}

export interface ProposedFix {
  summary: string;
  fixedCode: string;
  diffSummary?: string;
  suggestedBy?: string;
  createdAt?: string;
}

export interface Fixture {
  id: string;
  name: string;
  language: 'python' | 'javascript' | 'typescript';
  description: string;
  originalCode: string;
  testCommand: string;
  baselineTest: TestExecutionResult;
  diagnosis: Diagnosis;
  proposedFix: ProposedFix;
  verificationTest: TestExecutionResult;
}

export interface VerificationReport {
  id: string;
  fixtureId: string;
  fixtureName: string;
  mode: ExecutionMode;
  originalTestStatus: TestStatus;
  postFixTestStatus: TestStatus;
  isVerified: boolean;
  diagnosisSummary: string;
  appliedAt: string | null;
  durationMs: number | null;
  isRecordedDemo?: boolean;
  notes?: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
  status?: number;
}

export type WorkflowStep =
  | 'idle'
  | 'running_baseline'
  | 'baseline_completed'
  | 'diagnosing'
  | 'fix_ready'
  | 'awaiting_approval'
  | 'applying_fix'
  | 'running_verification'
  | 'verified';

export interface WorkflowState {
  currentStep: WorkflowStep;
  activeFixtureId: string;
  mode: ExecutionMode;
  backendState: BackendConnectionState;
  
  // Execution data
  originalCode: string;
  baselineResult: TestExecutionResult | null;
  diagnosis: Diagnosis | null;
  proposedFix: ProposedFix | null;
  isFixApproved: boolean;
  isFixApplied: boolean;
  verificationResult: TestExecutionResult | null;
  report: VerificationReport | null;

  // UI state
  isLoading: boolean;
  loadingMessage: string | null;
  errorMessage: string | null;
  retryAttempted: boolean;
  isConfirmModalOpen: boolean;
}

