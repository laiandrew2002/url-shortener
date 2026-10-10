import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShortenForm } from "./ShortenForm";

const shortened = {
  code: "aB7kP2x",
  shortUrl: "http://localhost:4000/aB7kP2x",
  originalUrl: "https://example.com/a/very/long/path",
};

describe("ShortenForm", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => shortened,
      }),
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("submits a URL and displays the shortened result", async () => {
    const user = userEvent.setup();
    render(<ShortenForm />);

    await user.type(
      screen.getByLabelText("Your destination URL"),
      "https://example.com/a/very/long/path",
    );
    await user.click(screen.getByRole("button", { name: "Shorten URL" }));

    expect(await screen.findByText(shortened.shortUrl)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/urls",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ url: "https://example.com/a/very/long/path" }),
      }),
    );
  });

  it("displays a client validation error without calling the API", async () => {
    const user = userEvent.setup();
    render(<ShortenForm />);

    await user.click(screen.getByRole("button", { name: "Shorten URL" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a URL to shorten.");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("displays an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "The shortened URL would not be shorter than the original URL.",
        }),
      }),
    );
    const user = userEvent.setup();
    render(<ShortenForm />);

    await user.type(
      screen.getByLabelText("Your destination URL"),
      "https://example.com/long-enough-path",
    );
    await user.click(screen.getByRole("button", { name: "Shorten URL" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The shortened URL would not be shorter than the original URL.",
    );
  });

  it("disables the submit button and shows a loading state while the request is in progress", async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    );
    const user = userEvent.setup();
    render(<ShortenForm />);

    await user.type(
      screen.getByLabelText("Your destination URL"),
      "https://example.com/a/very/long/path",
    );
    await user.click(screen.getByRole("button", { name: "Shorten URL" }));

    const loadingButton = screen.getByRole("button", { name: "Shortening..." });
    expect(loadingButton).toBeDisabled();

    resolveRequest({
      ok: true,
      json: async () => shortened,
    });

    expect(await screen.findByText(shortened.shortUrl)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Shorten URL" })).toBeEnabled();
  });

  it("copies the shortened URL and confirms the action", async () => {
    const user = userEvent.setup();
    render(<ShortenForm />);

    await user.type(
      screen.getByLabelText("Your destination URL"),
      "https://example.com/a/very/long/path",
    );
    await user.click(screen.getByRole("button", { name: "Shorten URL" }));
    await screen.findByText(shortened.shortUrl);
    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(await screen.findByText("Short URL copied to clipboard.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("button", { name: "Copy" })).toBeEnabled();
    expect(screen.getByText("Short URL copied to clipboard.")).toBeInTheDocument();
  });

  it("keeps the previous result visible after a later error", async () => {
    const user = userEvent.setup();
    render(<ShortenForm />);

    await user.type(
      screen.getByLabelText("Your destination URL"),
      "https://example.com/a/very/long/path",
    );
    await user.click(screen.getByRole("button", { name: "Shorten URL" }));
    await screen.findByText(shortened.shortUrl);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Too many requests. Please try again later." }),
      }),
    );

    await user.clear(screen.getByLabelText("Your destination URL"));
    await user.type(
      screen.getByLabelText("Your destination URL"),
      "https://example.com/another/long/enough/path",
    );
    await user.click(screen.getByRole("button", { name: "Shorten URL" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many requests. Please try again later.",
    );
    expect(screen.getByText(shortened.shortUrl)).toBeInTheDocument();
  });
});
