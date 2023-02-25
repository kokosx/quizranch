import type { GetServerSidePropsContext } from "next";
import { Education } from "../components/Education";
import Layout from "../components/layout";
import { isUserLoggedIn } from "../services/auth.service";

const Login = () => {
  return (
    <Layout nickname={null} title="Strona główna">
      <div className="flex flex-col items-center w-full h-full">
        <Education />
      </div>
    </Layout>
  );
};

export default Login;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const auth = await isUserLoggedIn(ctx.req);
  if (auth?.session) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
};
