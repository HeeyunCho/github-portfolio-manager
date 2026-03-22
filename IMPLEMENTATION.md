# IMPLEMENTATION: GitHub Portfolio Manager

## Overview
A portfolio management tool that automates project synchronization and profile generation by scanning the local file system.

## Tools (Methods)

### 1. `sync_all_projects`
**Description**: Scans `C:\gemini_project` for directories and initializes Git if not already present.
- **Returns**: A status report of projects scanned and actions taken.
- **Actions**: Performs `git init`, `git add .`, and `git commit` for new projects.

### 2. `generate_profile_readme`
**Description**: Generates a GitHub Profile README (`PROFILE_README_PREVIEW.md`).
- **Parameters**:
  - `github_username` (string): User's GitHub handle.
  - `name` (string): User's full name.
  - `bio` (string, optional): A brief bio.
- **Returns**: The path to the generated preview file.
- **Logic**: Iterates through projects and extracts descriptions from `package.json`.

## Environment
- **Root Directory**: `C:\gemini_project`.
- **Exclusions**: Directories starting with `.` or named `node_modules` or `github-portfolio-manager`.
