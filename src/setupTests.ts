import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Automatically cleanup the mounting DOM tree between tests
afterEach(() => {
  cleanup();
});
