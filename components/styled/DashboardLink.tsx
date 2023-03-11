import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;

  children?: ReactNode;
  isFavorite?: boolean;
};

const DashboardLink = ({ children, href, isFavorite }: Props) => {
  return (
    <Link
      className="flex items-center justify-center w-full md:w-72 lg:w-96 h-24 md:h-40 bg-base-100 rounded-md border-[3px] border-secondary relative text-xl hover:bg-base-300 duration-150 hover:scale-105 active:scale-95 "
      href={href}
    >
      {isFavorite && (
        <div className="absolute top-0 right-0 mt-2 mr-2 heart-icon-on"></div>
      )}
      {children}
    </Link>
  );
};

export default DashboardLink;
