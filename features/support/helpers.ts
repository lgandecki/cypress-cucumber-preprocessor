import path from "path";
import { promises as fs } from "fs";

export async function writeFile(filePath: string, fileContent: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileContent);
}

export async function writeCypressConfig(tmpPath: string, additionalJsonConfig: string = "undefined") {
  await writeFile(
    path.join(tmpPath, "cypress.config.ts"),
    `import plugins from "./cypress/plugins/index";
    
export default {
  e2e: {
    specPattern: "**/*.feature",
    video: false,
    setupNodeEvents: plugins,
    ...(${additionalJsonConfig} || {})
  }
}
`);
  
}

