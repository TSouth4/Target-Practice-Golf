# Publish v12.3.0 in the existing Work project

Download the complete development branch from GitHub using **Code → Download ZIP**, and upload it to the original Work conversation.

Suggested instruction for Work:

> Update the existing private Target Practice site from this complete archive. Deploy the entire `dist/` directory together, including `approach-generator.js`, `tee-generator.js`, and the matching HTML, CSS, and application modules. Preserve the existing project identity and owner-only access. Before publishing, check that the course actually renders, the browser has no missing-module errors, Commit & shoot appears immediately below the course, and Next shot and Retry work for both tee and approach scenarios.

Keep `.openai/hosting.json` with project ID `appgprj_6ac9a3e7317c8191b1a10027146d39c8` and static directory `dist`. Do not create a replacement public site. There is no build step or runtime dependency installation.

An incomplete upload can leave the selectors visible while the course is blank green. In particular, the new approach module must be published alongside the rest of the files. Check the rendered course after deployment, rather than treating an uploaded archive as proof that the site works.

This environment can save and test the GitHub changes; it has no publishing access to the existing private Work site.
