import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

const Layout = ({
  children,
  nickname,
  title,
  initialSearchText,
}: {
  children: ReactNode;
  nickname?: string;
  title: string;
  initialSearchText?: string;
}) => {
  const router = useRouter();
  const logout = trpc.auth.logout.useMutation();

  const [searchText, setSearchText] = useState(initialSearchText ?? "");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.length > 1) {
      router.push(`/search?text=${searchText}`);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="description" content="Create learning kits" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div className="container flex flex-col justify-center w-full p-2 mx-auto">
        <nav className="flex items-center gap-2 p-0 pb-2 navbar bg-base-100">
          <h1 className="flex-1">
            <Link
              href={nickname ? "/dashboard" : "/"}
              className="p-2 text-5xl font-semibold normal-case duration-200 rounded-md hover:bg-neutral "
            >
              <p className="md:hidden">Q</p>
              <p className="hidden md:block">Quizranch</p>
            </Link>
          </h1>

          <div className="flex items-center justify-end w-full gap-x-2 ">
            <form className="w-full form-control" onSubmit={handleSearch}>
              <div className="flex justify-end input-group">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  type="text"
                  placeholder="Wyszukaj..."
                  className="w-full input input-md md:w-52 input-bordered focus:w-full"
                />
                <button type="submit" className="btn btn-square">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {nickname ? (
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="text-center btn btn-ghost btn-circle avatar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-5 h-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    ></path>
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="p-2 mt-3 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <Link
                      href={`/profile/${nickname}`}
                      className="justify-between"
                    >
                      Profil
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        logout.mutate();
                        router.push("/");
                      }}
                    >
                      Wyloguj się
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn">
                Zaloguj się
              </Link>
            )}
          </div>
        </nav>

        <main className="p-2">{children}</main>
      </div>
    </>
  );
};
export default Layout;
