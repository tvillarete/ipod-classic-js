import { Ipod } from "components/Ipod";
import { APPLE_DEVELOPER_TOKEN } from "./utils/constants/api";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const appleAccessToken = APPLE_DEVELOPER_TOKEN ?? "";

  const spotifyCode = searchParams.code;

  return (
    <Ipod
      spotifyCallbackCode={spotifyCode}
      appleAccessToken={appleAccessToken}
    />
  );
}
