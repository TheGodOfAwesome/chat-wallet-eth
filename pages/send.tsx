import dynamic from "next/dynamic";
import { Suspense } from "react";

const Send = () => {
    const ProfileDynamic = dynamic(
        () => import("../components/send").then((res) => res.default),
        {
        ssr: false,
        }
    );

    return (
        <div>
        <Suspense fallback={<div>Loading...</div>}>
            <ProfileDynamic />
        </Suspense>
        </div>
    );
};

export default Send;
