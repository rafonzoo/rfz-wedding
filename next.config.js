/* eslint-disable @typescript-eslint/no-var-requires */
const NextIntl = require('next-intl/plugin')
const BundleAnalyzer = require('@next/bundle-analyzer')
const withNextIntl = NextIntl('./locale/i18n.ts')
const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

module.exports = withBundleAnalyzer(withNextIntl(nextConfig))
