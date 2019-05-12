const path = require('path')

module.exports = {
   entry: path.join(__dirname, 'src/js', 'index.js'), // Our frontend will be inside the src folder
   mode: process.env.NODE_ENV || 'development',
   output: {
      path: path.join(__dirname, 'dist'),
      filename: 'build.js' // The final file will be created in dist/build.js
   },

   devServer: {
     contentBase: path.resolve(__dirname, "dist"),
     port: 8080,
   },

   module: {
      rules: [{
         test: /\.css$/, // To load the css in react
         loader: 'style-loader!css-loader',
         include: /src/
      }, {
         test: /\.jsx?$/, // To load the js and jsx files
         loader: 'babel-loader',
         exclude: /node_modules/,
         query: {
            presets: ['es2015', 'react', 'stage-2']
         }
      }]
   }
}
