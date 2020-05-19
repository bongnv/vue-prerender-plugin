const { createBundleRenderer } = require('vue-server-renderer');
const path = require("path");
const fs = require("fs").promises;

const pluginName = "VuePrerenderPlugin";

const isJS = (file) => { return /\.js(\?[^.]+)?$/.test(file); };

class VuePrerenderPlugin {
  constructor(options) {
    this.clientManifestFile = (options && options.clientManifestFile) || path.resolve(process.cwd(), "dist", "vue-ssr-client-manifest.json");
  }

  async renderPage(renderer, url) {
    const context = {
      url: url,
    };

    return await renderer.renderToString(context);
  }

  async apply(compiler) {
    const clientManifest = JSON.parse(await fs.readFile(this.clientManifestFile, 'utf-8'));
    const template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
    const createRenderer = (serverBundle) => createBundleRenderer(serverBundle, {
      clientManifest,
      runInNewContext: false,
      template,
    });

    compiler.hooks.emit.tapPromise(pluginName, async (compilation) => {
      const stats = compilation.getStats().toJson();
      const entryName = Object.keys(stats.entrypoints)[0];
      const entryInfo = stats.entrypoints[entryName];
      if (!entryInfo) {
        return cb()
      }

      const entryAssets = entryInfo.assets.filter(isJS);
      if (entryAssets.length > 1) {
        throw new Error(
          "Server-side bundle should have one single entry file. " +
          "Avoid using CommonsChunkPlugin in the server config."
        )
      }

      const entry = entryAssets[0];
      if (!entry || typeof entry !== 'string') {
        throw new Error(
          ("Entry \"" + entryName + "\" not found. Did you specify the correct entry option?")
        )
      }

      const bundle = {
        entry: entry,
        files: {},
        maps: {}
      };

      stats.assets.forEach(function (asset) {
        if (isJS(asset.name)) {
          bundle.files[asset.name] = compilation.assets[asset.name].source();
        } else if (asset.name.match(/\.js\.map$/)) {
          bundle.maps[asset.name.replace(/\.map$/, '')] = JSON.parse(compilation.assets[asset.name].source());
        }
        // do not emit anything else for server
        delete compilation.assets[asset.name];
      });

      if (!bundle.files[bundle.entry]) {
        throw new Error(`${bundle.entry} is missing. Make sure vue-server-renderer/server-plugin is excluded`);
      }

      const renderer = createRenderer(bundle);
      const html = await this.renderPage(renderer, "/");

      compilation.assets["index.html"] = {
        source: () => html,
        size: () => html.length,
      };
    });
  }
}

module.exports = VuePrerenderPlugin;
