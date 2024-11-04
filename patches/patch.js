/**
 * Even the simplest shell script fails in Windows, hence this file.
 *
 * The intention here is to only run `patch-package` during local installation, IE. during
 * development of the library and not upon installation by the users of the library.
 */
const fs = require('fs');
const path = require('path');

const isInstallingAsDependency = fs.existsSync(path.join(process.cwd(), 'package.json')) &&
  !fs.existsSync(path.join(process.cwd(), 'src'));

if (!isInstallingAsDependency) {
  require('patch-package');
}