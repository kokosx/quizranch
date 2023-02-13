import { botttsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";

type Props = {
  data: {
    avatarSeed: string | null;
    nickname: string;
    [key: string]: any;
  };
};

const Avatar = ({ data }: Props) => {
  const generateAvatar = () => {
    return createAvatar(botttsNeutral, {
      seed: data.avatarSeed ?? data.nickname,
      randomizeIds: true,
      radius: 50,
    }).toDataUriSync();
  };

  return <Image src={generateAvatar()} height={40} width={40} alt="avatar" />;
};

export default Avatar;
