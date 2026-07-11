"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import type { Question, QuestionType } from "@/types/question";

import { getQuestionTypeLabel } from "../utils/questionTypes";
import { AddQuestionMenu } from "./AddQuestionMenu";

type QuestionSidebarProps = {
  questions: Question[];
  selectedQuestionId: number | null;
  pendingAdd: boolean;
  onAddQuestion: (type: QuestionType) => void;
  onDeleteQuestion: (question: Question) => void;
  onReorderQuestions: (questions: Question[]) => void;
  onSelectQuestion: (question_id: number) => void;
};

function SortableQuestionItem({
  onDeleteQuestion,
  onSelectQuestion,
  question,
  selected,
  displayIndex,
}: {
  question: Question;
  selected: boolean;
  displayIndex: number;
  onDeleteQuestion: (question: Question) => void;
  onSelectQuestion: (question_id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(question.id),
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={
        selected
          ? "rounded-md border border-accent bg-surface p-2 shadow-sm"
          : "rounded-md border border-border bg-surface p-2 hover:border-border-hover"
      }
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Drag ${question.title}`}
          className="mt-1 rounded p-1 text-secondary hover:bg-page hover:text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-current={selected ? "true" : undefined}
          className="min-w-0 flex-1 text-left focus:outline-none"
          onClick={() => onSelectQuestion(question.id)}
        >
          <span className="block truncate text-sm font-medium text-primary">
            {displayIndex + 1}. {question.title}
            {question.required ? <span className="ml-1 text-red-600">*</span> : null}
          </span>
          <span className="mt-1 block text-xs text-secondary">
            {getQuestionTypeLabel(question.type)}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Delete ${question.title}`}
          className="rounded p-1 text-secondary hover:bg-destructive-bg hover:text-destructive-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
          onClick={() => onDeleteQuestion(question)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export function QuestionSidebar({
  onAddQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onSelectQuestion,
  pendingAdd,
  questions,
  selectedQuestionId,
}: QuestionSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (!Number.isInteger(activeId) || !Number.isInteger(overId)) {
      return;
    }

    const oldIndex = questions.findIndex((question) => question.id === activeId);
    const newIndex = questions.findIndex((question) => question.id === overId);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorderQuestions(arrayMove(questions, oldIndex, newIndex));
  }

  return (
    <aside className="flex min-h-0 flex-col border-r border-border bg-page p-3">
      <AddQuestionMenu pending={pendingAdd} onAddQuestion={onAddQuestion} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map((question) => String(question.id))}
          strategy={verticalListSortingStrategy}
        >
          <ol className="mt-4 space-y-2 overflow-y-auto pr-1">
            {questions.map((question, index) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                displayIndex={index}
                selected={question.id === selectedQuestionId}
                onDeleteQuestion={onDeleteQuestion}
                onSelectQuestion={onSelectQuestion}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </aside>
  );
}
