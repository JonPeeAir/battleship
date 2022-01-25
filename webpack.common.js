const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "main.[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        assetModuleFilename: "assets/[name].[hash][ext][query]",
        clean: true,
    },
    module: {
        rules: [
            {
                // Style loader
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },

            {
                // Asset loader
                test: /\.(svg|png|jpg|gif)$/i,
                type: "asset/resource",
            },

            {
                // Html loader
                test: /\.html$/i,
                use: ["html-loader"],
            },

            {
                // Babel loader
                test: /\.m?js$/i,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/template.html",
            filename: "index.html",
        }),
    ],
};
