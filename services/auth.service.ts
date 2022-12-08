import { prismaClient } from "../server/prisma";
import crypto, { createHmac } from "crypto";
import { hash } from "bcrypt";
import { GetServerSidePropsContext } from "next";

const generateSessionId = (sessionId?: string) => {
  const id = sessionId ?? crypto.randomBytes(32).toString("hex");

  const hashed = crypto
    //@ts-expect-error
    .createHmac("sha512", process.env.SESSION_SECRET)
    .update(id)
    .digest("hex");
  return { id, hashed };
};

export const isUserLoggedIn = async (req: GetServerSidePropsContext["req"]) => {
  const sessionId = req.cookies["sessionId"];
  if (!sessionId) {
    return null;
  }
  const { hashed } = generateSessionId(sessionId);
  const session = await prismaClient.session.findUnique({
    where: { id: hashed },
    include: {
      user: {
        select: { _count: true, id: true, kits: { select: { id: true } } },
      },
    },
  });
  if (!session) {
    return { session: null, generateCSRF: null };
  }
  const generateCSRF = async () => await _generateCSRFToken(session.id);
  return { session, generateCSRF };
};

export const _generateCSRFToken = async (hashedSessionId: string) => {
  const token = crypto.randomBytes(250).toString("hex");

  await prismaClient.csrfToken.deleteMany({
    where: { sessionId: hashedSessionId },
  });

  await prismaClient.csrfToken.create({
    data: { id: token, sessionId: hashedSessionId },
  });

  return token;
};
