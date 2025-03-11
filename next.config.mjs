/** @type {import('next').NextConfig} */

export default {
  i18n: {
    locales: ['en', 'pt-BR'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media4.giphy.com',
        pathname: '/media/**',
        port: ''
      }
    ]
  },
  trailingSlash: false,
  reactStrictMode: true,
}


