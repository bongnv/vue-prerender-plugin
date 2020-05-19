const webpack = require("webpack");
const clientConfig = require('./webpack.client.config');
const serverConfig = require('./webpack.server.config');

webpack(clientConfig, (err, stats) => {
  if (err) {
    console.error("Failed to build:", err);
    return;
  }
  if (stats.hasErrors()) {
    stats.toJson().errors.forEach(err => {
      console.error(err)
    })
    return
  }
  if (stats.hasWarnings()) {
    stats.toJson().warnings.forEach(warning => {
      console.warn(warning)
    })
  }

  console.log("Build client done!")

  webpack(serverConfig, (err, stats) => {
    if (err) {
      console.error("Failed to build:", err);
      return;
    }
    if (stats.hasErrors()) {
      stats.toJson().errors.forEach(err => {
        console.error(err)
      })
      return
    }
    if (stats.hasWarnings()) {
      stats.toJson().warnings.forEach(warning => {
        console.warn(warning)
      })
    }

    console.log("Build server done!")
  })
})
