import React, { ReactNode } from 'react';
import signature from './../assets/images/signature.svg';

interface SignatureProps extends React.HTMLAttributes<HTMLDivElement> {
  signatureTitle: ReactNode;
  p?: ReactNode;
}

export const Signature = ({ signatureTitle, p, className }: SignatureProps) => {
  return (
    <div className={`flex-1 flex flex-col gap-4 ${className}`}>
      {signatureTitle}
      {p}

      <div className="border-2 border-dashed rounded flex justify-center items-center p-4 mt-auto">
        <img src={signature} alt="signature" className="w-20 h-20" />
      </div>
    </div>
  );
};
