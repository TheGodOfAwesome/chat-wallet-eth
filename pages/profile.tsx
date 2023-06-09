import dynamic from "next/dynamic";
import { Suspense } from "react";

const Profile = () => {
    const ProfileDynamic = dynamic(
        () => import("../components/profile").then((res) => res.default),
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

export default Profile;
