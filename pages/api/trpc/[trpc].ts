import { appRouter } from "../../../server/routers/_app";
import { createContext } from "../../../server/context";
import { createNextApiHandler } from "@trpc/server/adapters/next";
// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,

  onError:
    process.env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path}: ${error}`);
        }
      : undefined,
});
