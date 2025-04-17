import { DiamondContractUI } from "../_components/contract/DiamondContractUI";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Debug Diamond Contract",
  description: "Debug your deployed Diamond contract and its facets in an easy way",
});

const DiamondDebug: NextPage = () => {
  return (
    <div className="pt-16 lg:pt-24">
      <DiamondContractUI />
      <div className="text-center mt-12 lg:mt-16 bg-secondary p-10">
        <h1 className="text-4xl my-0">Debug Diamond Contract</h1>
        <p className="text-neutral">
          You can debug & interact with your Diamond contract and its facets here.
          <br /> This page directly interacts with the Diamond contract at address{" "}
          <code className="italic bg-base-300 text-base font-bold px-1">
            0x137a3df6ab7aba0fa17bb80ee010f4fb01ee6485
          </code>{" "}
        </p>
      </div>
    </div>
  );
};

export default DiamondDebug; 