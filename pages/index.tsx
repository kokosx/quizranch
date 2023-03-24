import Link from "next/link";
import { Education } from "../components/Education";
import Layout from "../components/layout";

const Login = () => {
  return (
    <Layout nickname={null} title="Strona główna">
      <div className="flex flex-col items-center w-full h-full text-lg text-center gap-y-2">
        <h2 className="text-3xl font-semibold text-secondary">
          Witaj w Quizranch!
        </h2>
        <p>
          Quizranch to platforma służąca powtarzaniu materiału z lekcji, pisaniu
          notatek, a także przypominaniu zagadnień i pisaniu egzaminów próbnych
        </p>
        <Education />
        <h3 className="text-2xl">Twórz nowe zestawy</h3>

        <picture>
          <img src="/create-kit.png" alt="create new kit" />
        </picture>

        <h3 className="text-2xl">Powtarzaj za pomocą interaktywnych fiszek</h3>
        <picture>
          <img src="/learn-kit.png" alt="learn kit" />
        </picture>
        <h3 className="text-2xl">
          Dodaj do pulpitu lub ekranu głównego poprzez instalację z przeglądarki
        </h3>
        <picture>
          <img src="/pwa.png" alt="learn kit" />
        </picture>

        <h3 className="text-2xl">I wiele więcej!</h3>
        <Link className="btn" href="/login">
          Rozpocznij
        </Link>
      </div>
    </Layout>
  );
};

export default Login;
