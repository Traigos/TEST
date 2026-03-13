// ============================================================
// Flow Error API
// Custom API layer for querying flow run errors.
// Works around elastic table limitations in Dataverse REST API
// by fetching individual flow sessions and aggregating results
// client-side rather than relying on unsupported OData queries.
// ============================================================

import type {
  FlowSession,
  FlowRun,
  FlowErrorDetails,
  FlowErrorSummary,
  FlowStatus,
  DataverseResponse,
} from '../types/dataverse';
import type { DataverseConfig } from './dataverse-client';
import { DataverseApiError } from './dataverse-client';

const FLOW_STATUS_LABELS: Record<FlowStatus, string> = {
  0: 'Not Specified',
  1: 'Paused',
  2: 'Running',
  3: 'Waiting',
  4: 'Succeeded',
  5: 'Skipped',
  6: 'Suspended',
  7: 'Cancelled',
  8: 'Failed',
  9: 'Faulted',
  10: 'Timed Out',
  11: 'Aborted',
  12: 'Ignored',
  13: 'Deleted',
  14: 'Terminated',
};

const FAILED_STATUSES: FlowStatus[] = [8, 9, 10, 11, 14]; // Failed, Faulted, TimedOut, Aborted, Terminated

export interface FlowErrorQueryOptions {
  /** Filter to a specific workflow (cloud flow) by ID */
  workflowId?: string;
  /** Only return runs with these statuses. Defaults to failed statuses. */
  statuses?: FlowStatus[];
  /** Maximum number of error records to return. Defaults to 50. */
  top?: number;
  /** Only return runs after this date (ISO 8601) */
  startedAfter?: string;
  /** Only return runs before this date (ISO 8601) */
  startedBefore?: string;
}

export class FlowErrorApi {
  private config: DataverseConfig;

  constructor(config: DataverseConfig) {
    this.config = config;
  }

  private get apiUrl(): string {
    return `${this.config.baseUrl}/api/data/${this.config.apiVersion}`;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    const response = await window.fetch(`${this.apiUrl}${endpoint}`, { headers });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new DataverseApiError(
        `Flow API error: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return response.json();
  }

  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  /**
   * Get error details for a specific flow run by ID.
   * Fetches the flow session directly by primary key, which is
   * supported on elastic tables (unlike complex OData filters).
   */
  async getFlowRunError(flowSessionId: string): Promise<FlowErrorDetails> {
    const session = await this.fetch<FlowSession>(
      `/flowsessions(${flowSessionId})?$select=flowsessionid,name,regardingobjectid,regardingobjectidname,statuscode,startedon,completedon,errorcode,errormessage`
    );

    return this.mapSessionToErrorDetails(session);
  }

  /**
   * Get all failed flow runs for a specific workflow (cloud flow).
   * Uses the workflow ID to scope the query, then filters for
   * error statuses. Works around elastic table query limitations
   * by using the regardingobjectid filter which is indexed.
   */
  async getFlowErrors(options?: FlowErrorQueryOptions): Promise<FlowErrorDetails[]> {
    const statuses = options?.statuses ?? FAILED_STATUSES;
    const top = options?.top ?? 50;

    const filterParts: string[] = [];

    if (options?.workflowId) {
      filterParts.push(`_regardingobjectid_value eq '${options.workflowId}'`);
    }

    // Build status filter using 'in' operator for elastic tables
    if (statuses.length > 0) {
      const statusValues = statuses.join(',');
      filterParts.push(`Microsoft.Dynamics.CRM.In(PropertyName='statuscode',PropertyValues=[${statusValues}])`);
    }

    if (options?.startedAfter) {
      filterParts.push(`startedon ge ${options.startedAfter}`);
    }

    if (options?.startedBefore) {
      filterParts.push(`startedon le ${options.startedBefore}`);
    }

    const filter = filterParts.length > 0 ? `$filter=${filterParts.join(' and ')}` : '';
    const select = '$select=flowsessionid,name,regardingobjectid,regardingobjectidname,statuscode,startedon,completedon,errorcode,errormessage';
    const orderby = '$orderby=startedon desc';
    const topParam = `$top=${top}`;

    const params = [select, orderby, topParam];
    if (filter) params.unshift(filter);

    const result = await this.fetch<DataverseResponse<FlowSession>>(
      `/flowsessions?${params.join('&')}`
    );

    return result.value.map((session) => this.mapSessionToErrorDetails(session));
  }

  /**
   * Get an error summary for a specific workflow, including
   * total runs, failed runs, error rate, and individual error details.
   */
  async getFlowErrorSummary(workflowId: string): Promise<FlowErrorSummary> {
    // Fetch recent runs (both successful and failed) to compute error rate
    const [allRuns, failedRuns] = await Promise.all([
      this.fetch<DataverseResponse<FlowSession>>(
        `/flowsessions?$filter=_regardingobjectid_value eq '${workflowId}'&$select=flowsessionid,statuscode&$top=100&$orderby=startedon desc`
      ),
      this.getFlowErrors({ workflowId, top: 50 }),
    ]);

    const totalRuns = allRuns.value.length;
    const failedCount = allRuns.value.filter(
      (s) => FAILED_STATUSES.includes(s.statuscode)
    ).length;

    // Derive flow name from the first available error, or use workflowId
    const flowName = failedRuns.length > 0
      ? failedRuns[0].flowName
      : workflowId;

    return {
      workflowId,
      flowName,
      totalRuns,
      failedRuns: failedCount,
      errorRate: totalRuns > 0 ? failedCount / totalRuns : 0,
      errors: failedRuns,
    };
  }

  /**
   * Get the most recent error for a specific workflow.
   * Convenient shorthand for getting just the latest failure.
   */
  async getLatestFlowError(workflowId: string): Promise<FlowErrorDetails | null> {
    const errors = await this.getFlowErrors({ workflowId, top: 1 });
    return errors.length > 0 ? errors[0] : null;
  }

  private mapSessionToErrorDetails(session: FlowSession): FlowErrorDetails {
    const startTime = session.startedon ?? null;
    const endTime = session.completedon ?? null;
    let duration: number | null = null;

    if (startTime && endTime) {
      duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    }

    return {
      flowRunId: session.flowsessionid,
      flowName: session.regardingobjectidname ?? session.name ?? 'Unknown Flow',
      workflowId: session.regardingobjectid ?? '',
      status: session.statuscode,
      statusLabel: FLOW_STATUS_LABELS[session.statuscode] ?? 'Unknown',
      errorCode: session.errorcode ?? null,
      errorMessage: session.errormessage ?? null,
      startTime,
      endTime,
      duration,
    };
  }
}

/**
 * Helper to check if a flow status represents a failure.
 */
export function isFlowFailureStatus(status: FlowStatus): boolean {
  return FAILED_STATUSES.includes(status);
}

/**
 * Helper to get a human-readable label for a flow status code.
 */
export function getFlowStatusLabel(status: FlowStatus): string {
  return FLOW_STATUS_LABELS[status] ?? 'Unknown';
}

/**
 * Format a duration in milliseconds to a human-readable string.
 */
export function formatFlowDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
