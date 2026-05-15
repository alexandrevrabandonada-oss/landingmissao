import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanDirs = ["app", "src", "content"];
const extensions = new Set([".ts", ".tsx", ".md", ".json", ".mjs"]);

const patterns = [
  { label: "Alexandre Fonseca", regex: /Alexandre Fonseca/ },
  { label: "vote", regex: /\bvote\b/i },
  { label: "Vote", regex: /\bVote\b/ },
  { label: "eleja", regex: /\beleja\b/i },
  { label: "número eleitoral", regex: /n[úu]mero eleitoral/i },
  { label: "urna", regex: /\burna\b/i },
  {
    label: "campanha sem pré-campanha",
    regex: /\bcampanha\b/i,
    filter: (line) => !/pré-campanha|pre-campanha/i.test(line),
  },
];

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(resolved));
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(resolved);
    }
  }

  return files;
}

let warnings = 0;

for (const dir of scanDirs) {
  for (const file of walk(path.join(root, dir))) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        if (!pattern.regex.test(line)) {
          continue;
        }

        if (pattern.filter && !pattern.filter(line)) {
          continue;
        }

        warnings += 1;
        console.log(
          `WARNING ${path.relative(root, file)}:${index + 1} - ${pattern.label}: ${line.trim()}`,
        );
      }
    });
  }
}

if (!warnings) {
  console.log("OK: nenhuma inconsistência de identidade encontrada.");
}
