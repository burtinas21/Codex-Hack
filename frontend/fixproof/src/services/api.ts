import {
  Fixture,
  TestExecutionResult,
  Diagnosis,
  ProposedFix,
  VerificationReport,
  ApiErrorResponse
} from '../types';
import { MOCK_FIXTURES } from '../data/mockData';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface ApiResponse<T> {
  data: T | null;
  error: ApiErrorResponse | null;
  isRecordedDemo?: boolean;
}

/**
 * Standard fetch wrapper with timeout and robust error parsing
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorBody: ApiErrorResponse = {
        error: `HTTP ${res.status}: ${res.statusText}`,
        status: res.status
      };
      try {
        const json = await res.json();
        if (json && typeof json === 'object') {
          errorBody = {
            error: json.error || json.message || errorBody.error,
            code: json.code,
            details: json.details,
            status: res.status
          };
        }
      } catch {
        // Response was not JSON, use default status text
      }
      return { data: null, error: errorBody };
    }

    const data: T = await res.json();
    return { data, error: null };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const message = isAbort
      ? `Request timeout after ${timeoutMs}ms connecting to ${BASE_URL}`
      : err instanceof Error
      ? err.message
      : 'Network error communicating with backend';

    return {
      data: null,
      error: {
        error: message,
        code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR'
      }
    };
  }
}

/**
 * FixProof API Service Layer
 */
export const FixProofApi = {
  /**
   * Health check for backend connectivity
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await apiFetch<{ status: string }>('/api/health', { method: 'GET' }, 3000);
      return res.error === null && !!res.data;
    } catch {
      return false;
    }
  },

  /**
   * GET /api/fixtures
   * Fetch available fixtures. Falls back to mock fixtures if backend unavailable.
   */
  async getFixtures(): Promise<ApiResponse<Fixture[]>> {
    const res = await apiFetch<Fixture[]>('/api/fixtures');
    if (res.data) {
      return res;
    }
    // Fallback to recorded fixtures with demo flag
    return {
      data: MOCK_FIXTURES,
      error: null,
      isRecordedDemo: true
    };
  },

  /**
   * POST /api/verify/baseline
   * Runs the original test suite to show real failure
   */
  async runBaselineTest(fixtureId: string): Promise<ApiResponse<TestExecutionResult>> {
    const res = await apiFetch<TestExecutionResult>('/api/verify/baseline', {
      method: 'POST',
      body: JSON.stringify({ fixtureId })
    });

    if (res.data) {
      return res;
    }

    // Fallback recorded baseline failure
    const fixture = MOCK_FIXTURES.find((f) => f.id === fixtureId);
    if (fixture) {
      // Simulate real test run latency
      await new Promise((r) => setTimeout(r, 600));
      return {
        data: {
          ...fixture.baselineTest,
          isRecordedDemo: true
        },
        error: null,
        isRecordedDemo: true
      };
    }

    return {
      data: null,
      error: { error: `Fixture "${fixtureId}" not found` }
    };
  },

  /**
   * POST /api/diagnose
   * Runs AI diagnosis and generates proposed fix
   */
  async getDiagnosis(fixtureId: string): Promise<ApiResponse<{ diagnosis: Diagnosis; proposedFix: ProposedFix }>> {
    const res = await apiFetch<{ diagnosis: Diagnosis; proposedFix: ProposedFix }>('/api/diagnose', {
      method: 'POST',
      body: JSON.stringify({ fixtureId })
    });

    if (res.data) {
      return res;
    }

    // Fallback to recorded diagnosis
    const fixture = MOCK_FIXTURES.find((f) => f.id === fixtureId);
    if (fixture) {
      await new Promise((r) => setTimeout(r, 700));
      return {
        data: {
          diagnosis: fixture.diagnosis,
          proposedFix: fixture.proposedFix
        },
        error: null,
        isRecordedDemo: true
      };
    }

    return {
      data: null,
      error: { error: `Fixture "${fixtureId}" not found for diagnosis` }
    };
  },

  /**
   * POST /api/verify/fix
   * Applies the approved fix and runs the verification test suite
   */
  async applyAndVerifyFix(
    fixtureId: string,
    approvedFix: string
  ): Promise<ApiResponse<{ testResult: TestExecutionResult; report: VerificationReport }>> {
    const res = await apiFetch<{ testResult: TestExecutionResult; report: VerificationReport }>(
      '/api/verify/fix',
      {
        method: 'POST',
        body: JSON.stringify({ fixtureId, approvedFix })
      }
    );

    if (res.data) {
      return res;
    }

    // Fallback to recorded verification test
    const fixture = MOCK_FIXTURES.find((f) => f.id === fixtureId);
    if (fixture) {
      await new Promise((r) => setTimeout(r, 800));
      const testResult: TestExecutionResult = {
        ...fixture.verificationTest,
        isRecordedDemo: true
      };

      const report: VerificationReport = {
        id: `rep_${Date.now().toString(36)}`,
        fixtureId: fixture.id,
        fixtureName: fixture.name,
        mode: 'verified',
        originalTestStatus: fixture.baselineTest.status,
        postFixTestStatus: testResult.status,
        isVerified: fixture.baselineTest.status === 'failed' && testResult.status === 'passed',
        diagnosisSummary: fixture.diagnosis.cause,
        appliedAt: new Date().toISOString(),
        durationMs: (fixture.baselineTest.durationMs || 0) + (testResult.durationMs || 0),
        isRecordedDemo: true,
        notes: 'Verification passed: Baseline failed, fix applied, post-test passed.'
      };

      return {
        data: { testResult, report },
        error: null,
        isRecordedDemo: true
      };
    }

    return {
      data: null,
      error: { error: `Fixture "${fixtureId}" not found for verification` }
    };
  },

  /**
   * GET /api/report/:id
   * Fetch verification report by id
   */
  async getReport(reportId: string): Promise<ApiResponse<VerificationReport>> {
    return apiFetch<VerificationReport>(`/api/report/${encodeURIComponent(reportId)}`);
  }
};

