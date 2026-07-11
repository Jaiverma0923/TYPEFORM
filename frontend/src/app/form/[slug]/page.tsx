import { RespondentPage } from "@/features/respondent/components/RespondentPage";

type PublicFormPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { slug } = await params;

  return <RespondentPage slug={slug} />;
}
