import { performance } from 'node:perf_hooks';

export interface DoctorRuntimeTimings {
  readonly clone: number;
  readonly initialValidate: number;
  readonly nonStandardRescue: number;
  readonly upgrade: number;
  readonly finalValidate: number;
  readonly total: number;
}

export interface DoctorRuntimeDiagnostics {
  readonly timingsMs: DoctorRuntimeTimings;
  readonly rescueRetryCount: number;
  readonly warningCount: number;
  readonly originalErrorCount: number;
  readonly finalErrorCount: number;
  readonly originalIsValid: boolean;
  readonly repairedIsValid: boolean;
}

interface TimedResult<T> {
  readonly result: T;
  readonly elapsedMs: number;
}

interface BuildDoctorRuntimeDiagnosticsArgs {
  readonly cloneMs: number;
  readonly initialValidateMs: number;
  readonly nonStandardRescueMs: number;
  readonly upgradeMs: number;
  readonly finalValidateMs: number;
  readonly rescueRetryCount: number;
  readonly warningCount: number;
  readonly originalErrorCount: number;
  readonly finalErrorCount: number;
  readonly originalIsValid: boolean;
  readonly repairedIsValid: boolean;
}

function nowMs(): number {
  return performance.now();
}

export function measureSync<T>(operation: () => T): TimedResult<T> {
  const start = nowMs();
  const result = operation();
  return { result, elapsedMs: nowMs() - start };
}

export async function measureAsync<T>(operation: () => Promise<T>): Promise<TimedResult<T>> {
  const start = nowMs();
  const result = await operation();
  return { result, elapsedMs: nowMs() - start };
}

export function buildDoctorRuntimeDiagnostics(
  args: BuildDoctorRuntimeDiagnosticsArgs,
): DoctorRuntimeDiagnostics {
  const timingsMs: DoctorRuntimeTimings = {
    clone: args.cloneMs,
    initialValidate: args.initialValidateMs,
    nonStandardRescue: args.nonStandardRescueMs,
    upgrade: args.upgradeMs,
    finalValidate: args.finalValidateMs,
    total:
      args.cloneMs +
      args.initialValidateMs +
      args.nonStandardRescueMs +
      args.upgradeMs +
      args.finalValidateMs,
  };

  return {
    timingsMs,
    rescueRetryCount: args.rescueRetryCount,
    warningCount: args.warningCount,
    originalErrorCount: args.originalErrorCount,
    finalErrorCount: args.finalErrorCount,
    originalIsValid: args.originalIsValid,
    repairedIsValid: args.repairedIsValid,
  };
}
