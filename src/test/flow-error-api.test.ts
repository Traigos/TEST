import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockFlowErrorApi } from '../services/mock-flow-error-api';
import { FlowErrorApi, isFlowFailureStatus, getFlowStatusLabel, formatFlowDuration } from '../services/flow-error-api';
import { FlowStatus } from '../types/dataverse';
import { DataverseApiError } from '../services/dataverse-client';

// ============================================================
// Tests for MockFlowErrorApi
// ============================================================
describe('MockFlowErrorApi', () => {
  let api: MockFlowErrorApi;

  beforeEach(() => {
    api = new MockFlowErrorApi();
  });

  describe('getFlowRunError', () => {
    it('returns error details for a specific flow run', async () => {
      const error = await api.getFlowRunError('fr-001-aaaa-bbbb-cccc-ddddeeee0001');
      expect(error.flowRunId).toBe('fr-001-aaaa-bbbb-cccc-ddddeeee0001');
      expect(error.flowName).toBe('Process Invoice Approval');
      expect(error.status).toBe(FlowStatus.Failed);
      expect(error.errorCode).toBe('InvalidConnectionReference');
      expect(error.errorMessage).toBeTruthy();
    });

    it('returns details for a successful run', async () => {
      const run = await api.getFlowRunError('fr-001-aaaa-bbbb-cccc-ssss0001');
      expect(run.status).toBe(FlowStatus.Succeeded);
      expect(run.errorCode).toBeNull();
      expect(run.errorMessage).toBeNull();
    });

    it('throws for unknown flow run id', async () => {
      await expect(api.getFlowRunError('nonexistent')).rejects.toThrow('Flow run not found');
    });
  });

  describe('getFlowErrors', () => {
    it('returns only failed runs by default', async () => {
      const errors = await api.getFlowErrors();
      expect(errors.length).toBeGreaterThan(0);
      for (const error of errors) {
        expect(isFlowFailureStatus(error.status)).toBe(true);
      }
    });

    it('filters by workflow id', async () => {
      const errors = await api.getFlowErrors({
        workflowId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      });
      expect(errors.length).toBeGreaterThan(0);
      for (const error of errors) {
        expect(error.workflowId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        expect(error.flowName).toBe('Process Invoice Approval');
      }
    });

    it('respects the top parameter', async () => {
      const errors = await api.getFlowErrors({ top: 2 });
      expect(errors.length).toBeLessThanOrEqual(2);
    });

    it('filters by startedAfter date', async () => {
      const errors = await api.getFlowErrors({
        startedAfter: '2026-03-12T00:00:00Z',
      });
      for (const error of errors) {
        expect(new Date(error.startTime!).getTime()).toBeGreaterThanOrEqual(
          new Date('2026-03-12T00:00:00Z').getTime()
        );
      }
    });

    it('filters by startedBefore date', async () => {
      const errors = await api.getFlowErrors({
        startedBefore: '2026-03-11T23:59:59Z',
      });
      for (const error of errors) {
        expect(new Date(error.startTime!).getTime()).toBeLessThanOrEqual(
          new Date('2026-03-11T23:59:59Z').getTime()
        );
      }
    });

    it('returns results sorted by start time descending', async () => {
      const errors = await api.getFlowErrors();
      for (let i = 1; i < errors.length; i++) {
        const prev = new Date(errors[i - 1].startTime!).getTime();
        const curr = new Date(errors[i].startTime!).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });

    it('can filter by custom statuses', async () => {
      const errors = await api.getFlowErrors({
        statuses: [FlowStatus.TimedOut],
      });
      for (const error of errors) {
        expect(error.status).toBe(FlowStatus.TimedOut);
      }
    });

    it('returns errors with complete details', async () => {
      const errors = await api.getFlowErrors({ top: 1 });
      expect(errors.length).toBe(1);
      const error = errors[0];
      expect(error.flowRunId).toBeTruthy();
      expect(error.flowName).toBeTruthy();
      expect(error.workflowId).toBeTruthy();
      expect(error.statusLabel).toBeTruthy();
      expect(error.startTime).toBeTruthy();
      expect(error.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFlowErrorSummary', () => {
    it('returns a summary for a specific workflow', async () => {
      const summary = await api.getFlowErrorSummary('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(summary.workflowId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(summary.flowName).toBe('Process Invoice Approval');
      expect(summary.totalRuns).toBeGreaterThan(0);
      expect(summary.failedRuns).toBeGreaterThan(0);
      expect(summary.errorRate).toBeGreaterThan(0);
      expect(summary.errorRate).toBeLessThanOrEqual(1);
      expect(summary.errors.length).toBe(summary.failedRuns);
    });

    it('calculates error rate correctly', async () => {
      const summary = await api.getFlowErrorSummary('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(summary.errorRate).toBeCloseTo(summary.failedRuns / summary.totalRuns, 5);
    });
  });

  describe('getLatestFlowError', () => {
    it('returns the most recent error for a workflow', async () => {
      const error = await api.getLatestFlowError('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
      expect(error).not.toBeNull();
      expect(error!.flowName).toBe('Process Invoice Approval');
      expect(isFlowFailureStatus(error!.status)).toBe(true);
    });

    it('returns null for a workflow with no errors', async () => {
      const error = await api.getLatestFlowError('nonexistent-workflow');
      expect(error).toBeNull();
    });
  });

  describe('setAccessToken', () => {
    it('is a no-op that does not throw', () => {
      expect(() => api.setAccessToken('some-token')).not.toThrow();
    });
  });
});

// ============================================================
// Tests for FlowErrorApi (real client - request construction)
// ============================================================
describe('FlowErrorApi', () => {
  let api: FlowErrorApi;

  beforeEach(() => {
    api = new FlowErrorApi({
      baseUrl: 'https://org.crm.dynamics.com',
      apiVersion: 'v9.2',
      accessToken: 'test-token',
    });
  });

  describe('getFlowRunError', () => {
    it('fetches a flow session by ID', async () => {
      const mockSession = {
        flowsessionid: 'fs-123',
        name: 'Test Flow',
        regardingobjectid: 'wf-456',
        regardingobjectidname: 'My Flow',
        statuscode: FlowStatus.Failed,
        startedon: '2026-03-13T08:00:00Z',
        completedon: '2026-03-13T08:00:05Z',
        errorcode: 'SomeError',
        errormessage: 'Something went wrong',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockSession), { status: 200 })
      );

      const result = await api.getFlowRunError('fs-123');

      expect(result.flowRunId).toBe('fs-123');
      expect(result.flowName).toBe('My Flow');
      expect(result.workflowId).toBe('wf-456');
      expect(result.status).toBe(FlowStatus.Failed);
      expect(result.statusLabel).toBe('Failed');
      expect(result.errorCode).toBe('SomeError');
      expect(result.errorMessage).toBe('Something went wrong');
      expect(result.duration).toBe(5000);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/flowsessions(fs-123)'),
        expect.any(Object)
      );

      fetchSpy.mockRestore();
    });
  });

  describe('getFlowErrors', () => {
    it('queries flowsessions with correct filters', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await api.getFlowErrors({
        workflowId: 'wf-123',
        top: 10,
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('/flowsessions');
      expect(url).toContain("_regardingobjectid_value eq 'wf-123'");
      expect(url).toContain('$top=10');
      expect(url).toContain('$orderby=startedon desc');

      fetchSpy.mockRestore();
    });

    it('includes date filters when provided', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await api.getFlowErrors({
        startedAfter: '2026-03-01T00:00:00Z',
        startedBefore: '2026-03-13T23:59:59Z',
      });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('startedon ge 2026-03-01T00:00:00Z');
      expect(url).toContain('startedon le 2026-03-13T23:59:59Z');

      fetchSpy.mockRestore();
    });

    it('includes authorization header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      await api.getFlowErrors();

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer test-token');

      fetchSpy.mockRestore();
    });
  });

  describe('getFlowErrorSummary', () => {
    it('fetches all runs and failed runs in parallel', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
        () => Promise.resolve(new Response(JSON.stringify({ value: [] }), { status: 200 }))
      );

      const summary = await api.getFlowErrorSummary('wf-123');

      expect(summary.workflowId).toBe('wf-123');
      expect(summary.totalRuns).toBe(0);
      expect(summary.failedRuns).toBe(0);
      expect(summary.errorRate).toBe(0);
      expect(summary.errors).toHaveLength(0);

      // Should have made 2 parallel requests
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      fetchSpy.mockRestore();
    });
  });

  describe('getLatestFlowError', () => {
    it('returns null when no errors exist', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      const result = await api.getLatestFlowError('wf-123');
      expect(result).toBeNull();

      vi.restoreAllMocks();
    });
  });

  describe('error handling', () => {
    it('throws DataverseApiError on API failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Not Found', { status: 404, statusText: 'Not Found' })
      );

      await expect(api.getFlowRunError('bad-id')).rejects.toThrow(DataverseApiError);

      vi.restoreAllMocks();
    });

    it('includes status code in error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
      );

      try {
        await api.getFlowErrors();
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(DataverseApiError);
        expect((err as DataverseApiError).statusCode).toBe(403);
      }

      vi.restoreAllMocks();
    });
  });

  describe('setAccessToken', () => {
    it('updates the token used in subsequent requests', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ value: [] }), { status: 200 })
      );

      api.setAccessToken('new-token');
      await api.getFlowErrors();

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer new-token');

      fetchSpy.mockRestore();
    });
  });
});

