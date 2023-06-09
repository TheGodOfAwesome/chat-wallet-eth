import dynamic from "next/dynamic";
import { Suspense } from "react";

const Create = () => {
    const ProfileDynamic = dynamic(
        () => import("../components/create").then((res) => res.default),
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

export default Create;