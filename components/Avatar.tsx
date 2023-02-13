import { botttsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";

type Props = {
  data: {
    avatarSeed?: string | null;
    nickname: string;
    [key: string]: any;
  };
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
