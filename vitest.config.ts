import { defineConfig } from "vitest/config";

// Collector tests use node:test and run separately from application Vitest tests.
export default defineConfig({ test: { include: ["src/**/*.test.{ts,tsx}"] } });
