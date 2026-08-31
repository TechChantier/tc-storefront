export type LogLevel = "info" | "warn" | "error";

export type LogContext = Record<
  string,
  string | number | boolean | null | undefined
>;

export function logEvent(
  level: LogLevel,
  message: string,
  context: LogContext = {},
): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
