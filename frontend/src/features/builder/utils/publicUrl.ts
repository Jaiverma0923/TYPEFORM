import type { Form } from "@/types/form";

export function getPublicFormUrl(form: Form) {
  if (form.public_url) {
    return form.public_url;
  }

  if (!form.slug || typeof window === "undefined") {
    return null;
  }

  return `${window.location.origin}/form/${form.slug}`;
}
