import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MultiImagePreviewModal from "./ImagePreviewModal";

const images = ["/a.jpg", "/b.jpg", "/c.jpg"];

describe("MultiImagePreviewModal", () => {
  it("does not render when closed", () => {
    render(<MultiImagePreviewModal images={images} alt="Gallery" open={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Image Preview/i)).not.toBeInTheDocument();
  });

  it("renders the position-aware title and controls when open", () => {
    render(<MultiImagePreviewModal images={images} alt="Gallery" open onClose={vi.fn()} />);
    expect(screen.getByText("Image Preview (1 of 3)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rotate/i })).toBeInTheDocument();
  });

  it("renders a thumbnail strip only for multiple images", () => {
    const { rerender } = render(
      <MultiImagePreviewModal images={images} alt="Gallery" open onClose={vi.fn()} />
    );
    expect(screen.getAllByAltText(/Thumbnail/).length).toBe(3);

    rerender(<MultiImagePreviewModal images={["/only.jpg"]} alt="Solo" open onClose={vi.fn()} />);
    expect(screen.queryByAltText(/Thumbnail/)).not.toBeInTheDocument();
  });

  it("advances to the next image with the ArrowRight key", () => {
    render(<MultiImagePreviewModal images={images} alt="Gallery" open onClose={vi.fn()} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Image Preview (2 of 3)")).toBeInTheDocument();
  });

  it("increases the zoom percentage when Zoom In is clicked", async () => {
    render(<MultiImagePreviewModal images={images} alt="Gallery" open onClose={vi.fn()} />);
    expect(screen.getByText(/Zoom: 100%/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /zoom in/i }));
    expect(screen.getByText(/Zoom: 125%/)).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(<MultiImagePreviewModal images={images} alt="Gallery" open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
