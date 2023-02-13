import { createHash } from "node:crypto";

const hash = (val: string) => {
  return createHash("SHA512").update(val).digest("hex");
};

export default hash;
