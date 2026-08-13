# Portfolio link audit

Checked against the GitHub API and re-verified with anonymous HTTP requests on 2026-08-13.

## How each card presents its repo

| Treatment | Cards | What the visitor sees |
|---|---|---|
| Public | 76 | Clickable **View on GitHub ↗** → the real URL (HTTP 200 anonymously) |
| Private, real URL known | 126 | `🔒 Private` badge + the real `github.com/owner/repo` as plain text + "not publicly accessible" (HTTP 404 anonymously) |
| Private, slug is a placeholder | 60 | `🔒 Private · Zachary Companies` badge + "repository name withheld" — **no real URL exists to show**; these `zc-*` slugs are synthetic by your sanitization policy |

**Every URL rendered on the site is a real one.** No fabricated paths, no dead hyperlinks.

## Public — clickable (76)

| Card | URL | Anon status |
|---|---|---|
| `a-frame-components` | `github.com/mephisto83/a-frame-components` | 200 |
| `bailey-code` | `github.com/mephisto83/bailey-code` | 200 |
| `ball-simulation` | `github.com/mephisto83/ball-simulation` | 200 |
| `bgreen-virtual` | `github.com/mephisto83/bgreen-virtual` | 200 |
| `blended-music` | `github.com/mephisto83/blended-music` | 200 |
| `boiler_plate_react` | `github.com/mephisto83/boiler_plate_react` | 200 |
| `bus-com` | `github.com/mephisto83/bus-com` | 200 |
| `cheap-tickets` | `github.com/mephisto83/cheap-tickets` | 200 |
| `city-planner` | `github.com/mephisto83/city-planner` | 200 |
| `digi-letters` | `github.com/mephisto83/digi-letters` | 200 |
| `disonance` | `github.com/mephisto83/disonance` | 200 |
| `distributo` | `github.com/mephisto83/distributo` | 200 |
| `FF` | `github.com/mephisto83/FF` | 200 |
| `FieldForce` | `github.com/mephisto83/FieldForce` | 200 |
| `FileWatcher` | `github.com/mephisto83/FileWatcher` | 200 |
| `fleetgames` | `github.com/mephisto83/fleetgames` | 200 |
| `graph-spring` | `github.com/mephisto83/graph-spring` | 200 |
| `horizontallist` | `github.com/mephisto83/horizontallist` | 200 |
| `htmlelementtest` | `github.com/mephisto83/htmlelementtest` | 200 |
| `icanfeel-report` | `github.com/mephisto83/icanfeel-report` | 200 |
| `Ingo` | `github.com/mephisto83/Ingo` | 200 |
| `IngoTouch` | `github.com/mephisto83/IngoTouch` | 200 |
| `kikswitch-report` | `github.com/mephisto83/kikswitch-report` | 200 |
| `lsystem` | `github.com/mephisto83/lsystem` | 200 |
| `mac_projects` | `github.com/mephisto83/mac_projects` | 200 |
| `magic-erase` | `github.com/mephisto83/magic-erase` | 200 |
| `MagicWandPy` | `github.com/mephisto83/MagicWandPy` | 200 |
| `mass-unzip` | `github.com/mephisto83/mass-unzip` | 200 |
| `mathjs` | `github.com/mephisto83/mathjs` | 200 |
| `MathPractice` | `github.com/mephisto83/MathPractice` | 200 |
| `MEPH.Grey` | `github.com/mephisto83/MEPH.Grey` | 200 |
| `mephisto83.github.io` | `github.com/mephisto83/mephisto83.github.io` | 200 |
| `midjourney-categories` | `github.com/mephisto83/midjourney-categories` | 200 |
| `ml-question` | `github.com/mephisto83/ml-question` | 200 |
| `open-test-tensor` | `github.com/mephisto83/open-test-tensor` | 200 |
| `pdf-merge` | `github.com/mephisto83/pdf-merge` | 200 |
| `petty-paint-comfyui-node` | `github.com/mephisto83/petty-paint-comfyui-node` | 200 |
| `PixelSymphony` | `github.com/mephisto83/PixelSymphony` | 200 |
| `playwatch-report` | `github.com/mephisto83/playwatch-report` | 200 |
| `point-in-poly` | `github.com/mephisto83/point-in-poly` | 200 |
| `positionable` | `github.com/mephisto83/positionable` | 200 |
| `practice-repo` | `github.com/mephisto83/practice-repo` | 200 |
| `PresenatationBlender` | `github.com/mephisto83/PresenatationBlender` | 200 |
| `Presentation` | `github.com/mephisto83/Presentation` | 200 |
| `PresentationBlend` | `github.com/mephisto83/PresentationBlend` | 200 |
| `PresentationBlendResources` | `github.com/mephisto83/PresentationBlendResources` | 200 |
| `PresentationMaterials` | `github.com/mephisto83/PresentationMaterials` | 200 |
| `PresentationWatch` | `github.com/mephisto83/PresentationWatch` | 200 |
| `py-text-draw` | `github.com/mephisto83/py-text-draw` | 200 |
| `react-native-social-identity-login` | `github.com/mephisto83/react-native-social-identity-login` | 200 |
| `react-redux` | `github.com/mephisto83/react-redux` | 200 |
| `React-Redux-AwesomeProject-Native` | `github.com/mephisto83/React-Redux-AwesomeProject-Native` | 200 |
| `red-auto-ml` | `github.com/mephisto83/red-auto-ml` | 200 |
| `red-duplicado` | `github.com/mephisto83/red-duplicado` | 200 |
| `ReddSend` | `github.com/mephisto83/ReddSend` | 200 |
| `redhash` | `github.com/mephisto83/redhash` | 200 |
| `redquick-ai-extension` | `github.com/mephisto83/redquick-ai-extension` | 200 |
| `redquickbuilder` | `github.com/mephisto83/redquickbuilder` | 200 |
| `SafeStream` | `github.com/mephisto83/SafeStream` | 200 |
| `skyview-report` | `github.com/mephisto83/skyview-report` | 200 |
| `space-ships` | `github.com/mephisto83/space-ships` | 200 |
| `style-extractor` | `github.com/mephisto83/style-extractor` | 200 |
| `threefold-bastion` | `github.com/mephisto83/threefold-bastion` | 200 |
| `torch-graph` | `github.com/mephisto83/torch-graph` | 200 |
| `translations` | `github.com/mephisto83/translations` | 200 |
| `transparent-winow` | `github.com/mephisto83/transparent-winow` | 200 |
| `veronica-lessons` | `github.com/mephisto83/veronica-lessons` | 200 |
| `voronoi` | `github.com/mephisto83/voronoi` | 200 |
| `wave-onset-detector` | `github.com/mephisto83/wave-onset-detector` | 200 |
| `woodbury_instagram` | `github.com/mephisto83/woodbury_instagram` | 200 |
| `woodbury_nanobanana` | `github.com/mephisto83/woodbury_nanobanana` | 200 |
| `yawning-titan` | `github.com/mephisto83/yawning-titan` | 200 |
| `yolo-dataset-visualizer` | `github.com/mephisto83/yolo-dataset-visualizer` | 200 |
| `comp-screenplay-generator` | `github.com/Zachary-Companies/comp-screenplay-generator` | 200 |
| `nano-banana-api` | `github.com/Zachary-Companies/nano-banana-api` | 200 |
| `woodbury` | `github.com/Zachary-Companies/woodbury` | 200 |

