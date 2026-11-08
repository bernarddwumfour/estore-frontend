import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ProductResults } from './ProductResults';
import type { AssistantTheme } from './theme';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/app/lib/store/cart-store', () => ({
  useCartStore: (selector: (state: { addItem: () => void; isInCart: () => boolean }) => unknown) =>
    selector({ addItem: vi.fn(), isInCart: () => false }),
}));

vi.mock('@/app/(web)/products/(components)/AddToWishList', () => ({
  default: () => <button type="button">Wishlist</button>,
}));

const theme: AssistantTheme = {
  launcher: '', panel: '', header: '', accent: '', primaryButton: '', outlineButton: '',
  userBubble: '', assistantBubble: '', assistantAvatar: '', composer: '', textarea: '',
  mutedText: '', productCard: '', productImage: '', cardPrimaryButton: '', cardOutlineButton: '',
};

describe('ProductResults', () => {
  it('links to the variant currently selected on the product card', async () => {
    const user = userEvent.setup();
    render(<ProductResults
      theme={theme}
      getProductHref={product => `/products/${product.slug}`}
      products={[{
        id: 'product-1',
        title: 'Laptop',
        slug: 'laptop',
        min_price: 100,
        max_price: 120,
        has_stock: true,
        image: null,
        selected_variant_id: 'variant-blue',
        variants: [
          { id: 'variant-blue', slug: 'blue-16gb', sku: 'masked-blue', attributes: { color: 'Blue' }, price: 100, discounted_price: 100, is_in_stock: true, image: null },
          { id: 'variant-black', slug: 'black-32gb', sku: 'masked-black', attributes: { color: 'Black' }, price: 120, discounted_price: 120, is_in_stock: true, image: null },
        ],
      }]}
    />);

    expect(screen.getAllByRole('link').map(link => link.getAttribute('href')))
      .toEqual(['/products/laptop/blue-16gb', '/products/laptop/blue-16gb']);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Black' }));

    expect(screen.getAllByRole('link').map(link => link.getAttribute('href')))
      .toEqual(['/products/laptop/black-32gb', '/products/laptop/black-32gb']);
  });
});
