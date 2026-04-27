import { getRootAppUrl } from "@/api/spotify/utils";
import StyledComponentsRegistry from "@/lib/registry";
import { SerwistProvider } from "@/lib/serwist-provider";
import { Metadata, Viewport } from "next";
import Script from "next/script";

const appleTouchIconUrl = `${getRootAppUrl()}/ipod/apple-touch-icon.png`;
const favicon32Url = `${getRootAppUrl()}/ipod/favicon-32x32.png`;
const favicon16Url = `${getRootAppUrl()}/ipod/favicon-16x16.png`;

export const metadata: Metadata = {
  title: "iPod.js",
  description: "An iPod Classic built for the web.",
  metadataBase: new URL(getRootAppUrl()),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iPod.js",
  },
  openGraph: {
    url: "http://tannerv.com/ipod",
    title: "iPod.js",
    description: "An iPod Classic built for the web.",
    type: "website",
    images: [
      {
        url: "https://user-images.githubusercontent.com/21055469/71636084-6081a800-2be0-11ea-98ee-9599a3396c84.png",
        width: 1200,
        height: 630,
        alt: "iPod.js",
      },
    ],
  },
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: appleTouchIconUrl,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: favicon32Url,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: favicon16Url,
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <SerwistProvider swUrl="/ipod/serwist/sw.js" options={{ scope: "/ipod" }}>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </SerwistProvider>
      </body>
      <Script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" />
    </html>
  );
}
