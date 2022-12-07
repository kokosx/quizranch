import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { prismaClient } from "./prisma";

interface CreateContextOptions {
  // session: Session | null
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(_opts: {
  req: NextApiRequest | GetServerSidePropsContext["req"];
  res: NextApiResponse | GetServerSidePropsContext["res"];
}) {
  const { req, res } = _opts;

  return { prismaClient, req, res };
}

export type Context = trpc.inferAsyncReturnType<typeof createContextInner>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions
): Promise<Context> {
  // for API-response caching see https://trpc.io/docs/caching

  return await createContextInner({ req: opts.req, res: opts.res });
}
