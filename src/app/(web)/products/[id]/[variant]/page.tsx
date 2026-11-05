import { ProductDetailPageContent } from "../page";

export default async function VariantProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; variant: string }>;
}) {
  const { id, variant } = await params;
  return <ProductDetailPageContent id={id} variantSlug={variant} />;
}
