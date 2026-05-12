import type { Request, Response } from "express";
import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "../../db";
import { pollsTable, responsesTable, usersTable } from "../../db/schema";
import { HttpError, requireAdminUser } from "../../lib/http";
import { getIO } from "../../lib/socket";
import { buildAnalytics, parseJson } from "../poll/poll.service";

function stringParam(value: string | string[] | undefined, name: string) {
  if (Array.isArray(value)) return value[0] ?? "";
  if (value) return value;
  throw new HttpError(400, `${name} is required`);
}

export async function getAdminOverview(req: Request, res: Response) {
  await requireAdminUser(req);

  const [users, polls, responses] = await Promise.all([
    db.select().from(usersTable).orderBy(desc(usersTable.createdAt)),
    db.select().from(pollsTable).orderBy(desc(pollsTable.updatedAt)),
    db.select().from(responsesTable).orderBy(desc(responsesTable.submittedAt)),
  ]);

  const responsesByPoll = responses.reduce<Record<string, number>>((counts, response) => {
    counts[response.pollId] = (counts[response.pollId] ?? 0) + 1;
    return counts;
  }, {});
  const usersById = new Map(users.map((user) => [user.id, user]));
  const activePolls = polls.filter((poll) => poll.status === "active").length;
  const publishedPolls = polls.filter((poll) => poll.status === "published").length;
  const anonymousResponses = responses.filter((response) => !response.userId).length;

  return res.json({
    stats: {
      totalUsers: users.length,
      totalPolls: polls.length,
      activePolls,
      publishedPolls,
      totalResponses: responses.length,
      anonymousResponses,
    },
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      pollCount: polls.filter((poll) => poll.createdBy === user.id).length,
      responseCount: responses.filter((response) => response.userId === user.id).length,
    })),
    polls: polls.map((poll) => {
      const owner = usersById.get(poll.createdBy);
      return {
        id: poll.id,
        slug: poll.slug,
        title: poll.title,
        category: poll.category,
        tags: parseJson<string[]>(poll.tags, []),
        status: poll.status,
        isAnonymous: poll.isAnonymous,
        showLiveResults: poll.showLiveResults,
        expiresAt: poll.expiresAt,
        publishedAt: poll.publishedAt,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
        responseCount: responsesByPoll[poll.id] ?? 0,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              email: owner.email,
            }
          : null,
      };
    }),
  });
}

export async function closePollAsAdmin(req: Request, res: Response) {
  await requireAdminUser(req);
  const pollId = stringParam(req.params.id, "Poll id");

  const [updated] = await db
    .update(pollsTable)
    .set({ status: "closed", updatedAt: new Date() })
    .where(and(eq(pollsTable.id, pollId), ne(pollsTable.status, "published")))
    .returning();

  if (!updated) {
    throw new HttpError(404, "Poll not found or cannot be closed");
  }

  const analytics = await buildAnalytics(updated.id);
  getIO().to(`poll:${updated.id}`).emit("poll:closed", {
    pollId: updated.id,
    analytics,
  });

  return res.json({ poll: updated, analytics });
}
