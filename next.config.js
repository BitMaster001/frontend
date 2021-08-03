const { i18n } = require('./next-i18next.config');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules')(['@amcharts/amcharts4/']);
const withMDX = require('@next/mdx')({
  extension: /\.mdx$/,
});

module.exports = withMDX(
  withPWA(
    withTM({
      pwa: {
        dest: 'public',
        sw: 'service-worker.js',
        publicExcludes: [
          '!locales',
          '!unused-locales',
          '!og',
          '!illustrations',
          '!svg',
        ],
      },
      pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
      webpack: (config) => {
        config.module.rules.push({
          test: /\.md$/,
          use: 'frontmatter-markdown-loader',
        });

        config.module.rules.push({
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        });

        config.module.rules.unshift({
          test: /pdf\.worker\.(min\.)?js/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[contenthash].[ext]',
                publicPath: '_next/static/worker',
                outputPath: 'static/worker',
              },
            },
          ],
        });

        return config;
      },

      i18n,

      async redirects() {
        return [
          {
            source: '/get-started/eth',
            destination: '/get-started/eth/GPU',
            permanent: true,
          },
          {
            source: '/get-started/xch',
            destination: '/get-started',
            permanent: true,
          },
          // Old Redirects from CRA app
          // {
          //   source: '/:lang/blocks',
          //   destination: '/:lang/blocks',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/miners',
          //   destination: '/:lang/miners',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/docs/api',
          //   destination: '/:lang/docs/api',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/docs/help',
          //   destination: '/:lang/get-started',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/docs/getting-started',
          //   destination: '/:lang/get-started',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/docs/nicehash-guide',
          //   destination: '/:lang/get-started/eth/nicehash',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/efficiency-and-shares',
          //   destination: '/:lang/get-started/eth/nicehash',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/contact',
          //   destination: '/:lang/support',
          //   permanent: true,
          // },
          // {
          //   source: '/:lang/opendata',
          //   destination: '/:lang/open-data-reports',
          //   permanent: true,
          // },
        ];
      },
    })
  )
);
