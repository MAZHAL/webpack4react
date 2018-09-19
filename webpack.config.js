const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const extractTextWebpackPlugin = require('extract-text-webpack-plugin');//css打包
const extractCss = new extractTextWebpackPlugin('css/[name].[chunkhash:8].css');
const purifyCssPlugin = require('purifycss-webpack'); //css抽离
const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin'); //静态文件copy
const glob = require('glob');

/*const extractCss = new extractTextWebpackPlugin(
    {
        filename:  (getPath) => { //修改名字
            return getPath('css/[name].[chunkhash:8].css').replace('css/vendors', 'css/index');
        },
        // disable:true// 开发环境下为true 打包环境下false
    });*/
const webPath = {};
if(process.env.type == 'dev'){
    console.log(process.env.type);
    webPath.publicPath = "http://192.168.0.105:8080/"//配置文件的路径
} else {
    webPath.publicPath = "http://192.168.0.105:8080/" // 生产环境配置
}

const config = {
    mode:'development',

    entry:{
        app: './app/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'js/[name].[chunkhash:8].js',
        publicPath: webPath.publicPath
    },
    module: {
        rules: [//规则
            { // 打包css
                test: /\.css$/,
                use: extractCss.extract({// css分离
                    fallback: "style-loader",
                    use: [
                        {
                            loader:"css-loader",
                            options:{
                                importLoaders:1, // css-loader
                                minimize: true

                            }
                        },
                        {
                            loader:'postcss-loader'// 自动加前缀
                        }

                    ]
                })
            },
            {
                test: /\.less$/,
                use: extractCss.extract({  // 打包less 并从js中分离css
                    fallback: "style-loader",
                    use: ["css-loader","less-loader"]
                })
            },
            {
                test: /\.scss$/,
                use: extractCss.extract({  // 打包sass 并从js中分离css
                    fallback: "style-loader",
                    use: ["css-loader","sass-loader"]
                })
            },
            { // 打包图片
                test: /\.(gif|png|jpg|woff|svg|ttf|eot|jpeg)$/i,//图片的处理
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 500,//当图片小于这个值打包成bsae64 如果是一个大于的他会生成一个图片
                        outputPath: 'images',// 指定打包后的图片位置
                        name: '[name].[ext]?[hash]',//name:'[path][name].[ext]

                    }
                }]
            },
            { // 分离html中image
                test: /\.(htm|html)$/i,
                loader: 'html-withimg-loader'// 分离HTMLimg
            },
            {
                test:/\.(jsx|js)$/,
                use:[{
                    loader:'babel-loader',//转换es6 react
                }],
                exclude:/node_modules/ // 去掉node 模块
            }
        ]
    },
    /*optimization: {
        splitChunks: {
            chunks: 'async', // 按需加载
            minSize: 30000, // 当文件超过 30kb 开始打包
            maxSize: 0, //打包后的文件不能超过
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },*/

    /*
    * chunks: 表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
minSize: 表示在压缩前的最小模块大小，默认为0；
minChunks: 表示被引用次数，默认为1；
maxAsyncRequests: 最大的按需(异步)加载次数，默认为1；
maxInitialRequests: 最大的初始化加载次数，默认为1；
name: 拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
cacheGroups: 缓存组。
对于缓存组是一个对象，处了可以有上面的chunks、minSize、minChunks、maxAsyncRequests、maxInitialRequests、name外，还有其他的一些参数：
    * */
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            hidePathInfo:true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: "all",// 初始快
                    name:  "vendors", // 打包后的名字
                    maxSize: 3000000,
                    priority: -1, //优先级
                    minChunks: 1,
                    reuseExistingChunk: true, // 重用已有的模块
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },
        runtimeChunk: {
            name: "manifest"
        }
    },
    watchOptions: { // 热打包
        poll:1000,//1秒钟打包一次
        aggregateTimeout:500,//对多需要500打包一次
        ignored:/node_modules/// 不监控的模块监控
    },
    plugins: [
        new HtmlWebpackPlugin({
            minify:{
                removeAttributeQuotes:true,//去掉属性值后的双引号
            },
            hash:true,//去除缓存
            template:'./app/index.tmpl.html',//模板文件
            filename: path.resolve(__dirname, 'build/index.html')//磨板输出文件
        }),
        extractCss, //css 分离
        new purifyCssPlugin({
            paths:glob.sync(path.join('app/*.html')),//src 下所有的HTML没用的css就删除
         }),
        new webpack.BannerPlugin('mazha的开发.email:5345623132123'),// 版权声明
        new copyWebpackPlugin([
            {
                from:__dirname + '/app/static',//copy目录
                to:'./static'//copy到哪里
            }
        ]),
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'build'),// 项目根目录
        host: '192.168.0.101', // ip地址
        compress:true, // 服务器压缩
        open : true, // 自动打开服务器
        port:8080,
        inline:true,
    }

};
module.exports = config;