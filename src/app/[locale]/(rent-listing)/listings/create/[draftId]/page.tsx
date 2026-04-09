import { StepperLayout } from "@/components/rent-listing-form/StepperLayout";

interface Props {
  params: Promise<{ draftId: string }>;
}

export default async function EditDraftPage({ params }: Props) {
  const { draftId } = await params;
  return <StepperLayout draftId={draftId} />;
}
