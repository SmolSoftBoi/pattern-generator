#!/usr/bin/env bash

# CI helper validation
#
# This script is invoked by GitHub Actions workflows to validate that expected helper scripts
# exist and are both syntactically valid and runnable.

set -euo pipefail

validate_ci_helper() {
  local helper_path="$1"
  local helper_label="$2" # e.g. "CI helper script" | "optional CI helper script"

  # The script is invoked with `node`, so it does not need to be executable,
  # but it SHOULD be syntactically valid and runnable.
  if ! node --check "$helper_path"; then
    # NOTE: %0A encodes newlines for GitHub Actions error annotations; this formatting is intentional.
    echo "::error title=CI helper script syntax error::The ${helper_label} at ${helper_path} failed JavaScript syntax validation (node --check).%0AThis step validates syntax as a prerequisite; because syntax validation failed, the runtime self-test step will not be run."
    exit 1
  fi

  # Deterministic runtime validation: ensure the script can load and parse package.json.
  if ! node "$helper_path" --self-test >/dev/null; then
    # NOTE: %0A encodes newlines for GitHub Actions error annotations; this formatting is intentional.
    echo "::error title=Broken CI helper script::The ${helper_label} at ${helper_path} failed its runtime self-test.%0AThis usually means it threw an error while running, or it could not read/parse package.json."
    exit 1
  fi
}

if [[ ! -f .github/scripts/has-package-script.js ]]; then
  # NOTE: %0A encodes newlines for GitHub Actions error annotations; this formatting is intentional.
  echo "::error title=Missing CI helper script::Expected .github/scripts/has-package-script.js to exist in the repository.%0ACI uses this script to detect whether package.json scripts (for example, typecheck or test) are present.%0ACreate .github/scripts/has-package-script.js so that it accepts a package.json script name as its first argument.%0AFor example: 'node .github/scripts/has-package-script.js typecheck'.%0AThe script must exit with status 0 when the given script exists and with a non-zero status otherwise, then be committed to the repository."
  exit 1
fi

validate_ci_helper ".github/scripts/has-package-script.js" "CI helper script"

# If present, also validate the optional Yarn Berry detector.
if [[ -f .github/scripts/is-yarn-berry.js ]]; then
  validate_ci_helper ".github/scripts/is-yarn-berry.js" "optional CI helper script"
fi
