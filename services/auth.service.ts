import { prismaClient } from "../server/prisma";
import type { GetServerSidePropsContext } from "next";
import hash from "../server/utils/hash";
import { Session, User } from "@prisma/client";

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
          notes: { select: { id: true } },
        },
      },
    },
  });
  if (!session) {
    return { session: null };
  }
  return { session };
};
