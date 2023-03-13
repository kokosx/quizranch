import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import AuthenticationSVG from "../components/AuthenticationSVG";
import Layout from "../components/layout";

import { isUserLoggedIn } from "../services/auth.service";

import { trpc } from "../utils/trpc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const register = trpc.auth.register.useMutation();
  const login = trpc.auth.login.useMutation();
  const [error, setError] = useState<false | string>(false);

  const router = useRouter();

  useEffect(() => {
    if (register.status === "success" || login.status === "success") {
      router.push("/dashboard");
    }
    if (register.error) {
      setError(register.error.message);
    }
    if (login.error) {
      setError(login.error.message);
    }
  }, [login.status, register.status, router, login.error, register.error]);

  const [tab, setTab] = useState<"register" | "login">("register");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(false);
    const doPasswordsMatch = password === repeatPassword;
    if (!doPasswordsMatch && tab === "register") {
      setError("Hasła się nie zgadzają");
      return;
    }
    //Validate
    const isEmailValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
      email
    );
    if (!isEmailValid) {
      setError("Email jest nieprawidłowy");
      return;
    }
    if (nickname.length < 3 && tab === "register") {
      setError("Nick musi mieć przynajmniej 3 znaki");
      return;
    }
    if (nickname.length >= 15 && tab === "register") {
      setError("Nick może mieć maksymalnie 15 znaków");
      return;
    }
    if (password.length < 5) {
      setError("Hasło musi mieć przynajmniej 5 znaków");
      return;
    }

    if (tab === "login") {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, nickname, password });
    }
  };

  return (
    <Layout nickname={null} title="Zaloguj się">
      <div className="flex flex-wrap items-center px-5 mx-auto md:py-24">
        <div className="flex flex-col items-center pr-0 lg:w-3/5 md:w-1/2 md:pr-16 lg:pr-0">
          <p className="mt-4 leading-relaxed text-center">
            Zaloguj się, by tworzyć notatki, dodawać zestawy i się uczyć
          </p>
          <AuthenticationSVG />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full p-8 rounded-lg lg:w-2/6 md:w-1/2 gap-y-2 md:ml-auto md:mt-0"
        >
          <h2 className="mb-5 text-lg font-medium title-font">
            {tab === "login" ? "Zaloguj się" : "Zarejestruj się"}
          </h2>

          <label htmlFor="email" className="text-sm ">
            Email
          </label>
          <input
            id="email"
            className="input input-bordered"
            placeholder="Pisz tu..."
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="text-sm ">
            Hasło
          </label>
          <input
            id="password"
            className="input input-bordered"
            placeholder="Pisz tu..."
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {tab === "register" && (
            <>
              <label htmlFor="repeat-password" className="text-sm ">
                Powtórz hasło
              </label>
              <input
                id="repeat-password"
                className="input input-bordered"
                placeholder="Pisz tu..."
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              <label htmlFor="nick" className="text-sm ">
                Nazwa użytkownika
              </label>
              <input
                id="nick"
                className="input input-bordered"
                placeholder="Pisz tu..."
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </>
          )}

          <button
            className={`btn ${
              (register.isLoading || login.isLoading) && "loading"
            }`}
            type="submit"
          >
            Dalej
          </button>
          <p className="text-sm text-red-500">
            {error
              ? error
              : tab === "login"
              ? login.error?.message
              : register.error?.message}
          </p>

          <p className="mt-3 text-xs text-gray-500">
            {tab === "login" ? "Nie masz konta?" : "Masz już konto?"}{" "}
            <button
              type="button"
              onClick={() => setTab(tab === "login" ? "register" : "login")}
              className="text-red-500"
            >
              {tab === "login" ? "Zarejestruj się" : "Zaloguj się"}
            </button>
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Login;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const auth = await isUserLoggedIn(ctx.req);
  if (auth?.session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }
  return { props: {} };
};