// ============================================================
// Tests for utility functions
// ============================================================
describe('Flow Error API utilities', () => {
  describe('isFlowFailureStatus', () => {
    it('returns true for failure statuses', () => {
      expect(isFlowFailureStatus(FlowStatus.Failed)).toBe(true);
      expect(isFlowFailureStatus(FlowStatus.Faulted)).toBe(true);
      expect(isFlowFailureStatus(FlowStatus.TimedOut)).toBe(true);
      expect(isFlowFailureStatus(FlowStatus.Aborted)).toBe(true);
      expect(isFlowFailureStatus(FlowStatus.Terminated)).toBe(true);
    });

    it('returns false for non-failure statuses', () => {
      expect(isFlowFailureStatus(FlowStatus.Succeeded)).toBe(false);
      expect(isFlowFailureStatus(FlowStatus.Running)).toBe(false);
      expect(isFlowFailureStatus(FlowStatus.Waiting)).toBe(false);
      expect(isFlowFailureStatus(FlowStatus.Cancelled)).toBe(false);
    });
  });

  describe('getFlowStatusLabel', () => {
    it('returns correct labels for known statuses', () => {
      expect(getFlowStatusLabel(FlowStatus.Failed)).toBe('Failed');
      expect(getFlowStatusLabel(FlowStatus.Succeeded)).toBe('Succeeded');
      expect(getFlowStatusLabel(FlowStatus.Running)).toBe('Running');
      expect(getFlowStatusLabel(FlowStatus.TimedOut)).toBe('Timed Out');
    });

    it('returns Unknown for invalid status', () => {
      expect(getFlowStatusLabel(999 as FlowStatus)).toBe('Unknown');
    });
  });

  describe('formatFlowDuration', () => {
    it('formats milliseconds', () => {
      expect(formatFlowDuration(500)).toBe('500ms');
    });

    it('formats seconds', () => {
      expect(formatFlowDuration(5000)).toBe('5s');
      expect(formatFlowDuration(30000)).toBe('30s');
    });

    it('formats minutes and seconds', () => {
      expect(formatFlowDuration(90000)).toBe('1m 30s');
      expect(formatFlowDuration(300000)).toBe('5m 0s');
    });

    it('formats hours and minutes', () => {
      expect(formatFlowDuration(3600000)).toBe('1h 0m');
      expect(formatFlowDuration(5400000)).toBe('1h 30m');
    });
  });
});
