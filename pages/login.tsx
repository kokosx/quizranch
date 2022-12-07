import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import Layout from "../components/layout";
import { Spinner } from "../components/Spinner";
import { isUserLoggedIn } from "../services/auth.service";

import { withPageAuth, withPageAuthSession } from "../utils/ssr";

import { trpc } from "../utils/trpc";

const Login = () => {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [nickname, setNickname] = useState("");

        const register = trpc.auth.register.useMutation();
        const login = trpc.auth.login.useMutation();

        const router = useRouter();

        useEffect(() => {
                if (
                        register.status === "success" ||
                        login.status === "success"
                ) {
                        router.push("/dashboard");
                }
        }, [login.status, register.status, router]);

        const [tab, setTab] = useState<"register" | "login">("register");

        const handleSubmit = async (e: FormEvent) => {
                e.preventDefault();

                if (tab === "login") {
                        login.mutate({ email, password });
                } else {
                        register.mutate({ email, nickname, password });
                }
        };

        return (
                <Layout>
                        <div className="flex flex-wrap items-center px-5 mx-auto md:py-24">
                                <div className="pr-0 lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0">
                                        <p className="mt-4 leading-relaxed">
                                                Zacznij tworzyć własne zestawy
                                                do nauki które pomogą ci w
                                                zdobyciu lepszych ocen
                                        </p>
                                </div>
                                <form
                                        onSubmit={handleSubmit}
                                        className="flex flex-col w-full p-8 rounded-lg lg:w-2/6 md:w-1/2 gap-y-2 md:ml-auto md:mt-0"
                                >
                                        <h2 className="mb-5 text-lg font-medium title-font">
                                                {tab === "login"
                                                        ? "Zaloguj się"
                                                        : "Zarejestruj się"}
                                        </h2>

                                        <label className="text-sm ">
                                                Email
                                        </label>
                                        <input
                                                className="input input-bordered"
                                                placeholder="Pisz tu..."
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                        setEmail(e.target.value)
                                                }
                                        />

                                        <label className="text-sm ">
                                                Hasło
                                        </label>
                                        <input
                                                className="input input-bordered"
                                                placeholder="Pisz tu..."
                                                type="password"
                                                value={password}
                                                onChange={(e) =>
                                                        setPassword(
                                                                e.target.value
                                                        )
                                                }
                                        />

                                        {tab === "register" && (
                                                <>
                                                        <label className="text-sm ">
                                                                Nazwa
                                                                użytkownika
                                                        </label>
                                                        <input
                                                                className="input input-bordered"
                                                                placeholder="Pisz tu..."
                                                                type="text"
                                                                value={nickname}
                                                                onChange={(e) =>
                                                                        setNickname(
                                                                                e
                                                                                        .target
                                                                                        .value
                                                                        )
                                                                }
                                                        />
                                                </>
                                        )}

                                        <button
                                                className={`btn ${
                                                        (register.isLoading ||
                                                                login.isLoading) &&
                                                        "loading"
                                                }`}
                                                type="submit"
                                        >
                                                Dalej
                                        </button>
                                        <p className="text-sm text-red-500">
                                                {tab === "login"
                                                        ? login.error?.message
                                                        : register.error
                                                                  ?.message}
                                        </p>

                                        <p className="mt-3 text-xs text-gray-500">
                                                {tab === "login"
                                                        ? "Nie masz konta?"
                                                        : "Masz już konto?"}{" "}
                                                <button
                                                        type="button"
                                                        onClick={() =>
                                                                setTab(
                                                                        tab ===
                                                                                "login"
                                                                                ? "register"
                                                                                : "login"
                                                                )
                                                        }
                                                        className="text-red-500"
                                                >
                                                        {tab === "login"
                                                                ? "Zarejestruj się"
                                                                : "Zaloguj się"}
                                                </button>
                                        </p>
                                </form>
                        </div>
                </Layout>
        );
};

export default Login;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
        const session = await isUserLoggedIn(ctx.req);
        if (session) {
                return {
                        redirect: {
                                destination: "/dashboard",
                                permanent: false,
                        },
                };
        }
        return { props: {} };
};
