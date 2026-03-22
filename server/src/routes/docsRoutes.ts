import express from "express";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const router = express.Router();
type OpenApiObject = Record<string, unknown>;

function resolveDocsRootPath() {
  const distDocsPath = path.resolve(__dirname, "../docs");
  if (fs.existsSync(distDocsPath)) return distDocsPath;
  return path.resolve(process.cwd(), "src/docs");
}

function loadYaml(filePath: string): OpenApiObject {
  return YAML.load(filePath) as OpenApiObject;
}

function listYamlFiles(directoryPath: string): string[] {
  return fs
    .readdirSync(directoryPath)
    .filter((entry) => entry.endsWith(".yaml") || entry.endsWith(".yml"))
    .sort();
}

function mergeComponentSection(target: OpenApiObject, source: OpenApiObject, key: string) {
  const targetSection = (target[key] as OpenApiObject | undefined) ?? {};
  const sourceSection = (source[key] as OpenApiObject | undefined) ?? {};
  target[key] = { ...targetSection, ...sourceSection };
}

function buildSwaggerDocument(): OpenApiObject {
  const docsRootPath = resolveDocsRootPath();
  const baseDocument = loadYaml(path.join(docsRootPath, "swagger.yaml"));

  const mergedComponents: OpenApiObject = {
    ...(((baseDocument.components as OpenApiObject | undefined) ?? {}) as OpenApiObject),
  };
  const mergedPaths: OpenApiObject = {
    ...(((baseDocument.paths as OpenApiObject | undefined) ?? {}) as OpenApiObject),
  };

  const componentsPath = path.join(docsRootPath, "components");
  for (const componentFileName of listYamlFiles(componentsPath)) {
    const componentDocument = loadYaml(path.join(componentsPath, componentFileName));
    mergeComponentSection(mergedComponents, componentDocument, "schemas");
    mergeComponentSection(mergedComponents, componentDocument, "parameters");
    mergeComponentSection(mergedComponents, componentDocument, "securitySchemes");
    mergeComponentSection(mergedComponents, componentDocument, "responses");
    mergeComponentSection(mergedComponents, componentDocument, "requestBodies");
  }

  const pathsPath = path.join(docsRootPath, "paths");
  for (const pathFileName of listYamlFiles(pathsPath)) {
    const pathDocument = loadYaml(path.join(pathsPath, pathFileName));
    Object.assign(mergedPaths, pathDocument);
  }

  return {
    ...baseDocument,
    components: mergedComponents,
    paths: mergedPaths,
  };
}

const docsRootPath = resolveDocsRootPath();
const swaggerDocument = buildSwaggerDocument();
const swaggerUiHandler = swaggerUi.setup(swaggerDocument, {
  customJs: "/api/docs/assets/swagger-auth.js",
  swaggerOptions: {
    persistAuthorization: true,
  },
});

router.use("/assets", express.static(docsRootPath));
router.use("/", swaggerUi.serve);
router.get("/", swaggerUiHandler);

export default router;
