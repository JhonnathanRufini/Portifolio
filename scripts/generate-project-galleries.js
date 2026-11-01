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
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

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

async function main() {
  const galleries = {};
  for (const project of projects) {
    galleries[project] = await listProjectImages(project);
  }

  const manifest = JSON.stringify(galleries, null, 2).replace(/</g, "\\u003c");
  await fs.writeFile(
    galleryFile,
    `window.PROJECT_GALLERIES = ${manifest};\n`,
    "utf8"
  );
  console.log(`Galerias atualizadas para ${projects.length} projetos: ${galleryFile}`);
}

main().catch((error) => {
  console.error("Não foi possível gerar as galerias dos projetos:", error);
  process.exitCode = 1;
});
