import Layout from "../../components/layout";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { kitsRouter } from "../../server/routers/kits";
import { prismaClient } from "../../server/prisma";
import Avatar from "../../components/Avatar";
import Link from "next/link";
import { isUserLoggedIn } from "../../services/auth.service";
import { usersRouter } from "../../server/routers/user";

type _Kit = {
  user: {
    nickname: string;
    avatarSeed: string | null;
  };
  id: string;
  name: string;
  description: string;
};

type _User = {
  nickname: string;
  avatarSeed: string;
};

type Props = {
  searchText: string;
  type: "kit" | "user";
  kits: _Kit[];
  users: _User[];
  nickname?: string;
};

const SearchResults = ({ searchText, kits, nickname, type, users }: Props) => {
  const renderSearchResults = () => {
    if (type === "kit") {
      return kits.map((v) => (
        <div key={v.id}>
          <div className="flex p-2 rounded-md h-36 w-72 md:w-96 bg-neutral">
            <div className="flex flex-col justify-between min-w-max ">
              <h5 className="p-2 text-2xl font-semibold">
                {v.name.substring(0, 15)}
              </h5>
              <Link href={`/profile/${v.user.nickname}`}>
                <div className="flex items-center w-full p-2 border-2 border-transparent rounded-md gap-x-2 hover:border-accent">
                  <span>
                    {v.user.nickname.substring(0, 10)}
                    {v.user.nickname.length >= 10 && "..."}
                  </span>

                  <Avatar data={v.user} />
                </div>
              </Link>
            </div>
            <div className="flex items-end justify-end w-full h-full ">
              <Link href={`/kit/${v.id}`}>
                <button className="btn btn-secondary">Przejdź</button>
              </Link>
            </div>
          </div>
        </div>
      ));
    }
    if (type === "user") {
      return users.map((v) => (
        <div key={v.nickname}>
          <div className="flex p-2 rounded-md h-36 w-72 md:w-96 bg-neutral">
            <div className="flex flex-col justify-between min-w-max ">
              <h5 className="flex p-2 text-2xl font-semibold gap-x-2">
                {v.nickname.substring(0, 15)}
                <Avatar data={v} />
              </h5>
            </div>
            <div className="flex items-end justify-end w-full h-full ">
              <Link href={`/profile/${v.nickname}`}>
                <button className="btn btn-secondary">Przejdź</button>
              </Link>
            </div>
          </div>
        </div>
      ));
    }
  };
  return (
    <Layout
      nickname={nickname}
      title={`Wyniki dla ${searchText}`}
      initialSearchText={searchText}
    >
      <div className="flex flex-col gap-y-2">
        <h3 className="text-4xl font-semibold text-secondary">
          Wyniki wyszukiwania dla {searchText}
        </h3>
        <div className="btn-group">
          <Link
            className={`btn ${type === "kit" && "btn-active"} `}
            href={`/search?text=${searchText}&type=kit`}
          >
            Zestawy
          </Link>
          <Link
            className={`btn  ${type === "user" && "btn-active"} `}
            href={`/search?text=${searchText}&type=user`}
          >
            Użytkownicy
          </Link>
        </div>
        <div className="flex flex-col flex-wrap justify-center gap-4 lg:gap-8 md:justify-start md:flex-row">
          {renderSearchResults()}

          {kits.length === 0 && <p>Nie znaleziono takiego zestawu</p>}
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults;

export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<Props & { kits: any[] }>
> => {
  const searchText = query.text as unknown as string;
  const type = query.type === "user" ? "user" : "kit";

  const kitCaller = kitsRouter.createCaller({ prismaClient, req, res });
  const userCaller = usersRouter.createCaller({ prismaClient, req, res });

  const [auth, searched] = await Promise.all([
    isUserLoggedIn(req),
    //Use appropiate caller
    type === "user"
      ? userCaller.searchForUser({ nickname: searchText })
      : kitCaller.searchForKit({ name: searchText }),
  ]);
  //Set arrays and give them appropiate types
  const users = type === "user" ? (searched as _User[]) : [];
  const kits = type === "kit" ? (searched as _Kit[]) : [];

  return {
    props: {
      users,
      searchText,
      kits,
      nickname: auth?.session?.user.nickname,
      type,
    },
  };
};
