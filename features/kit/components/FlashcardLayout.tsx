import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const FlashcardLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:w-10/12 lg:w-2/3 gap-y-2 ">
      {children}
    </div>
  );
};

export default FlashcardLayout;