## Private — real URL shown as plain text (126)

| Card | Real URL (not a link) | Anon status |
|---|---|---|
| `aframe_test` | `github.com/mephisto83/aframe_test` | 404 |
| `alkmene` | `github.com/mephisto83/alkmene` | 404 |
| `art-hangout` | `github.com/mephisto83/art-hangout` | 404 |
| `BaseVR` | `github.com/mephisto83/BaseVR` | 404 |
| `Bridge` | `github.com/mephisto83/Bridge` | 404 |
| `bridge.serve` | `github.com/mephisto83/bridge.serve` | 404 |
| `BridgeNative` | `github.com/mephisto83/BridgeNative` | 404 |
| `BubbleTest` | `github.com/mephisto83/BubbleTest` | 404 |
| `canvia` | `github.com/mephisto83/canvia` | 404 |
| `chad-serve` | `github.com/mephisto83/chad-serve` | 404 |
| `christmas_2024` | `github.com/mephisto83/christmas_2024` | 404 |
| `Client-Profile-Case-Study-App` | `github.com/mephisto83/Client-Profile-Case-Study-App` | 404 |
| `coins` | `github.com/mephisto83/coins` | 404 |
| `comfy-ui-apainter-file-watch` | `github.com/mephisto83/comfy-ui-apainter-file-watch` | 404 |
| `compliment` | `github.com/mephisto83/compliment` | 404 |
| `ComposerCompanion` | `github.com/mephisto83/ComposerCompanion` | 404 |
| `composercompanion-release` | `github.com/mephisto83/composercompanion-release` | 404 |
| `CPCS` | `github.com/mephisto83/CPCS` | 404 |
| `CrystalQuote` | `github.com/mephisto83/CrystalQuote` | 404 |
| `DeepPonies_Text_To_Speech` | `github.com/mephisto83/DeepPonies_Text_To_Speech` | 404 |
| `DigitalAssistant` | `github.com/mephisto83/DigitalAssistant` | 404 |
| `discord-dancer` | `github.com/mephisto83/discord-dancer` | 404 |
| `educingo` | `github.com/mephisto83/educingo` | 404 |
| `educingo-rn` | `github.com/mephisto83/educingo-rn` | 404 |
| `email-infra-tf` | `github.com/mephisto83/email-infra-tf` | 404 |
| `expressivefeeling` | `github.com/mephisto83/expressivefeeling` | 404 |
| `exr-py-read` | `github.com/mephisto83/exr-py-read` | 404 |
| `faiss-lib` | `github.com/mephisto83/faiss-lib` | 404 |
| `fire-router` | `github.com/mephisto83/fire-router` | 404 |
| `Fireflow` | `github.com/mephisto83/Fireflow` | 404 |
| `flow-frame` | `github.com/mephisto83/flow-frame` | 404 |
| `flow-journies` | `github.com/mephisto83/flow-journies` | 404 |
| `flow-midjourney` | `github.com/mephisto83/flow-midjourney` | 404 |
| `flowconfig` | `github.com/mephisto83/flowconfig` | 404 |
| `geometry-blender-project` | `github.com/mephisto83/geometry-blender-project` | 404 |
| `hausofpetty` | `github.com/mephisto83/hausofpetty` | 404 |
| `hausofpetty_code` | `github.com/mephisto83/hausofpetty_code` | 404 |
| `hausofpetty_firebase` | `github.com/mephisto83/hausofpetty_firebase` | 404 |
| `homesuite` | `github.com/mephisto83/homesuite` | 404 |
| `homesuite-web` | `github.com/mephisto83/homesuite-web` | 404 |
| `HourglassHQ` | `github.com/mephisto83/HourglassHQ` | 404 |
| `hudl-dancer` | `github.com/mephisto83/hudl-dancer` | 404 |
| `hudl-up` | `github.com/mephisto83/hudl-up` | 404 |
| `icanfeelorg` | `github.com/mephisto83/icanfeelorg` | 404 |
| `image-to-pdf` | `github.com/mephisto83/image-to-pdf` | 404 |
| `isoc-mockup` | `github.com/mephisto83/isoc-mockup` | 404 |
| `isometric-html-test` | `github.com/mephisto83/isometric-html-test` | 404 |
| `kikswitch` | `github.com/mephisto83/kikswitch` | 404 |
| `kikswitch-workspace` | `github.com/mephisto83/kikswitch-workspace` | 404 |
| `kikswitchbridge` | `github.com/mephisto83/kikswitchbridge` | 404 |
| `local-image-server` | `github.com/mephisto83/local-image-server` | 404 |
| `lyrics-extractor` | `github.com/mephisto83/lyrics-extractor` | 404 |
| `mathdash` | `github.com/mephisto83/mathdash` | 404 |
| `MEPH` | `github.com/mephisto83/MEPH` | 404 |
| `midjourney-source` | `github.com/mephisto83/midjourney-source` | 404 |
| `multi-trainer-app` | `github.com/mephisto83/multi-trainer-app` | 404 |
| `node` | `github.com/mephisto83/node` | 404 |
| `nyc` | `github.com/mephisto83/nyc` | 404 |
| `petty-story` | `github.com/mephisto83/petty-story` | 404 |
| `pixel-peek` | `github.com/mephisto83/pixel-peek` | 404 |
| `Playwatch` | `github.com/mephisto83/Playwatch` | 404 |
| `playwatch-code` | `github.com/mephisto83/playwatch-code` | 404 |
| `playwatch-dev-deploy` | `github.com/mephisto83/playwatch-dev-deploy` | 404 |
| `Playwatch-Firebase` | `github.com/mephisto83/Playwatch-Firebase` | 404 |
| `playwatch-firebase-functions` | `github.com/mephisto83/playwatch-firebase-functions` | 404 |
| `playwatch-media-process` | `github.com/mephisto83/playwatch-media-process` | 404 |
| `playwatch-media-transfer` | `github.com/mephisto83/playwatch-media-transfer` | 404 |
| `playwatch-mobile` | `github.com/mephisto83/playwatch-mobile` | 404 |
| `playwatch-process` | `github.com/mephisto83/playwatch-process` | 404 |
| `playwatch-prod-deploy` | `github.com/mephisto83/playwatch-prod-deploy` | 404 |
| `practice-distributo` | `github.com/mephisto83/practice-distributo` | 404 |
| `practice-word-scrape` | `github.com/mephisto83/practice-word-scrape` | 404 |
| `PresentationEditor` | `github.com/mephisto83/PresentationEditor` | 404 |
| `PresentationJobs` | `github.com/mephisto83/PresentationJobs` | 404 |
| `process-midjourney-images` | `github.com/mephisto83/process-midjourney-images` | 404 |
| `project-storage` | `github.com/mephisto83/project-storage` | 404 |
| `py-see-screen` | `github.com/mephisto83/py-see-screen` | 404 |
| `rapstar` | `github.com/mephisto83/rapstar` | 404 |
| `rbanq-mobile` | `github.com/mephisto83/rbanq-mobile` | 404 |
| `react-web-report` | `github.com/mephisto83/react-web-report` | 404 |
| `Real_ESRGAN` | `github.com/mephisto83/Real_ESRGAN` | 404 |
| `red-data-set` | `github.com/mephisto83/red-data-set` | 404 |
| `red-quick-builder` | `github.com/mephisto83/red-quick-builder` | 404 |
| `red-quick-builder-map-report` | `github.com/mephisto83/red-quick-builder-map-report` | 404 |
| `red-quick-extensions` | `github.com/mephisto83/red-quick-extensions` | 404 |
| `red-quick-groups` | `github.com/mephisto83/red-quick-groups` | 404 |
| `red-react-phone-input` | `github.com/mephisto83/red-react-phone-input` | 404 |
| `redmath` | `github.com/mephisto83/redmath` | 404 |
| `redquick` | `github.com/mephisto83/redquick` | 404 |
| `redquick-expo-starter-pack` | `github.com/mephisto83/redquick-expo-starter-pack` | 404 |
| `redquick-functionality-builder` | `github.com/mephisto83/redquick-functionality-builder` | 404 |
| `redquickbuilder_firebase` | `github.com/mephisto83/redquickbuilder_firebase` | 404 |
| `redquickbuilderweb` | `github.com/mephisto83/redquickbuilderweb` | 404 |
| `redquickdistribution` | `github.com/mephisto83/redquickdistribution` | 404 |
| `room-bank-prod-deploy` | `github.com/mephisto83/room-bank-prod-deploy` | 404 |
| `room-banking` | `github.com/mephisto83/room-banking` | 404 |
| `room-banking-processing` | `github.com/mephisto83/room-banking-processing` | 404 |
| `rq-local-storage-service` | `github.com/mephisto83/rq-local-storage-service` | 404 |
| `rtc_towerdefense` | `github.com/mephisto83/rtc_towerdefense` | 404 |
| `scrape-city` | `github.com/mephisto83/scrape-city` | 404 |
| `screen-watcher` | `github.com/mephisto83/screen-watcher` | 404 |
| `skyview.wetzel` | `github.com/mephisto83/skyview.wetzel` | 404 |
| `Slicer` | `github.com/mephisto83/Slicer` | 404 |
| `Slicer-Mind-the-Gap` | `github.com/mephisto83/Slicer-Mind-the-Gap` | 404 |
| `Slicer2` | `github.com/mephisto83/Slicer2` | 404 |
| `square-the-images` | `github.com/mephisto83/square-the-images` | 404 |
| `stories` | `github.com/mephisto83/stories` | 404 |
| `story-gen` | `github.com/mephisto83/story-gen` | 404 |
| `suno-downloads` | `github.com/mephisto83/suno-downloads` | 404 |
| `sweatshirt` | `github.com/mephisto83/sweatshirt` | 404 |
| `Tanner-Training` | `github.com/mephisto83/Tanner-Training` | 404 |
| `tensorflow1` | `github.com/mephisto83/tensorflow1` | 404 |
| `test` | `github.com/mephisto83/test` | 404 |
| `test-langchain` | `github.com/mephisto83/test-langchain` | 404 |
| `test_calling_tams` | `github.com/mephisto83/test_calling_tams` | 404 |
| `torry-me` | `github.com/mephisto83/torry-me` | 404 |
| `tower-defense-3d` | `github.com/mephisto83/tower-defense-3d` | 404 |
| `UberRailEnvironments` | `github.com/mephisto83/UberRailEnvironments` | 404 |
| `urban-distributo` | `github.com/mephisto83/urban-distributo` | 404 |
| `VrProject` | `github.com/mephisto83/VrProject` | 404 |
| `wave-form-marker` | `github.com/mephisto83/wave-form-marker` | 404 |
| `webfuscator` | `github.com/mephisto83/webfuscator` | 404 |
| `wecanfeel` | `github.com/mephisto83/wecanfeel` | 404 |
| `windows-data-set-creator` | `github.com/mephisto83/windows-data-set-creator` | 404 |
| `zachary-group-monitor` | `github.com/mephisto83/zachary-group-monitor` | 404 |
| `woobury-models` | `github.com/Zachary-Companies/woobury-models` | 404 |

