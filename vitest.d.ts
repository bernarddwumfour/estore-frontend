/// <reference types="vitest/globals" />
// Registers jest-dom matchers (toBeInTheDocument, toBeDisabled, ...) on
// Vitest's expect for the whole TS project, so test files type-check under the
// app's single tsconfig.json.
import "@testing-library/jest-dom/vitest";
