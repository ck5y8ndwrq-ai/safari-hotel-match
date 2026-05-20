'use strict';

console.log("[pnpmfile] loaded, processing packages...");

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'pdfjs-dist' && pkg.optionalDependencies) {
        console.log("[pnpmfile] removing canvas from", pkg.name);
        delete pkg.optionalDependencies.canvas;
      }
      return pkg;
    },
  },
};