## Private — placeholder slug, no URL (60)

These carry a synthetic `zc-*` name. Publishing their real URLs would put private
Zachary-Companies repo names on a public site, which your sanitization policy forbids.

| Card |
|---|
| `zc-acord-agent` |
| `zc-agent-dashboard` |
| `zc-agent-libraries` |
| `zc-agent-testing` |
| `zc-agentic-loop` |
| `zc-ai-assistant-toolkit` |
| `zc-ai-ml-service` |
| `zc-ams-api-client` |
| `zc-ams-frontend` |
| `zc-billing-agent` |
| `zc-bodji-beacon` |
| `zc-bodji-beacon-sim` |
| `zc-bodji-field` |
| `zc-bodji-local` |
| `zc-bodji-scout` |
| `zc-bodji-seek` |
| `zc-builders-risk` |
| `zc-business-collector` |
| `zc-business-integration-apis` |
| `zc-campaign-video-system` |
| `zc-carrier-appetite-agent` |
| `zc-client-lifecycle-agent` |
| `zc-code-generator-ui` |
| `zc-coi-agent` |
| `zc-coi-db` |
| `zc-color-palette-generator` |
| `zc-comfyui-lan-api` |
| `zc-commission-agent` |
| `zc-coverage-proposal-agent` |
| `zc-devily-cli` |
| `zc-email-infra` |
| `zc-email-viewer` |
| `zc-eval-forge` |
| `zc-filing-agent` |
| `zc-firecrawl` |
| `zc-fnol-agent` |
| `zc-follow-up-agent` |
| `zc-form-pilot` |
| `zc-image-agent` |
| `zc-inference-playground` |
| `zc-insurance-harness` |
| `zc-llm-service` |
| `zc-local-inference-stack` |
| `zc-loss-run-agent` |
| `zc-management-api` |
| `zc-meeting-prep-agent` |
| `zc-music-client` |
| `zc-ollama-lan-api` |
| `zc-policy-change-agent` |
| `zc-quote-comparison-agent` |
| `zc-renewal-negotiator-agent` |
| `zc-renewal-outreach-agent` |
| `zc-review-pilot` |
| `zc-scheduled-jobs` |
| `zc-settings-agent` |
| `zc-submission-intake-agent` |
| `zc-tenant-config-manager` |
| `zc-underwriting-copilot` |
| `zc-vertical-plugins` |
| `zc-website-generator` |
