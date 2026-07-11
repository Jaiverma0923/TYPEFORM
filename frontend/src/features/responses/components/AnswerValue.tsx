import type { AnswerValue as AnswerValueType } from "@/types/response";

import { formatAnswerValue } from "../utils/format";

export function AnswerValue({ value }: { value: AnswerValueType }) {
  if (Array.isArray(value) && value.length > 0) {
    const stringValues = value.filter((item): item is string => typeof item === "string");

    return (
      <div className="flex flex-wrap gap-2">
        {stringValues.map((item) => (
          <span
            key={item}
            className="rounded-full bg-page px-2.5 py-1 text-xs font-medium text-primary"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span className="whitespace-pre-wrap break-words text-primary">
      {formatAnswerValue(value)}
    </span>
  );
}
