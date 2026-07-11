import type { PublicForm } from "@/types/form";

type ThankYouScreenProps = {
  form: PublicForm;
};

export function ThankYouScreen({ form }: ThankYouScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="max-w-lg rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-3xl text-green-700">✓</span>
        </div>

        <h1 className="text-3xl font-semibold text-stone-950">
          {form.thank_you_title || "Thank you!"}
        </h1>

        <p className="mt-3 text-stone-600">
          {form.thank_you_message || "Your response has been submitted."}
        </p>

        <p className="mt-8 text-sm text-stone-500">
          You may now close this page.
        </p>
      </div>
    </main>
  );
}