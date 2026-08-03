import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import ContactActions from "@/components/portfolio/ContactActions";
import { copyText } from "@/lib/portfolio/clipboard";

vi.mock("@/lib/portfolio/clipboard", () => ({
  copyText: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

test("renders the three supplied contact actions", () => {
  const { container } = render(<ContactActions />);

  expect(screen.getByRole("button", { name: "Copy email address" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Copy phone number" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Copy WeChat ID" })).toBeVisible();
  expect(
    Array.from(container.querySelectorAll("img"), (image) => image.getAttribute("src")),
  ).toEqual([
    "/kv/contact/mail.png",
    "/kv/contact/phone.png",
    "/kv/contact/wechat.png",
  ]);
});

test.each([
  ["Copy email address", "longkid@sohu.com"],
  ["Copy phone number", "18520224719"],
  ["Copy WeChat ID", "lkchat1980"],
] as const)("%s copies its exact value", async (name, value) => {
  render(<ContactActions />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name }));
  });

  expect(copyText).toHaveBeenCalledWith(value);
  expect(screen.getByText("COPIED")).toBeVisible();
});

test("clears copied feedback after 1.2 seconds", async () => {
  vi.useFakeTimers();
  render(<ContactActions />);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }));
  });
  expect(screen.getByText("COPIED")).toBeVisible();

  act(() => vi.advanceTimersByTime(1200));

  expect(screen.queryByText("COPIED")).not.toBeInTheDocument();
});
