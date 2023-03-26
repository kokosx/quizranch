import { TRPCClientError } from "@trpc/client";
import { KitRouter } from "../server/routers/kits/kits.router";

const zodStringToJSX = (_message: string) => {
  //TODO: add types
  const message = JSON.parse(_message);
  return message.map((el: any, i: number) => {
    return (
      <p key={i}>
        {i + 1}: {el.message}
      </p>
    );
  });
};

export const serializeKitRouterError = (e: TRPCClientError<KitRouter>) => {
  if (e.data?.code === "BAD_REQUEST") {
    return zodStringToJSX(e.message);
  }
  if (e.data?.code === "FORBIDDEN" || e.data?.code === "UNAUTHORIZED") {
    return "Authorization issue";
  }
  return e.message;
};
