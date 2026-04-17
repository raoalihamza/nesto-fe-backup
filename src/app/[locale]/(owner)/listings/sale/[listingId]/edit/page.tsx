import { SaleListingForm } from "@/components/sale-listing/SaleListingForm";

interface Props {
  params: Promise<{ listingId: string }>;
}

export default async function SaleListingEditPage({ params }: Props) {
  const { listingId } = await params;
  return <SaleListingForm listingId={listingId} />;
}
