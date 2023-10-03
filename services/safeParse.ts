// import { Kit } from "@prisma/client";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
// import { TRPCError } from "@trpc/server";
// import { prismaClient } from "../server/prisma";
/*
interface WorkingService<T> {
  data: T;
  success: true;
}

interface ErrorService {
  success: false;
  errorMessage: string;
}

export type Service<T> = WorkingService<T> | ErrorService;

export type AsyncService<T> = Promise<Service<T>>;

const getKit = async (id: string) => {
  const kit = await prismaClient.kit.findUniqueOrThrow({ where: { id } });
  return kit;
};

export async function safeParseAsyncService<T>(
  fn: () => Promise<T>
): Promise<Service<T>> {
  try {
    const data = await fn();
    return { data, success: true };
  } catch (error) {
    const withType = error as unknown as PrismaClientKnownRequestError;
    return { error: withType, success: false };
  }
}
const main = async () => {
  const test = await safeParseAsyncService<Kit>(() =>
    getKit("fa0a9d9b-6e99-48bb-b8df-a3124e535038")
  );
  if (!test.success) {
    console.log("not found :/");
    return;
  }
  console.log(test.data);
};

main();
*/
