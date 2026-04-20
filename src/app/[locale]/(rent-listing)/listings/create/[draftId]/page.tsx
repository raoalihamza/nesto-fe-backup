import { StepperLayout } from "@/components/rent-listing-form/StepperLayout";

interface Props {
  params: Promise<{ draftId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function EditDraftPage({ params, searchParams }: Props) {
  const { draftId } = await params;
  const { mode } = await searchParams;
  const stepperMode = mode === "edit" ? "edit" : "create";
  return <StepperLayout draftId={draftId} mode={stepperMode} />;
}
