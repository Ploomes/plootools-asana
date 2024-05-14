const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { readdir } = require("fs/promises");

const static = async ()=> {
  const baseDir = path.resolve(__dirname, 'src', 'static');
  const files = await readdir(baseDir);
  const entry = {};
  for(const file of files) {
    const base = file.replace(/\.(ts|js)$/, '');
    entry[base] = path.resolve(baseDir, file);
  }
  return entry;
}

module.exports = async ()=> {
  function getHtmlPlugins(chunks) {
    return chunks.map(
      (chunk) =>
      new HTMLPlugin({
        title: "React extension",
        template: path.resolve(__dirname, 'public', `${chunk}.html`),
        filename: `../${chunk}.html`,
        chunks: [`${chunk}`],
      })
    );
  }
  const staticFiles = await static();
  return {
    entry: {
      index: "./src/index.tsx",
      ...staticFiles
    },
    output: {
      path: path.join(__dirname, "dist/js"),
      filename: "[name].js",
      clean: true
    },
    mode: "production",
    module: {
      rules: [{
          test: /\.(ts|tsx)$/,
          use: [{
            loader: "ts-loader",
            options: {
              compilerOptions: {
                noEmit: false
              },
            }
          }],
          exclude: /node_modules/,
        },
        {
          test: /\.(?:js|mjs|cjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: "defaults"
                }]
              ]
            }
          }
        },
        {
          exclude: /node_modules/,
          test: /\.css$/i,
          use: [
            "style-loader",
            "css-loader"
          ]
        }
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: "manifest.json",
            to: "../manifest.json"
          },
          {
            from: "./public/*.png",
            to: "../[name].png"
          }
        ],
      }),
      ...getHtmlPlugins(["index"]),
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        "@components": path.resolve(__dirname, 'src', 'components'),
        "@styles": path.resolve(__dirname, 'src', 'styles'),
      }
    }
  };
}