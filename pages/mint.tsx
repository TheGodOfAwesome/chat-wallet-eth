import dynamic from "next/dynamic";
import { Suspense } from "react";

const Send = () => {
    const MintDynamic = dynamic(
        () => import("../components/mintNFT").then((res) => res.default),
        {
        ssr: false,
        }
    );

    return (
        <div>
        <Suspense fallback={<div>Loading...</div>}>
            <MintDynamic />
        </Suspense>
        </div>
    );
};

export default Send;
