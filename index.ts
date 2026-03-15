import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const PROJECTS_ROOT = "C:\\gemini_project";

const server = new Server(
  {
    name: "github-portfolio-manager",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function runCommand(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, shell: true });
    let out = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (out += d));
    proc.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(out))));
  });
}

// Register tools using the high-level API
server.tool(
  "sync_all_projects",
  "Scans the workspace and prepares git synchronization for all active projects.",
  {},
  async () => {
    const dirs = fs.readdirSync(PROJECTS_ROOT).filter((f) => fs.statSync(path.join(PROJECTS_ROOT, f)).isDirectory());
    const results: string[] = [];

    for (const dir of dirs) {
      if (dir.startsWith(".") || dir === "node_modules") continue;
      const dirPath = path.join(PROJECTS_ROOT, dir);

      if (!fs.existsSync(path.join(dirPath, ".git"))) {
        results.push(`Project '${dir}': Git not initialized. Initializing...`);
        try {
          await runCommand("git", ["init"], dirPath);
          await runCommand("git", ["add", "."], dirPath);
          await runCommand("git", ["commit", "-m", "Initial portfolio commit"], dirPath);
        } catch (e) {
          results.push(`Error initializing '${dir}': ${(e as Error).message}`);
        }
      } else {
        results.push(`Project '${dir}': Git repository detected and ready for sync.`);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Scan Results:\n${results.join("\n")}\n\nNote: Please ensure the GitHub CLI (gh) is authenticated to perform actual pushes.`,
        },
      ],
    };
  }
);

server.tool(
  "generate_profile_readme",
  "Generates a professional GitHub Profile README based on local project metadata.",
  {
    github_username: z.string().describe("The user's GitHub username"),
    name: z.string().describe("The user's full name"),
    bio: z.string().optional().describe("A brief bio for the profile"),
  },
  async ({ github_username, name: fullName, bio }) => {
    const dirs = fs.readdirSync(PROJECTS_ROOT).filter((f) => fs.statSync(path.join(PROJECTS_ROOT, f)).isDirectory());

    let readme = `# Hi there, I'm ${fullName} 👋\n\n`;
    if (bio) readme += `${bio}\n\n`;

    readme += `## 🚀 Active Projects\n\n`;

    for (const dir of dirs) {
      if (dir.startsWith(".") || dir === "node_modules" || dir === "github-portfolio-manager") continue;
      readme += `### [${dir}](https://github.com/${github_username}/${dir})\n`;

      const pkgPath = path.join(PROJECTS_ROOT, dir, "package.json");
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
          if (pkg.description) readme += `> ${pkg.description}\n`;
        } catch {}
      }
      readme += `\n`;
    }

    readme += `\n---\n*This README was automatically managed by my custom GitHub Portfolio Manager MCP.*`;

    const outputPath = path.join(PROJECTS_ROOT, "PROFILE_README_PREVIEW.md");
    fs.writeFileSync(outputPath, readme);

    return {
      content: [
        {
          type: "text",
          text: `GitHub Profile README generated at: ${outputPath}\n\nYou can use this content in your '${github_username}/${github_username}' repository to create a homepage.`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});
