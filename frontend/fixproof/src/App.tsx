import { useFixProof } from './hooks/useFixProof';
import { AppHeader } from './components/AppHeader';
import { ModeSelector } from './components/ModeSelector';
import { ProjectSelector } from './components/ProjectSelector';
import { WorkflowStepper } from './components/WorkflowStepper';
import { CodePanel } from './components/CodePanel';
import { TestResultsPanel } from './components/TestResultsPanel';
import { DiagnosisPanel } from './components/DiagnosisPanel';
import { FixApproval } from './components/FixApproval';
import { ProofReport } from './components/ProofReport';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export function App() {
  const {
    fixtures,
    activeFixture,
    activeFixtureId,
    mode,
    setMode,
    backendState,
    checkBackendHealth,
    currentStep,
    baselineResult,
    diagnosis,
    proposedFix,
    isFixApproved,
    isFixApplied,
    verificationResult,
    report,
    isLoading,
    loadingMessage,
    errorMessage,
    selectFixture,
    resetCurrent,
    runBaselineTest,
    applyFixAndVerify
  } = useFixProof();

  return (
    <div className="app-container">
      {/* 1. Header */}
      <AppHeader
        mode={mode}
        onModeChange={setMode}
        backendState={backendState}
        onCheckBackend={checkBackendHealth}
      />

      <main className="main-content">
        {/* Core Product Hook */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Codex suggests a fix. <span style={{ color: '#2563eb' }}>FixProof proves it.</span>
            </h1>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.15rem' }}>
              Automated proof pipeline: execute real baseline failure &rarr; inspect AI proposal &rarr; require human approval &rarr; verify passing exit code.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetCurrent}
            disabled={isLoading}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            title="Reset this fixture back to start"
          >
            <RotateCcw size={13} />
            Reset Fixture
          </button>
        </div>

        {/* Mode Selector Notice */}
        <ModeSelector mode={mode} onModeChange={setMode} />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="alert alert-error" role="alert">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Operation Error:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Loading Overlay / Progress Notification */}
        {isLoading && loadingMessage && (
          <div className="alert alert-info" role="status" aria-live="polite">
            <span className="status-dot unknown" />
            <span>{loadingMessage}</span>
          </div>
        )}

        {/* Workflow Progress Stepper */}
        <WorkflowStepper currentStep={currentStep} />

        {/* 2. Project Selector */}
        <ProjectSelector
          fixtures={fixtures}
          selectedFixtureId={activeFixtureId}
          onSelectFixture={selectFixture}
          disabled={isLoading}
        />

        {/* Main 2-Column Responsive Workspace Grid */}
        <div className="workflow-grid">
          {/* LEFT COLUMN: Baseline & Original Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1 & 2: Original Code */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <span>1. Original Fixture Code</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}
                  >
                    Target
                  </span>
                </div>
              </div>
              <div className="card-body">
                <CodePanel
                  code={activeFixture.originalCode}
                  language={activeFixture.language}
                  title={`${activeFixture.name} (Source)`}
                  maxHeight="280px"
                />
              </div>
            </div>

            {/* Baseline Test Execution */}
            <TestResultsPanel
              title="2. Baseline Test Execution (Failure Capture)"
              testResult={baselineResult}
              command={activeFixture.testCommand}
              isLoading={isLoading && currentStep === 'running_baseline'}
              onRunTest={runBaselineTest}
              runButtonLabel="Run Original Test"
              mode={mode}
              emptyMessage='Click "Run Original Test" above to execute the test suite and reveal the real failure trace.'
            />
          </div>

          {/* RIGHT COLUMN: AI Diagnosis, Approval & Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 3: AI Diagnosis & Proposed Fix */}
            <DiagnosisPanel
              diagnosis={diagnosis}
              proposedFix={proposedFix}
              originalCode={activeFixture.originalCode}
              language={activeFixture.language}
              isLoading={isLoading && currentStep === 'diagnosing'}
            />

            {/* Step 4: Human Approval */}
            <FixApproval
              proposedFix={proposedFix}
              isFixApproved={isFixApproved}
              isFixApplied={isFixApplied}
              isLoading={isLoading && (currentStep === 'applying_fix' || currentStep === 'running_verification')}
              mode={mode}
              onApplyFix={applyFixAndVerify}
            />

            {/* Step 5: Post-Fix Test Verification */}
            <TestResultsPanel
              title="5. Post-Fix Verification Test (Proof Run)"
              testResult={verificationResult}
              command={activeFixture.testCommand}
              mode={mode}
              isVerification={true}
              emptyMessage="Awaiting fix approval and application. The post-fix test will execute automatically once approved."
            />
          </div>
        </div>

        {/* 6. Proof Report Section */}
        <ProofReport report={report} mode={mode} />
      </main>
    </div>
  );
}

export default App;
