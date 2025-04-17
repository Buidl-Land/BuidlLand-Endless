import type { NextPage } from "next";
import { Hash } from "viem";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";

// export const runtime = "edge";

type PageProps = {
  params: { txHash?: Hash };
};

export function generateStaticParams() {
  // A workaround to enable static exports in Next.js, generating a single dummy page.
  return [{ txHash: "0x0000000000000000000000000000000000000000" }];
}

const TransactionPage: NextPage<PageProps> = ({ params }: PageProps) => {
  const txHash = params?.txHash as Hash;

  if (isZeroAddress(txHash)) return null;

  // Simplified page version - only shows transaction hash and guides users to use local environment for full functionality
  return (
    <div className="flex flex-col gap-6 py-8 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl sm:text-2xl mb-4">Transaction Details</h2>
          <p className="mb-4">
            Transaction Hash: <code className="bg-base-300 px-1 py-0.5 rounded break-all">{txHash}</code>
          </p>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Limited Interface in Cloud Deployment</h3>
              <div className="text-sm">
                This is a simplified view of the transaction details. The complete interactive UI with transaction
                decoding, event logs, and method analysis is only available when running the application locally in
                development mode.
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold">
              You can still use a block explorer to view detailed information about this transaction:
            </p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary mt-2"
            >
              View on Etherscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
