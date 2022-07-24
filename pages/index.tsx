import { memo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styled from 'styled-components';
import { SettingsProvider } from 'hooks';
import Script from 'next/script';
import { Ipod } from 'components/Ipod';

const Main = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="An iPod Classic built for the web." />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:title" content="iPod.js" />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Ever miss that music player you used to carry around everywhere? Here's a close second – an iPod built for the web."
        />
        <meta
          property="og:image"
          content="https://user-images.githubusercontent.com/21055469/71636084-6081a800-2be0-11ea-98ee-9599a3396c84.png"
        />
        <meta property="og:url" content="http://tannerv.com/ipod" />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="favicon-16x16.png"
        />
        <link rel="manifest" href="site.webmanifest" />
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5" />

        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        <title>iPod.js</title>
      </Head>
      <Main>
        <SettingsProvider>
          <Ipod />
        </SettingsProvider>
      </Main>
      <Script src="https://sdk.scdn.co/spotify-player.js" />
    </>
  );
};

export default memo(Home);
