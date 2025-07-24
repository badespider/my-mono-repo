import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// Simple example component for testing
function ExampleComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

describe("ExampleComponent", () => {
  it("renders the title correctly", () => {
    render(<ExampleComponent title="Hello World" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Hello World");
  });

  it("renders with different title", () => {
    render(<ExampleComponent title="AI Portfolio Tracker" />);

    const heading = screen.getByText("AI Portfolio Tracker");
    expect(heading).toBeInTheDocument();
  });
});
