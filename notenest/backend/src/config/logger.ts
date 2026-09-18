/**
 * Application-wide structured logger.
 *
 * In development, logs are pretty-printed and colorized to the console.
 * In production, logs are emitted as JSON lines so they can be shipped to
 * a log aggregator (Datadog, CloudWatch, etc.) without extra parsing.
 */
import winston from "winston";
import { isProduction } from "./env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});
