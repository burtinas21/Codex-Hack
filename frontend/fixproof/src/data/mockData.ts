import { Fixture } from '../types';

/**
 * Pre-recorded fixtures for FixProof demonstration.
 * Used when backend is unavailable or for instant demo mode.
 * Clearly labeled as recorded demo data.
 */
export const MOCK_FIXTURES: Fixture[] = [
  {
    id: 'python-calculator',
    name: 'Python Calculator',
    language: 'python',
    description: 'Basic arithmetic calculator with safe division and input validation.',
    originalCode: `class Calculator:
    """Safe arithmetic operations calculator."""

    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        # BUG: Unhandled division by zero raises raw ZeroDivisionError
        # Test specification explicitly requires ValueError("Cannot divide by zero")
        return a / b
`,
    testCommand: 'pytest test_calculator.py -v',
    baselineTest: {
      status: 'failed',
      command: 'pytest test_calculator.py -v',
      exitCode: 1,
      durationMs: 182,
      isRecordedDemo: true,
      timestamp: '2026-10-24T09:15:32.110Z',
      stdout: `============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-7.4.3, pluggy-1.3.0
rootdir: /workspace/python-calculator
collected 4 items

test_calculator.py::test_addition PASSED                                  [ 25%]
test_calculator.py::test_subtraction PASSED                               [ 50%]
test_calculator.py::test_multiplication PASSED                            [ 75%]
test_calculator.py::test_divide_by_zero FAILED                            [100%]

=================================== FAILURES ===================================
_____________________________ test_divide_by_zero _____________________________

    def test_divide_by_zero():
        calc = Calculator()
        with pytest.raises(ValueError, match="Cannot divide by zero"):
>           calc.divide(10, 0)

test_calculator.py:22: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 
calculator.py:16: in divide
    return a / b
E   ZeroDivisionError: division by zero

During handling of the above exception, another exception occurred:
E   Failed: DID NOT RAISE <class 'ValueError'>
=========================== 1 failed, 3 passed in 0.18s ============================`,
      stderr: ''
    },
    diagnosis: {
      cause: 'Unhandled division by zero raising unhandled ZeroDivisionError instead of expected ValueError',
      explanation: 'The divide method in Calculator executes raw division (a / b) without checking if the denominator b is zero. The test suite contract asserts that a ValueError with message "Cannot divide by zero" is raised.',
      confidence: 0.98,
      detectedAt: '2026-10-24T09:15:33.400Z'
    },
    proposedFix: {
      summary: 'Add guard clause to validate divisor and raise ValueError("Cannot divide by zero")',
      diffSummary: '+        if b == 0:\n+            raise ValueError("Cannot divide by zero")',
      suggestedBy: 'Codex AI Fix Engine v4.2',
      createdAt: '2026-10-24T09:15:34.020Z',
      fixedCode: `class Calculator:
    """Safe arithmetic operations calculator."""

    def add(self, a: float, b: float) -> float:
        return a + b

    def subtract(self, a: float, b: float) -> float:
        return a - b

    def multiply(self, a: float, b: float) -> float:
        return a * b

    def divide(self, a: float, b: float) -> float:
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
`
    },
    verificationTest: {
      status: 'passed',
      command: 'pytest test_calculator.py -v',
      exitCode: 0,
      durationMs: 174,
      isRecordedDemo: true,
      timestamp: '2026-10-24T09:15:42.500Z',
      stdout: `============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-7.4.3, pluggy-1.3.0
rootdir: /workspace/python-calculator
collected 4 items

test_calculator.py::test_addition PASSED                                  [ 25%]
test_calculator.py::test_subtraction PASSED                               [ 50%]
test_calculator.py::test_multiplication PASSED                            [ 75%]
test_calculator.py::test_divide_by_zero PASSED                            [100%]

============================== 4 passed in 0.17s ===============================`,
      stderr: ''
    }
  },
  {
    id: 'js-validator',
    name: 'JavaScript Validator',
    language: 'javascript',
    description: 'Email and input sanitization validator utility.',
    originalCode: `export function isValidEmail(email) {
  // BUG: Fails to reject null/empty values and accepts invalid dots
  if (!email) return false;
  
  // Overly permissive regex allows "user@domain..com" and trailing dots
  const pattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return pattern.test(email);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}
`,
    testCommand: 'npm test -- test/validator.test.js',
    baselineTest: {
      status: 'failed',
      command: 'npm test -- test/validator.test.js',
      exitCode: 1,
      durationMs: 245,
      isRecordedDemo: true,
      timestamp: '2026-10-24T09:18:10.050Z',
      stdout: `FAIL test/validator.test.js
  ● Validator Suite › should reject malformed email domains with consecutive dots

    expect(received).toBe(expected) // Object.is equality

    Expected: false
    Received: true

      18 |   it('should reject malformed email domains with consecutive dots', () => {
    > 19 |     expect(isValidEmail("user@domain..com")).toBe(false);
         |                                             ^
      20 |   });

Test Suites: 1 failed, 1 total
Tests:       1 failed, 3 passed, 4 total
Snapshots:   0 total
Time:        0.245 s
Ran all test suites matching /test\\/validator.test.js/i.`,
      stderr: ''
    },
    diagnosis: {
      cause: 'Permissive regex pattern does not restrict consecutive dots in domain labels',
      explanation: 'The regex `^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$` matches any character string containing an @ and at least one dot, allowing consecutive dots like "user@domain..com" which violates RFC 5322 section 3.4.1 domain syntax.',
      confidence: 0.95,
      detectedAt: '2026-10-24T09:18:11.200Z'
    },
    proposedFix: {
      summary: 'Replace regex with RFC-compliant domain label matcher disallowing consecutive dots',
      diffSummary: '-  const pattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n+  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n+  if (email.includes("..")) return false;',
      suggestedBy: 'Codex AI Fix Engine v4.2',
      createdAt: '2026-10-24T09:18:12.110Z',
      fixedCode: `export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email.includes('..')) return false;

  // Strict domain and local-part validation
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}
`
    },
    verificationTest: {
      status: 'passed',
      command: 'npm test -- test/validator.test.js',
      exitCode: 0,
      durationMs: 215,
      isRecordedDemo: true,
      timestamp: '2026-10-24T09:18:22.400Z',
      stdout: `PASS test/validator.test.js
  Validator Suite
    ✓ should accept valid standard email addresses (2 ms)
    ✓ should reject missing @ or missing domain (1 ms)
    ✓ should reject malformed email domains with consecutive dots (1 ms)
    ✓ should sanitize HTML tags from user input (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.215 s
Ran all test suites matching /test\\/validator.test.js/i.`,
      stderr: ''
    }
  },
  {
    id: 'string-formatter',
    name: 'String Formatter',
    language: 'typescript',
    description: 'String truncation and formatting utility with length guarantees.',
    originalCode: `export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // BUG: Appending suffix after slicing to maxLength produces a string of length
  // (maxLength + suffix.length), violating the hard maxLength boundary requirement
  return text.slice(0, maxLength) + suffix;
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
`,
    testCommand: 'npm test -- test/formatter.test.ts',
    baselineTest: {
      status: 'failed',
      command: 'npm test -- test/formatter.test.ts',
      exitCode: 1,
      durationMs: 130,
      isRecordedDemo: true,
      timestamp: '2026-10-24T09:20:05.100Z',
      stdout: `FAIL test/formatter.test.ts
  ● Formatter Suite › truncate should enforce total output length never exceeds maxLength

    expect(received.length).toBeLessThanOrEqual(expected)

    Expected: <= 20
    Received: 23
    Actual string: "FixProof AI Proof Suite..."

      24 |   it('truncate should enforce total output length never exceeds maxLength', () => {
    > 25 |     const res = truncate("FixProof AI Proof Suite 2026", 20);
         |                            ^
      26 |     expect(res.length).toBeLessThanOrEqual(20);
      27 |   });

Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total
Snapshots:   0 total
Time:        0.130 s`,
      stderr: ''
    },
    diagnosis: {
      cause: 'Suffix is appended to maxLength slice rather than accounting for suffix length in slice offset',
      explanation: 'When text exceeds maxLength, slicing at maxLength and appending suffix results in (maxLength + suffix.length) characters. To guarantee output length <= maxLength, the slice length must be reduced by suffix.length.',
      confidence: 0.99,
      detectedAt: '2026-10-24T09:20:06.300Z'
    },
    proposedFix: {
      summary: 'Subtract suffix length when slicing input string to maintain strict maxLength bound',
      diffSummary: '-  return text.slice(0, maxLength) + suffix;\n+  const sliceLen = Math.max(0, maxLength - suffix.length);\n+  return text.slice(0, sliceLen) + suffix;',
      suggestedBy: 'Codex AI Fix Engine v4.2',
      createdAt: '2026-10-24T09:20:07.120Z',
      fixedCode: `export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  if (maxLength <= 0) return '';
  if (suffix.length >= maxLength) {
    return suffix.slice(0, maxLength);
  }

  const targetLength = maxLength - suffix.length;
  return text.slice(0, targetLength) + suffix;
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
`
    },
    verificationTest: {
      status: 'passed',
      command: 'npm test -- test/formatter.test.ts',
      exitCode: 0,
      durationMs: 115,
      isRecordedDemo: true,
      timestamp: '2026-10-24T09:20:18.900Z',
      stdout: `PASS test/formatter.test.ts
  Formatter Suite
    ✓ returns original text if shorter than maxLength (1 ms)
    ✓ truncate should enforce total output length never exceeds maxLength (1 ms)
    ✓ handles edge case where maxLength is smaller than suffix (1 ms)
    ✓ capitalize works as expected (1 ms)
    ✓ handles empty input strings gracefully (1 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.115 s`,
      stderr: ''
    }
  }
];

