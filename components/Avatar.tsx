import { botttsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import type { User } from "@prisma/client";
import Image from "next/image";

type Props = {
  data: Partial<User> & Pick<User, "avatarSeed" | "nickname">;
  size?: number;
};

const Avatar = ({ data, size }: Props) => {
  const generateAvatar = () => {
    return createAvatar(botttsNeutral, {
      seed: data.avatarSeed ?? data.nickname,
      randomizeIds: true,
      radius: 50,
    }).toDataUriSync();
  };

  return (
    <Image
      src={generateAvatar()}
      height={size ?? 40}
      width={size ?? 40}
      alt="avatar"
    />
  );
};

export default Avatar;
