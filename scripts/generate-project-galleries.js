const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const projectsDirectory = path.join(root, "assets", "projects");
const galleryFile = path.join(projectsDirectory, "project-galleries.js");
const projects = [
  "orion",
  "shecard",
  "laia",
  "ptw",
  "programa-ideias",
];
const manualProjects = ["orion", "shecard"];
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const manualExtension = ".pdf";

async function listProjectImages(project) {
  const directory = path.join(projectsDirectory, project);
  await fs.mkdir(directory, { recursive: true });

  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "pt-BR", { numeric: true }))
    .map((filename) => `assets/projects/${project}/${encodeURIComponent(filename)}`);
}

async function findProjectManual(project) {
  const directory = path.join(root, "docs", project);
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }

  const manuals = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === manualExtension)
    .map((entry) => entry.name);
  if (manuals.length === 0) return undefined;

  const standardManual = manuals.find((filename) => filename.toLowerCase() === "manual.pdf");
  if (!standardManual && manuals.length > 1) {
    throw new Error(`Mais de um manual PDF encontrado em docs/${project}; mantenha apenas um ou use o nome manual.pdf.`);
  }

  const filename = standardManual || manuals[0];
  return `docs/${project}/${encodeURIComponent(filename)}`;
}

async function main() {
  const galleries = {};
  for (const project of projects) {
    galleries[project] = await listProjectImages(project);
  }

  const manuals = {};
  for (const project of manualProjects) {
    const manual = await findProjectManual(project);
    if (manual) manuals[project] = manual;
  }

  const manifest = JSON.stringify(galleries, null, 2).replace(/</g, "\\u003c");
  const manualManifest = JSON.stringify(manuals, null, 2).replace(/</g, "\\u003c");
  await fs.writeFile(
    galleryFile,
    `window.PROJECT_GALLERIES = ${manifest};\nwindow.PROJECT_MANUALS = ${manualManifest};\n`,
    "utf8"
  );
  console.log(`Galerias atualizadas para ${projects.length} projetos: ${galleryFile}`);
}

main().catch((error) => {
  console.error("Não foi possível gerar as galerias dos projetos:", error);
  process.exitCode = 1;
});
