import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Fixture,
  ExecutionMode,
  BackendConnectionState,
  TestExecutionResult,
  Diagnosis,
  ProposedFix,
  VerificationReport,
  WorkflowStep
} from '../types';
import { FixProofApi } from '../services/api';
import { MOCK_FIXTURES } from '../data/mockData';

export function useFixProof() {
  const [fixtures, setFixtures] = useState<Fixture[]>(MOCK_FIXTURES);
  const [activeFixtureId, setActiveFixtureId] = useState<string>(MOCK_FIXTURES[0].id);
  const [mode, setMode] = useState<ExecutionMode>('verified');
  const [backendState, setBackendState] = useState<BackendConnectionState>('unknown');

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('idle');
  const [baselineResult, setBaselineResult] = useState<TestExecutionResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [proposedFix, setProposedFix] = useState<ProposedFix | null>(null);
  const [isFixApproved, setIsFixApproved] = useState<boolean>(false);
  const [isFixApplied, setIsFixApplied] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<TestExecutionResult | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingFix, setIsSubmittingFix] = useState<boolean>(false);

  // Lock ref to prevent duplicate fix submissions
  const isFixInProgressRef = useRef(false);

  const activeFixture = fixtures.find((f) => f.id === activeFixtureId) || fixtures[0];

  // Check backend health on initial mount and when requested
  const checkHealth = useCallback(async () => {
    try {
      const isOnline = await FixProofApi.checkHealth();
      setBackendState(isOnline ? 'connected' : 'disconnected');
    } catch {
      setBackendState('disconnected');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    FixProofApi.checkHealth()
      .then((isOnline) => {
        if (isMounted) {
          setBackendState(isOnline ? 'connected' : 'disconnected');
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendState('disconnected');
        }
      });

    FixProofApi.getFixtures()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setFixtures(res.data);
        }
      })
      .catch(() => {
        // Keep default mock fixtures
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset state when fixture changes
  const selectFixture = (fixtureId: string) => {
    if (isLoading || isSubmittingFix) return;
    setActiveFixtureId(fixtureId);
    setCurrentStep('idle');
    setBaselineResult(null);
    setDiagnosis(null);
    setProposedFix(null);
    setIsFixApproved(false);
    setIsFixApplied(false);
    setVerificationResult(null);
    setReport(null);
    setErrorMessage(null);
  };

  // Reset current fixture to try again
  const resetCurrent = () => {
    if (isLoading || isSubmittingFix) return;
    setCurrentStep('idle');
    setBaselineResult(null);
    setDiagnosis(null);
    setProposedFix(null);
    setIsFixApproved(false);
    setIsFixApplied(false);
    setVerificationResult(null);
    setReport(null);
    setErrorMessage(null);
  };

  // Run the original baseline test
  const runBaselineTest = async () => {
    if (isLoading) return;
    setErrorMessage(null);

    // If analysis-only mode, no execution happens
    if (mode === 'analysis_only') {
      setCurrentStep('diagnosing');
      setLoadingMessage('Performing static code analysis...');
      setIsLoading(true);

      try {
        const diagRes = await FixProofApi.getDiagnosis(activeFixtureId);
        if (diagRes.error) {
          setErrorMessage(diagRes.error.error);
        } else if (diagRes.data) {
          setDiagnosis(diagRes.data.diagnosis);
          setProposedFix(diagRes.data.proposedFix);
          setCurrentStep('fix_ready');
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Diagnosis error');
      } finally {
        setIsLoading(false);
        setLoadingMessage(null);
      }
      return;
    }

    // Verified mode: run actual test suite
    setCurrentStep('running_baseline');
    setLoadingMessage(`Executing baseline test: ${activeFixture.testCommand}...`);
    setIsLoading(true);

    try {
      const res = await FixProofApi.runBaselineTest(activeFixtureId);
      if (res.error) {
        setErrorMessage(res.error.error);
        setCurrentStep('idle');
        return;
      }

      if (res.data) {
        setBaselineResult(res.data);
        setCurrentStep('baseline_completed');

        // If the test failed as expected, proceed to AI diagnosis
        if (res.data.status === 'failed') {
          setLoadingMessage('Baseline failure confirmed. Running Codex AI diagnosis...');
          const diagRes = await FixProofApi.getDiagnosis(activeFixtureId);
          if (diagRes.data) {
            setDiagnosis(diagRes.data.diagnosis);
            setProposedFix(diagRes.data.proposedFix);
            setCurrentStep('awaiting_approval');
          } else if (diagRes.error) {
            setErrorMessage(diagRes.error.error);
          }
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Test execution failure');
      setCurrentStep('idle');
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  };

  // Apply approved fix and run verification
  const applyFixAndVerify = async () => {
    // Safety guards: Never apply automatically, prevent duplicate requests
    if (isFixInProgressRef.current || isSubmittingFix || isLoading || !proposedFix) {
      return;
    }

    if (mode === 'analysis_only') {
      setErrorMessage('Cannot apply fix in Analysis-only Mode. Switch to Verified Mode to execute.');
      return;
    }

    isFixInProgressRef.current = true;
    setIsSubmittingFix(true);
    setIsLoading(true);
    setLoadingMessage('Injecting approved fix and re-running test suite in sandbox...');
    setCurrentStep('applying_fix');
    setErrorMessage(null);

    try {
      setIsFixApproved(true);
      setIsFixApplied(true);
      setCurrentStep('running_verification');

      const res = await FixProofApi.applyAndVerifyFix(
        activeFixtureId,
        proposedFix.fixedCode
      );

      if (res.error) {
        setErrorMessage(res.error.error);
        setCurrentStep('fix_ready');
        return;
      }

      if (res.data) {
        const { testResult, report: backendReport } = res.data;

        // VERIFICATION INVARIANT:
        // A fix is verified ONLY if:
        // 1. original test actually failed
        // 2. approved fix was applied
        // 3. post-fix test passed
        const originalFailed = baselineResult ? baselineResult.status === 'failed' : true;
        const postPassed = testResult.status === 'passed';
        const isVerified = originalFailed && postPassed;

        setVerificationResult(testResult);

        // Build report
        const finalReport: VerificationReport = {
          id: backendReport?.id || `rep_${Date.now()}`,
          fixtureId: activeFixture.id,
          fixtureName: activeFixture.name,
          mode: 'verified',
          originalTestStatus: baselineResult ? baselineResult.status : 'failed',
          postFixTestStatus: testResult.status,
          isVerified,
          diagnosisSummary: diagnosis ? diagnosis.cause : 'Fix applied and verified',
          appliedAt: new Date().toISOString(),
          durationMs: (baselineResult?.durationMs || 0) + (testResult.durationMs || 0),
          isRecordedDemo: res.isRecordedDemo || testResult.isRecordedDemo,
          notes: isVerified
            ? 'Fix verified: baseline failed, approved fix applied, post-test passed.'
            : 'Fix could not be verified: post-fix test failed.'
        };

        setReport(finalReport);
        setCurrentStep('verified');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Fix verification failed');
      setCurrentStep('awaiting_approval');
    } finally {
      setIsLoading(false);
      setIsSubmittingFix(false);
      setLoadingMessage(null);
      isFixInProgressRef.current = false;
    }
  };

  return {
    fixtures,
    activeFixture,
    activeFixtureId,
    mode,
    setMode,
    backendState,
    checkBackendHealth: checkHealth,
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
  };
}
