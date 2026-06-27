import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Swiper pulls in browser-only behaviour; stub it to plain wrappers so the
// slide content renders deterministically in jsdom.
vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div data-testid="slide">{children}</div>,
}));
vi.mock("swiper/modules", () => ({ Autoplay: {}, Pagination: {} }));
vi.mock("swiper/css", () => ({}));
vi.mock("swiper/css/pagination", () => ({}));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, never>)} />;
  },
}));

import TestimonialsSlider from "./Slider";

describe("TestimonialsSlider", () => {
  it("renders a slide for each testimonial", () => {
    render(<TestimonialsSlider />);
    expect(screen.getAllByTestId("slide").length).toBeGreaterThan(0);
  });

  it("renders testimonial author names and ratings", () => {
    render(<TestimonialsSlider />);
    expect(screen.getByText("Jane D.")).toBeInTheDocument();
    expect(screen.getAllByText("5.0").length).toBeGreaterThan(0);
  });
});
