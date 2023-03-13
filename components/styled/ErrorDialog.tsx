import { type ReactNode, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: any;
  children: ReactNode;
};

const ErrorDialog = ({ isOpen, onClose, children }: Props) => {
  useEffect(() => {
    const id = setTimeout(() => {
      onClose();
    }, 4000);
    return () => {
      clearTimeout(id);
    };
  }, [onClose]);

  return isOpen ? (
    <div className="toast toast-end ">
      <div className="shadow-lg alert alert-error">
        <div className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 cursor-pointer stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{children}</span>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default ErrorDialog;
