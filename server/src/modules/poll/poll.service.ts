import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import {
  pollsTable,
  questionResponsesTable,
  questionsTable,
  responsesTable,
  type QuestionOption,
} from "../../db/schema";

export type PollWithQuestions = typeof pollsTable.$inferSelect & {
  questions: (typeof questionsTable.$inferSelect & {
    parsedOptions: QuestionOption[];
  })[];
};

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeOptions(options: unknown): QuestionOption[] {
  if (!Array.isArray(options)) return [];
  return options
    .map((option, index) => {
      if (typeof option === "string") {
        return {
          id: crypto.randomUUID(),
          label: option.trim(),
          imageUrl: null,
        };
      }

      if (!option || typeof option !== "object") return null;
      const candidate = option as Partial<QuestionOption>;
      const label = String(candidate.label ?? "").trim();
      if (!label) return null;

      return {
        id: candidate.id || `option-${index + 1}-${crypto.randomUUID()}`,
        label,
        imageUrl: candidate.imageUrl || null,
      };
    })
    .filter(Boolean) as QuestionOption[];
}

export function serializePoll(
  poll: typeof pollsTable.$inferSelect,
  questions: (typeof questionsTable.$inferSelect)[],
) {
  return {
    ...poll,
    tags: parseJson<string[]>(poll.tags, []),
    questions: questions.map((question) => ({
      ...question,
      options: parseJson<QuestionOption[]>(question.options, []),
    })),
  };
}

export function isPollExpired(expiresAt: Date | null) {
  return Boolean(expiresAt && expiresAt.getTime() <= Date.now());
}

export function isAcceptingResponses(poll: typeof pollsTable.$inferSelect) {
  return poll.status === "active" && !isPollExpired(poll.expiresAt);
}

export async function loadPollBySlug(slug: string) {
  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.slug, slug))
    .limit(1);

  if (!poll) return null;

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.pollId, poll.id))
    .orderBy(asc(questionsTable.displayOrder));

  return { poll, questions };
}

export async function loadPollForOwner(pollId: string, ownerId: string) {
  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(and(eq(pollsTable.id, pollId), eq(pollsTable.createdBy, ownerId)))
    .limit(1);

  if (!poll) return null;

  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.pollId, poll.id))
    .orderBy(asc(questionsTable.displayOrder));

  return { poll, questions };
}

export async function buildAnalytics(pollId: string) {
  const questions = await db
    .select()
    .from(questionsTable)
    .where(eq(questionsTable.pollId, pollId))
    .orderBy(asc(questionsTable.displayOrder));

  const responses = await db
    .select()
    .from(responsesTable)
    .where(eq(responsesTable.pollId, pollId));

  const responseIds = responses.map((response) => response.id);
  const answers =
    responseIds.length > 0
      ? await db
          .select()
          .from(questionResponsesTable)
          .where(inArray(questionResponsesTable.responseId, responseIds))
      : [];

  const questionSummaries = questions.map((question) => {
    const options = parseJson<QuestionOption[]>(question.options, []);
    const answersForQuestion = answers.filter(
      (answer) => answer.questionId === question.id,
    );
    const optionCounts = options.map((option) => {
      const count = answersForQuestion.filter(
        (answer) => answer.selectedOptionId === option.id,
      ).length;
      return {
        ...option,
        count,
        percentage:
          answersForQuestion.length === 0
            ? 0
            : Math.round((count / answersForQuestion.length) * 100),
      };
    });

    return {
      id: question.id,
      question: question.question,
      isMandatory: question.isMandatory,
      totalAnswers: answersForQuestion.length,
      skipped: Math.max(0, responses.length - answersForQuestion.length),
      options: optionCounts,
    };
  });

  const firstResponseAt = responses
    .map((response) => response.submittedAt)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const lastResponseAt = responses
    .map((response) => response.submittedAt)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const authenticatedResponses = responses.filter((response) => response.userId);

  return {
    totalResponses: responses.length,
    authenticatedResponses: authenticatedResponses.length,
    anonymousResponses: responses.length - authenticatedResponses.length,
    firstResponseAt: firstResponseAt ?? null,
    lastResponseAt: lastResponseAt ?? null,
    completionRate:
      questions.length === 0 || responses.length === 0
        ? 0
        : Math.round(
            (answers.length / (questions.length * responses.length)) * 100,
          ),
    questions: questionSummaries,
  };
}

export async function makeUniqueSlug(title: string) {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 72) || "poll";

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${Math.random().toString(36).slice(2, 7)}`;
    const slug = `${base}${suffix}`;
    const [existing] = await db
      .select({ id: pollsTable.id })
      .from(pollsTable)
      .where(eq(pollsTable.slug, slug))
      .limit(1);
    if (!existing) return slug;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
