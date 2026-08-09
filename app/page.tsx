import { Suspense } from "react";
import { Ipod } from "@/components/Ipod";
import { getAppleDeveloperToken } from "@/utils/constants/api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const appleAccessToken = (await getAppleDeveloperToken()) ?? "";

  return (
    <Suspense>
      <Ipod appleAccessToken={appleAccessToken} />
    </Suspense>
  );
}
