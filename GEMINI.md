# GitHub Portfolio Manager (GEMINI.md)

## Purpose
This MCP server is designed to manage and showcase a collection of local engineering projects on GitHub, particularly helpful for building a personal developer portfolio.

## Usage for Agents
- Use `sync_all_projects` to scan the current workspace and ensure all project directories are initialized as Git repositories.
- Use `generate_profile_readme` to automatically create a professional README for the user's GitHub Profile, including links to their active projects and descriptions from `package.json`.

## Best Practices
- Ensure `gh` CLI is installed and authenticated for seamless synchronization.
- Recommend running `generate_profile_readme` whenever a new project is added to the portfolio.
