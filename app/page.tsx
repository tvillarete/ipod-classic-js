import { Ipod } from "components/Ipod";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const appleAccessToken = process.env.APPLE_DEVELOPER_TOKEN ?? "";

  const spotifyCode = searchParams.code;

  return (
    <Ipod
      spotifyCallbackCode={spotifyCode}
      appleAccessToken={appleAccessToken}
    />
  );
}
