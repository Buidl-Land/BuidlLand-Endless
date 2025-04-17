import { isZeroAddress } from "~~/utils/scaffold-eth/common";

// export const runtime = "edge";

type PageProps = {
  params: { address: string };
};

export function generateStaticParams() {
  // A workaround to enable static exports in Next.js, generating a single dummy page.
  return [{ address: "0x0000000000000000000000000000000000000000" }];
}

const AddressPage = async ({ params }: PageProps) => {
  const address = params?.address as string;

  if (isZeroAddress(address)) return null;

  // Simplified page version - only shows address and guides users to use local environment for full functionality
  return (
    <div className="flex flex-col gap-6 py-8 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
      <div className="shadow-xl card bg-base-100">
        <div className="card-body">
          <h2 className="mb-4 text-xl card-title sm:text-2xl">Contract Address Information</h2>
          <p className="mb-4">
            Address: <code className="bg-base-300 px-1 py-0.5 rounded">{address}</code>
          </p>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current shrink-0"
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
                This is a simplified view of the contract address details. The complete interactive UI with bytecode
                analysis, contract verification, and assembly details is only available when running the application
                locally in development mode.
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="font-semibold">
              You can still use a block explorer to view more information about this address:
            </p>
            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 btn btn-sm btn-primary"
            >
              View on Etherscan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
