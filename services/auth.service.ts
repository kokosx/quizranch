import { prismaClient } from "../server/prisma";
import type { GetServerSidePropsContext } from "next";
import hash from "../server/utils/hash";

//To be used in getServerSideProps
export const isUserLoggedIn = async (req: GetServerSidePropsContext["req"]) => {
  const sessionId = req.cookies["sessionId"];
  if (!sessionId) {
    return null;
  }
  const hashedSessionId = hash(sessionId);
  const session = await prismaClient.session.findUnique({
    where: { id: hashedSessionId },
    include: {
      user: {
        select: {
          _count: true,
          id: true,
          kits: { select: { id: true } },
          nickname: true,
        },
      },
    },
  });
  if (!session) {
    return { session: null, generateCSRF: null };
  }
  return { session };
};
/*
const _generateCSRFToken = async (hashedSessionId: string) => {
  const token = crypto.randomBytes(250).toString("hex");

  await prismaClient.csrfToken.deleteMany({
    where: { sessionId: hashedSessionId },
  });

  await prismaClient.csrfToken.create({
    data: { id: token, sessionId: hashedSessionId },
  });

  return token;
};*/
