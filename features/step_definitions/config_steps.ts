import { Given } from "@cucumber/cucumber";
import path from "path";
import { promises as fs } from "fs";
import { writeCypressConfig } from "../support/helpers";

async function addOrUpdateConfiguration(
  absoluteConfigPath: string,
  additionalJsonContent: string
) {
  let existingConfig: any;

  try {
    existingConfig = JSON.parse(
      (await fs.readFile(absoluteConfigPath)).toString()
    );
  } catch (e: any) {
    if (e.code === "ENOENT") {
      existingConfig = {};
    } else {
      throw e;
    }
  }

  await fs.writeFile(
    absoluteConfigPath,
    JSON.stringify(
      {
        ...existingConfig,
        ...JSON.parse(additionalJsonContent),
      },
      null,
      2
    )
  );
}

Given("additional preprocessor configuration", async function (jsonContent) {
  const absoluteConfigPath = path.join(
    this.tmpDir,
    ".cypress-cucumber-preprocessorrc"
  );

  await addOrUpdateConfiguration(absoluteConfigPath, jsonContent);
});

Given("additional Cypress configuration", async function (jsonContent) {
  await writeCypressConfig(this.tmpDir, jsonContent);
});
