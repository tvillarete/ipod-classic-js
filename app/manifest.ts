import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "iPod.js",
    short_name: "iPod.js",
    description: "An iPod Classic built for the web.",
    start_url: "/ipod",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#000000",
    background_color: "#000000",
    icons: [
      {
        src: "/ipod/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/ipod/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/ipod/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/ipod/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
