import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";

import { prismaClient } from "../server/prisma";
import { kitsRouter } from "../server/routers/kits";
import type { KitOutput } from "../server/routers/_app";
import { isUserLoggedIn } from "../services/auth.service";

type Props = { kits: KitOutput["getUsersKitsByNewest"]; nickname: string };

const Dashboard = ({ kits, nickname }: Props) => {
  const router = useRouter();
  const [error, setError] = useState<false | string>(false);

  return (
    <Layout nickname={nickname} title="Dashboard">
      <div>
        <h3 className="text-4xl font-semibold text-secondary">Twoje zestawy</h3>
        <div className="flex flex-col flex-wrap justify-center gap-4 mt-4 lg:gap-8 md:justify-start md:flex-row">
          <button
            onClick={() =>
              kits.length < 5
                ? router.push("/add")
                : setError("Limit 5 zestawów")
            }
            className="kit-button"
          >
            Dodaj
          </button>

          {kits.map((kit) => (
            <Link href={`/kit/${kit.id}`} className="kit-button" key={kit.id}>
              {kit.name}
            </Link>
          ))}
        </div>
        {error && (
          <div className="toast toast-end ">
            <div className="shadow-lg alert alert-error">
              <div className="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setError(false)}
                  className="flex-shrink-0 w-8 h-8 cursor-pointer stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Możesz mieć maksymalnie 5 zestawów</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

export const getServerSideProps = async ({
  req,
  res,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const auth = await isUserLoggedIn(req);
  if (!auth?.session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  const caller = kitsRouter.createCaller({
    prismaClient,
    req,
    res,
  });

  const kits = await caller.getUsersKitsByNewest({
    userId: auth.session.userId,
  });

  return {
    props: {
      kits: JSON.parse(JSON.stringify(kits)),
      nickname: auth.session.user.nickname,
    },
  };
};
