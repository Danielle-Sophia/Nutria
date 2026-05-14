The Netlify deploy errored, with the following guidance provided:

Diagnosis
- Relevant log lines: the build completed but Netlify could not find the expected publish directory: [line 76](#L76) and [line 78](#L78) show the build step finished, while the deployment error is at [line 89](#L89) and Netlify's resolved config shows it was looking for /opt/build/repo/dist at [line 95](#L95). The deploy failure is reported at [line 97](#L97).
- Error type and cause: Netlify's publish directory is configured as dist but your build did not produce a dist folder (so Deploy directory 'dist' does not exist). This is a configuration mismatch between the build output and the Netlify publish path.

Solution
1. Verify what your build actually outputs
   - Open your package.json to see the build script: https://github.com/Danielle-Sophia/Nutria/blob/main/package.json
   - Run locally to confirm the output folder:
     - npm run build
     - Check which folder is created (e.g., dist, build, public, out): ls -la

2. Fix one of these ways (pick the one that matches your project):
   - If your build creates a different folder (for example build or out), update Netlify to publish that folder:
     - In the Netlify UI: Site settings → Build & deploy → Continuous Deployment → Build settings → Publish directory — set it to the actual output folder (for example "build" or "out").
     - Or add/update netlify.toml at repo root (example if your build outputs to build):
```toml
[build]
  command = "npm run build"
  publish = "build"
```
   - If you want Netlify to use dist but your build currently outputs somewhere else, change your build config so it outputs to dist. Example approaches:
     - Vite: set build.outDir = "dist" in vite.config.js.
     - Next.js static export: run npm run build && npm run export to produce an "out" folder (or adjust scripts/config to output to dist if you prefer).
     - Modify your package.json build script to create/emit files into dist.

3. Re-run the deploy
   - Commit the change (either netlify.toml or updated build config), push, and trigger a new deploy.

Notes and checks
- If you change Netlify's publish dir to a folder name, first verify that the folder is indeed produced by your build (run npm run build locally). Do not point Netlify at a directory that never gets created.
- If after adjusting publish dir you still see failures, inspect the build logs again to confirm the build command completes successfully (no non-zero exit). If you encounter a Node version mismatch, follow Netlify documentation for changing Node versions: https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript

The relevant error logs are:

Line 0: build-image version: 8c9b1115cf47daa4d19510cfee34034469213d7a (noble-new-builds)
Line 1: buildbot version: a1d2c1b97bf2ad3b19b1aeae0ec8dc337e1fce81
Line 2: Fetching cached dependencies
Line 3: Failed to fetch cache, continuing with build
Line 4: Starting to prepare the repo for build
Line 5: No cached dependencies found. Cloning fresh repo
Line 6: git clone --filter=blob:none https://github.com/Danielle-Sophia/Nutria
Line 7: Preparing Git Reference refs/heads/main
Line 8: Installing dependencies
Line 9: mise [36m~/.config/mise/config.toml[0m tools: [34mpython[0m@3.14.3
Line 10: mise [36m~/.config/mise/config.toml[0m tools: [34mruby[0m@3.4.8
Line 11: mise [36m~/.config/mise/config.toml[0m tools: [34mgo[0m@1.26.0
Line 12: v22.22.0 is already installed.
Line 13: Now using node v22.22.0 (npm v10.9.4)
Line 75: - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
Line 76: [32m✓ built in 3.71s[39m
Line 77: ​
Line 78: [90m(build.command completed in 4.1s)[39m
Line 79: [96m[1m​[22m[39m
Line 80: [96m[1mDeploy site                                                   [22m[39m
Line 81: [96m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 82: ​
Line 83: Section completed: deploying
Line 84: [91m[1m​[22m[39m
Line 85: [91m[1mConfiguration error                                           [22m[39m
Line 86: [91m[1m────────────────────────────────────────────────────────────────[22m[39m
Line 87: ​
Line 88:   [31m[1mError message[22m[39m
Line 89:   Deploy did not succeed: Deploy directory 'dist' does not exist
Line 90: ​
Line 91:   [31m[1mResolved config[22m[39m
Line 92:   build:
Line 93:     command: npm run build
Line 94:     commandOrigin: ui
Line 95:     publish: /opt/build/repo/dist
Line 96:     publishOrigin: ui
Line 97: Build failed due to a user error: Build script returned non-zero exit code: 2
Line 98: Failing build: Failed to build site
Line 99: Finished processing build request in 24.29s
Line 100: Failed during stage 'building site': Build script returned non-zero exit code: 2