import type { AppProps, AppType } from "next/app";
import "../styles/globals.css";

import { trpc } from "./../utils/trpc";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};
export default trpc.withTRPC(MyApp);
