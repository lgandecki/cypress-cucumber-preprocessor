import { After, Before, formatterHelpers } from "@cucumber/cucumber";
import path from "path";
import assert from "assert";
import { promises as fs } from "fs";
import { writeFile, writeCypressConfig } from "./helpers";

const projectPath = path.join(__dirname, "..", "..");

Before(async function ({ gherkinDocument, pickle }) {
  assert(gherkinDocument.uri, "Expected gherkinDocument.uri to be present");

  const relativeUri = path.relative(process.cwd(), gherkinDocument.uri);

  const { line } = formatterHelpers.PickleParser.getPickleLocation({
    gherkinDocument,
    pickle,
  });

  this.tmpDir = path.join(projectPath, "tmp", `${relativeUri}_${line}`);

  await fs.rm(this.tmpDir, { recursive: true, force: true });

  // create a default support file so that cypress doesn't fail
  // cf. https://on.cypress.io/support-file-missing-or-invalid
  await writeFile(path.join(this.tmpDir, "cypress/support/e2e.ts"), "");

  await writeCypressConfig(this.tmpDir);

  await fs.mkdir(path.join(this.tmpDir, "node_modules", "@badeball"), {
    recursive: true,
  });

  await fs.symlink(
    projectPath,
    path.join(
      this.tmpDir,
      "node_modules",
      "@badeball",
      "cypress-cucumber-preprocessor"
    ),
    "dir"
  );
});

Before({ tags: "not @no-default-plugin" }, async function () {
  await writeFile(
    path.join(this.tmpDir, "cypress", "plugins", "index.js"),
    `
      const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
      const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
      const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");

      module.exports = async (on, config) => {
        await addCucumberPreprocessorPlugin(on, config);

        on(
          "file:preprocessor",
          createBundler({
            plugins: [createEsbuildPlugin(config)]
          })
        );

        return config;
      }
    `
  );
});

After(function () {
  if (
    this.lastRun != null &&
    this.lastRun.exitCode !== 0 &&
    !this.verifiedLastRunError
  ) {
    throw new Error(
      `Last run errored unexpectedly. Output:\n\n${this.lastRun.output}`
    );
  }
});
