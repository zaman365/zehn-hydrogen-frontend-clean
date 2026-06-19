# Temporary Utilities

This folder contains temporary scripts and utilities created for debugging and testing.

## Scripts

### tmp_rovodev_test_overrides.sh
**Purpose:** Test npm overrides for security vulnerabilities

**Description:** Safely tests if applying npm overrides to fix security vulnerabilities will break the build. Creates backups, applies overrides, tests the build, and allows rollback.

**Usage:**
```bash
./tmp_rovodev_test_overrides.sh
```

**Requirements:**
- npm installed
- Node.js installed
- Run from project root directory

**What it does:**
1. Creates backup of package.json and package-lock.json
2. Adds npm overrides for vulnerable packages
3. Reinstalls dependencies
4. Runs npm audit
5. Tests: typecheck, lint, build
6. Asks if you want to keep changes
7. Rolls back if declined

**Safe to run:** Yes - creates backup before any changes

---

## Cleanup

All files in this folder can be safely deleted after use. They are temporary utilities created for specific troubleshooting tasks.

To clean up:
```bash
rm -rf temp_utilities/
```
