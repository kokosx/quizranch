import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { trpc } from "../utils/trpc";

const Layout = ({
  children,
  user,
}: {
  children: ReactNode;
  user?: boolean;
}) => {
  const router = useRouter();
  const logout = trpc.auth.logout.useMutation();

  return (
    <>
      <div className="container flex flex-col justify-center p-2 mx-auto">
        <nav className="p-0 pb-2 navbar bg-base-100">
          <div className="flex-1">
            <Link
              href={user ? "/dashboard" : "/"}
              className="p-2 text-5xl font-semibold normal-case duration-200 rounded-md hover:bg-neutral "
            >
              Quizranch
            </Link>
          </div>
          <div className="flex-none">
            {user ? (
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
                    <Link href="/profile" className="justify-between">
                      Profile
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={() => {
                        logout.mutate();
                        router.push("/");
                      }}
                    >
                      Logout
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
