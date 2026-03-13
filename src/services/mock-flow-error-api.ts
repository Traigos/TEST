// ============================================================
// Mock Flow Error API for Demo Mode
// Returns mock flow run error data for testing without a
// live Dataverse connection.
// ============================================================

import type {
  FlowErrorDetails,
  FlowErrorSummary,
  FlowStatus,
} from '../types/dataverse';
import { FlowStatus as FlowStatusEnum } from '../types/dataverse';
import type { FlowErrorQueryOptions } from './flow-error-api';
import { isFlowFailureStatus } from './flow-error-api';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_WORKFLOW_ID_1 = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const MOCK_WORKFLOW_ID_2 = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

const mockFlowErrors: FlowErrorDetails[] = [
  {
    flowRunId: 'fr-001-aaaa-bbbb-cccc-ddddeeee0001',
    flowName: 'Process Invoice Approval',
    workflowId: MOCK_WORKFLOW_ID_1,
    status: FlowStatusEnum.Failed,
    statusLabel: 'Failed',
    errorCode: 'InvalidConnectionReference',
    errorMessage: 'The connection reference \'shared_sharepointonline\' is not valid. The connection may have been deleted or you may not have access.',
    startTime: '2026-03-13T08:15:00Z',
    endTime: '2026-03-13T08:15:12Z',
    duration: 12000,
  },
  {
    flowRunId: 'fr-001-aaaa-bbbb-cccc-ddddeeee0002',
    flowName: 'Process Invoice Approval',
    workflowId: MOCK_WORKFLOW_ID_1,
    status: FlowStatusEnum.TimedOut,
    statusLabel: 'Timed Out',
    errorCode: 'WorkflowRunTimedOut',
    errorMessage: 'The workflow run timed out waiting for a response from the approval action \'Approve_Invoice\'. The timeout period was 72 hours.',
    startTime: '2026-03-12T14:30:00Z',
    endTime: '2026-03-15T14:30:00Z',
    duration: 259200000,
  },
  {
    flowRunId: 'fr-001-aaaa-bbbb-cccc-ddddeeee0003',
    flowName: 'Process Invoice Approval',
    workflowId: MOCK_WORKFLOW_ID_1,
    status: FlowStatusEnum.Failed,
    statusLabel: 'Failed',
    errorCode: 'DynamicsOperationFailed',
    errorMessage: 'Resource not found for the segment \'invoicedetails\'. Status code: 404. Request URL: https://org.crm.dynamics.com/api/data/v9.2/invoicedetails(abc-123)',
    startTime: '2026-03-11T09:45:00Z',
    endTime: '2026-03-11T09:45:03Z',
    duration: 3000,
  },
  {
    flowRunId: 'fr-001-aaaa-bbbb-cccc-ddddeeee0004',
    flowName: 'Process Invoice Approval',
    workflowId: MOCK_WORKFLOW_ID_1,
    status: FlowStatusEnum.Faulted,
    statusLabel: 'Faulted',
    errorCode: 'ActionFailed',
    errorMessage: 'The execution of template action \'Send_Email\' failed: the result of the evaluation of \'foreach\' expression \'@triggerOutputs()?[\'body/value\']\' is of type \'Null\'. The result must be a valid array.',
    startTime: '2026-03-10T16:20:00Z',
    endTime: '2026-03-10T16:20:01Z',
    duration: 1000,
  },
  {
    flowRunId: 'fr-002-aaaa-bbbb-cccc-ddddeeee0001',
    flowName: 'Sync Contacts to Mailchimp',
    workflowId: MOCK_WORKFLOW_ID_2,
    status: FlowStatusEnum.Failed,
    statusLabel: 'Failed',
    errorCode: 'ConnectorRateLimitExceeded',
    errorMessage: 'Rate limit is exceeded. Try again in 27 seconds. API calls per second: 10, current: 14.',
    startTime: '2026-03-13T06:00:00Z',
    endTime: '2026-03-13T06:00:02Z',
    duration: 2000,
  },
  {
    flowRunId: 'fr-002-aaaa-bbbb-cccc-ddddeeee0002',
    flowName: 'Sync Contacts to Mailchimp',
    workflowId: MOCK_WORKFLOW_ID_2,
    status: FlowStatusEnum.Failed,
    statusLabel: 'Failed',
    errorCode: 'BadGateway',
    errorMessage: 'The server encountered a temporary error. Please retry the operation. ActivityId: 9a8b7c6d-5e4f-3a2b-1c0d-ef9876543210.',
    startTime: '2026-03-12T06:00:00Z',
    endTime: '2026-03-12T06:00:05Z',
    duration: 5000,
  },
];

