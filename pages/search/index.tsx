import Layout from "../../components/layout";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { kitsRouter } from "../../server/routers/kits.router";
import { prismaClient } from "../../server/prisma";
import Avatar from "../../components/Avatar";
import Link from "next/link";
import { isUserLoggedIn } from "../../services/auth.service";
import { usersRouter } from "../../server/routers/user.router";
import { trpc } from "../../utils/trpc";
import { useEffect, useState } from "react";
import type {
  KitOutput,
  NoteOutput,
  UserOutput,
} from "../../server/routers/_app";
import { notesRouter } from "../../server/routers/notes.router";

type QueryType = "kit" | "user" | "note";

type Props = {
  key: string;
  searchText: string;
  type: QueryType;
  _kits: KitOutput["searchForKit"];
  _users: UserOutput["searchForUser"];
  _notes: NoteOutput["searchForNote"];
  nickname: string | null;
};

const SearchResults = ({
  searchText,
  _kits,
  nickname,
  type,
  _users,
  _notes,
}: Props) => {
  const [kits, setKits] = useState(_kits);
  const [users, setUsers] = useState(_users);
  const [notes, setNotes] = useState(_notes);
  const [kitsSkipped, setKitsSkipped] = useState(10);
  const [usersSkipped, setUsersSkipped] = useState(10);
  const [notesSkipped, setNotesSkipped] = useState(10);
  const [isMoreUsers, setIsMoreUsers] = useState(users.length === 10);
  const [isMoreKits, setIsMoreKits] = useState(kits.length === 10);
  const [isMoreNotes, setIsMoreNotes] = useState(notes.length === 10);

  const moreKits = trpc.kit.searchForKit.useQuery(
    { name: searchText, skip: kitsSkipped },
    { enabled: false }
  );
  const moreUsers = trpc.user.searchForUser.useQuery(
    { nickname: searchText, skip: usersSkipped },
    { enabled: false }
  );
  const moreNotes = trpc.note.searchForNote.useQuery(
    { text: searchText, skip: notesSkipped },
    { enabled: false }
  );

  //Piekło:
  useEffect(() => {
    if (moreUsers.fetchStatus === "idle" && moreUsers.data && isMoreUsers) {
      const prev = [...users];
      const toSet = prev.concat(moreUsers.data);
      setUsersSkipped(usersSkipped + moreUsers.data.length);

      if (moreUsers.data.length < 10) {
        setIsMoreUsers(false);
      }
      setUsers(toSet);
    }
    if (moreNotes.fetchStatus === "idle" && moreNotes.data && isMoreNotes) {
      const prev = [...notes];
      const toSet = prev.concat(moreNotes.data);
      setNotesSkipped(notesSkipped + moreNotes.data.length);

      if (moreNotes.data.length < 10) {
        setIsMoreNotes(false);
      }
      setNotes(toSet);
    }
    if (moreKits.fetchStatus === "idle" && moreKits.data && isMoreKits) {
      const prev = [...kits];
      const toSet = prev.concat(moreKits.data);
      setKitsSkipped(kitsSkipped + moreKits.data.length);

      if (moreKits.data.length < 10) {
        setIsMoreKits(false);
      }

      setKits(toSet);
    }
  }, [
    moreUsers.fetchStatus,
    moreKits.fetchStatus,
    kits,
    kitsSkipped,
    moreKits.data,
    users,
    usersSkipped,
    moreUsers.data,
    isMoreUsers,
    isMoreKits,
    isMoreNotes,
    moreNotes.data,
    moreNotes.fetchStatus,
    notes,
    notesSkipped,
  ]);

  const loadMore = (what: typeof type) => {
    if (what === "kit") {
      if (!isMoreKits) {
        return;
      }
      moreKits.refetch();
    } else if (what === "user") {
      if (!isMoreUsers) {
        return;
      }
      moreUsers.refetch();
    }
  };
  const renderSearchResults = () => {
    if (type === "kit") {
      return (
        <>
          {kits.map((v) => (
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
          ))}
          {isMoreKits && (
            <button
              onClick={() => loadMore("kit")}
              className={`flex items-center justify-center p-2 text-4xl font-semibold rounded-md cursor-pointer h-36 w-72 md:w-96 btn ${
                moreKits.isFetching && "loading"
              }`}
            >
              Pokaż więcej
            </button>
          )}
        </>
      );
    }
    if (type === "note") {
      return (
        <>
          {notes.map((v) => (
            <div key={v.id}>
              <div className="flex p-2 rounded-md h-36 w-72 md:w-96 bg-neutral">
                <div className="flex flex-col justify-between min-w-max ">
                  <h5 className="p-2 text-2xl font-semibold">{v.name}</h5>
                  <Link href={`/profile/${v.user.id}`}>
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
                  <Link href={`/note/${v.id}`}>
                    <button className="btn btn-secondary">Przejdź</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {isMoreKits && (
            <button
              onClick={() => loadMore("kit")}
              className={`flex items-center justify-center p-2 text-4xl font-semibold rounded-md cursor-pointer h-36 w-72 md:w-96 btn ${
                moreKits.isFetching && "loading"
              }`}
            >
              Pokaż więcej
            </button>
          )}
        </>
      );
    }
    if (type === "user") {
      return (
        <>
          {users.map((v) => (
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
          ))}
          {isMoreUsers && (
            <button
              onClick={() => loadMore("user")}
              className={`flex items-center justify-center p-2 text-4xl font-semibold rounded-md cursor-pointer h-36 w-72 md:w-96 btn ${
                moreKits.isFetching && "loading"
              }`}
            >
              Pokaż więcej
            </button>
          )}
        </>
      );
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
          <Link
            className={`btn  ${type === "note" && "btn-active"} `}
            href={`/search?text=${searchText}&type=note`}
          >
            Notatki
          </Link>
        </div>
        <div className="flex flex-col flex-wrap justify-center gap-4 mt-4 lg:gap-8 md:justify-start md:flex-row">
          {renderSearchResults()}
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
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> => {
  const searchText = query.text as unknown as string;
  let type: QueryType = (query.type as unknown as QueryType) ?? "kit";
  if (type !== "note" && type !== "kit" && type !== "user") {
    type = "kit";
  }
  const kitCaller = kitsRouter.createCaller({ prismaClient, req, res });
  const userCaller = usersRouter.createCaller({ prismaClient, req, res });
  const noteCaller = notesRouter.createCaller({ prismaClient, req, res });
  const auth = await isUserLoggedIn(req);

  let kits: KitOutput["searchForKit"] = [];
  let notes: NoteOutput["searchForNote"] = [];
  let users: UserOutput["searchForUser"] = [];

  if (type === "kit") {
    kits = await kitCaller.searchForKit({ name: searchText });
  }
  if (type === "note") {
    notes = await noteCaller.searchForNote({ text: searchText });
  }
  if (type === "user") {
    users = await userCaller.searchForUser({ nickname: searchText });
  }

  return {
    props: {
      key: `${searchText} ${type}`,
      _users: users,
      searchText,
      _kits: kits,
      _notes: notes,
      nickname: auth?.session?.user.nickname ?? null,
      type,
    },
  };
};
