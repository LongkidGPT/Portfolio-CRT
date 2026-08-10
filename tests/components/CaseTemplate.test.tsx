import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import AboutTemplate from "@/components/portfolio/AboutTemplate";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

test.each([
  ["business", "Design logic case study", "/kv/cases/design-logic.png", "5760", "22882"],
  ["brand-system", "Brand system case study", "/kv/cases/brand-system.png", "3299", "32768"],
  ["product-launch", "Product launch case study", "/kv/cases/product-launch.png", "2375", "32768"],
  ["launch-event", "Launch event case study", "/kv/cases/launch-event.png", "4786", "32768"],
] as const)(
  "%s case uses its supplied full-page artwork",
  (id, accessibleName, src, width, height) => {
    render(<CaseTemplate project={getProjectById(id)} />);

    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "src",
      src,
    );
    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "width",
      width,
    );
    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "height",
      height,
    );
    expect(
      screen.queryByRole("navigation", { name: "Case chapters" }),
    ).not.toBeInTheDocument();
  },
);

test.each([
  ["business", "/kv/cases/design-logic-mobile.png", "4560", "22192"],
  ["brand-system", "/kv/cases/brand-system-mobile.png", "2618", "32768"],
  ["product-launch", "/kv/cases/product-launch-mobile.png", "1887", "32768"],
  ["launch-event", "/kv/cases/launch-event-mobile.png", "3789", "32768"],
] as const)("%s exposes its supplied mobile artwork below 768px", (id, src, width, height) => {
  const { container } = render(<CaseTemplate project={getProjectById(id)} />);

  expect(container.querySelector("source")).toHaveAttribute("srcset", src);
  expect(container.querySelector("source")).toHaveAttribute(
    "media",
    "(max-width: 767px)",
  );
  expect(container.querySelector("source")).toHaveAttribute("width", width);
  expect(container.querySelector("source")).toHaveAttribute("height", height);
});

test("uses responsive Netlify Image CDN sources in production", () => {
  const previous = process.env.NETLIFY;
  process.env.NETLIFY = "true";
  try {
    const { container } = render(<CaseTemplate project={getProjectById("brand-system")} />);
    const source = container.querySelector("source")!;
    const image = screen.getByRole("img", { name: "Brand system case study" });

    expect(source.getAttribute("srcset")).toContain("/.netlify/images?url=%2Fkv%2Fcases%2Fbrand-system-mobile.png&w=1170&fm=webp&q=86 1170w");
    expect(image.getAttribute("srcset")).toContain("/.netlify/images?url=%2Fkv%2Fcases%2Fbrand-system.png&w=1740&fm=webp&q=86 1740w");
    expect(image).toHaveAttribute("sizes", "(max-width: 767px) calc(100vw - 36px), min(calc(100vw - 48px), 870px)");
  } finally {
    if (previous === undefined) delete process.env.NETLIFY;
    else process.env.NETLIFY = previous;
  }
});

test("about template links experience rows to the ruler and rebuilds the contact card", () => {
  const { container } = render(<AboutTemplate />);
  expect(screen.getByTestId("about-desktop-background")).toHaveAttribute(
    "src",
    "/kv/cases/about-background.png",
  );
  expect(screen.getByTestId("about-desktop-canvas")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Kid Long CRT portrait" })).toHaveAttribute(
    "src",
    "/kv/cases/about-crt-desktop.png",
  );
  expect(screen.getByRole("img", { name: "Kid Long contact information" })).toHaveAttribute(
    "src",
    "/kv/cases/about-contact.png",
  );
  expect(screen.getByRole("img", { name: "Kid Long visual designer portrait" })).toHaveAttribute(
    "src",
    "/kv/cases/about-crt.png",
  );
  expect(screen.getAllByRole("heading", { name: "我是KID（龙昊翔）" })).toHaveLength(2);
  expect(screen.getAllByText("SENIOR VISUAL DESIGNER")).toHaveLength(2);
  expect(screen.getAllByRole("slider", { name: "Career timeline" })).toHaveLength(2);
  expect(screen.getAllByRole("slider", { name: "Career timeline" })[0]).toHaveAttribute(
    "aria-valuenow",
    "2014",
  );
  expect(screen.getAllByRole("button", { name: "2023–2026 Anker Innovations" })).toHaveLength(2);
  expect(screen.getByRole("img", { name: "Kid Long mobile contact information" })).toHaveAttribute(
    "src",
    "/kv/cases/about-contact-mobile.png",
  );
  expect(screen.queryByTestId("about-contact-card")).not.toBeInTheDocument();
  expect(document.querySelector('[data-about-layout="desktop-editable"]')).toBeInTheDocument();
  expect(document.querySelector('[data-about-layout="mobile-html"]')).toBeInTheDocument();
  expect(container.querySelector('img[src="/kv/cases/about-desktop.png"]')).not.toBeInTheDocument();
});

test("about template defers and resizes its large raster assets on Netlify", () => {
  const previous = process.env.NETLIFY;
  process.env.NETLIFY = "true";
  try {
    render(<AboutTemplate />);
    expect(screen.getByTestId("about-desktop-background")).toHaveAttribute(
      "src",
      "/.netlify/images?url=%2Fkv%2Fcases%2Fabout-background.png&w=2560&fm=webp&q=90",
    );
    expect(screen.getByTestId("about-desktop-background")).toHaveAttribute(
      "loading",
      "lazy",
    );
    expect(screen.getByRole("img", { name: "Kid Long visual designer portrait" })).toHaveAttribute(
      "src",
      "/.netlify/images?url=%2Fkv%2Fcases%2Fabout-crt.png&w=720&fm=webp&q=90",
    );
  } finally {
    if (previous === undefined) delete process.env.NETLIFY;
    else process.env.NETLIFY = previous;
  }
});
