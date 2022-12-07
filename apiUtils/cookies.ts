import { setCookie } from "cookies-next";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";

export const setSessionCookie = (
  sessionId: string,
  {
    req,
    res,
  }: {
    req: NextApiRequest | GetServerSidePropsContext["req"];
    res: NextApiResponse | GetServerSidePropsContext["res"];
  }
) => {
  setCookie("sessionId", sessionId, {
    req,
    res,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 60 * 24 * 1000,
    secure: true,
    sameSite: true,
  });
};