// Successful runs to mix in for summary calculations
const mockSuccessfulRuns: FlowErrorDetails[] = [
  {
    flowRunId: 'fr-001-aaaa-bbbb-cccc-ssss0001',
    flowName: 'Process Invoice Approval',
    workflowId: MOCK_WORKFLOW_ID_1,
    status: FlowStatusEnum.Succeeded,
    statusLabel: 'Succeeded',
    errorCode: null,
    errorMessage: null,
    startTime: '2026-03-13T10:00:00Z',
    endTime: '2026-03-13T10:00:08Z',
    duration: 8000,
  },
  {
    flowRunId: 'fr-001-aaaa-bbbb-cccc-ssss0002',
    flowName: 'Process Invoice Approval',
    workflowId: MOCK_WORKFLOW_ID_1,
    status: FlowStatusEnum.Succeeded,
    statusLabel: 'Succeeded',
    errorCode: null,
    errorMessage: null,
    startTime: '2026-03-12T10:00:00Z',
    endTime: '2026-03-12T10:00:06Z',
    duration: 6000,
  },
  {
    flowRunId: 'fr-002-aaaa-bbbb-cccc-ssss0001',
    flowName: 'Sync Contacts to Mailchimp',
    workflowId: MOCK_WORKFLOW_ID_2,
    status: FlowStatusEnum.Succeeded,
    statusLabel: 'Succeeded',
    errorCode: null,
    errorMessage: null,
    startTime: '2026-03-13T07:00:00Z',
    endTime: '2026-03-13T07:01:30Z',
    duration: 90000,
  },
];

const allMockRuns = [...mockFlowErrors, ...mockSuccessfulRuns];

export class MockFlowErrorApi {
  async getFlowRunError(flowRunId: string): Promise<FlowErrorDetails> {
    await delay(150);
    const run = allMockRuns.find((r) => r.flowRunId === flowRunId);
    if (!run) throw new Error(`Flow run not found: ${flowRunId}`);
    return run;
  }

  async getFlowErrors(options?: FlowErrorQueryOptions): Promise<FlowErrorDetails[]> {
    await delay(200);
    const statuses = options?.statuses ?? [
      FlowStatusEnum.Failed,
      FlowStatusEnum.Faulted,
      FlowStatusEnum.TimedOut,
      FlowStatusEnum.Aborted,
      FlowStatusEnum.Terminated,
    ];
    const top = options?.top ?? 50;

    let results = allMockRuns.filter((r) => statuses.includes(r.status));

    if (options?.workflowId) {
      results = results.filter((r) => r.workflowId === options.workflowId);
    }

    if (options?.startedAfter) {
      const after = new Date(options.startedAfter).getTime();
      results = results.filter((r) => r.startTime && new Date(r.startTime).getTime() >= after);
    }

    if (options?.startedBefore) {
      const before = new Date(options.startedBefore).getTime();
      results = results.filter((r) => r.startTime && new Date(r.startTime).getTime() <= before);
    }

    // Sort by start time descending
    results.sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return timeB - timeA;
    });

    return results.slice(0, top);
  }

  async getFlowErrorSummary(workflowId: string): Promise<FlowErrorSummary> {
    await delay(250);
    const workflowRuns = allMockRuns.filter((r) => r.workflowId === workflowId);
    const failedRuns = workflowRuns.filter((r) => isFlowFailureStatus(r.status));

    const flowName = workflowRuns.length > 0
      ? workflowRuns[0].flowName
      : workflowId;

    return {
      workflowId,
      flowName,
      totalRuns: workflowRuns.length,
      failedRuns: failedRuns.length,
      errorRate: workflowRuns.length > 0 ? failedRuns.length / workflowRuns.length : 0,
      errors: failedRuns,
    };
  }

  async getLatestFlowError(workflowId: string): Promise<FlowErrorDetails | null> {
    await delay(100);
    const errors = await this.getFlowErrors({ workflowId, top: 1 });
    return errors.length > 0 ? errors[0] : null;
  }

  setAccessToken(_token: string): void {
    // no-op for mock
  }
}
