/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from "@prisma/client";

const prismaGlobalTest = global as typeof global & {
  prismaTest?: PrismaClient;
};

const TESTING_DATABASE = "postgresql://postgres:root@localhost:5432/testing";

export const prismaTestClient: PrismaClient =
  prismaGlobalTest.prismaTest ||
  new PrismaClient({ datasources: { db: { url: TESTING_DATABASE } } });

export const clearTestingDb = async () => {
  await prismaTestClient.$transaction([
    prismaTestClient.csrfToken.deleteMany(),
    prismaTestClient.errorReport.deleteMany(),
    prismaTestClient.favoriteKit.deleteMany(),
    prismaTestClient.favoriteNote.deleteMany(),
    prismaTestClient.kit.deleteMany(),
    prismaTestClient.kitQuestion.deleteMany(),
    prismaTestClient.note.deleteMany(),
    prismaTestClient.progress.deleteMany(),
    prismaTestClient.session.deleteMany(),
    prismaTestClient.user.deleteMany(),
  ]);
};

if (process.env.NODE_ENV !== "production") {
  prismaGlobalTest.prismaTest = prismaTestClient;
}
