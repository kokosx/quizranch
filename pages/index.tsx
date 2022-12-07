import { GetServerSidePropsContext } from "next";
import Layout from "../components/layout";
import { isUserLoggedIn } from "../services/auth.service";
import { withPageAuth, withPageAuthSession } from "../utils/ssr";

const Login = () => {
  return (
    <Layout>
      <p>Hello!</p>
    </Layout>
  );
};

export default Login;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await isUserLoggedIn(ctx.req);
  if (session) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
};
