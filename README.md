# Remotely Secure

**Remotely Secure** is a fork of *Remotely Save*, the unofficial sync plugin for Obsidian. The original *Remotely Save* plugin is not actively maintained and has security issues; please see the [list of security updates](#security-updates-from-remotely-save) made to *Remotely Save*. Note this plugin is not backwards compatible with Remotely Save, save your data locally and have a backup before using this plugin. See [migration guide](#migrating-from-remotely-save) instructions.

If you like it or find it useful, please consider give it a [star ![GitHub Repo stars](https://img.shields.io/github/stars/sboesen/remotely-secure?style=social)](https://github.com/sboesen/remotely-secure) on Github.

## Disclaimer

- **This is NOT the [official sync service](https://obsidian.md/sync) provided by Obsidian.**

## !!!Caution!!!

**ALWAYS, ALWAYS, backup your vault before using this plugin.**


## Security Updates from Remotely Save
 - Fixed [encryption bug](https://github.com/sboesen/remotely-secure/commit/d9ad76e774b0b1cee2b36316058df926f4bfb2bf) resulting in AES-CBC usage using the same IV for all files, which can enable attacks that leak key material.
- Updated encryption to use [AES-GCM](https://github.com/sboesen/remotely-secure/commit/d9ad76e774b0b1cee2b36316058df926f4bfb2bf#diff-6ce8b79e4237671498e2b10caa08b379beaae2cd5e56415167b563d1536f6b74R57) which is more secure and authenticates the ciphertext before decrypting, making it harder to exploit certain padding oracle attacks.
- Updated [salt](https://github.com/sboesen/remotely-secure/commit/d9ad76e774b0b1cee2b36316058df926f4bfb2bf#diff-6ce8b79e4237671498e2b10caa08b379beaae2cd5e56415167b563d1536f6b74R45) to random bytes every time. [See note](https://github.com/sboesen/remotely-secure/issues/9)
- **No security guarantees**, but these are the issues I identified when reviewing the end-to-end encryption as implemented in remotely-save.

## Features
- Supports:
  - Amazon S3 or S3-compatible
  - Dropbox
  - OneDrive for personal
  - Webdav (**Currently untested, please file a bug report if this isn't working**)
  - [Here](./docs/services_connectable_or_not.md) shows more connectable (or not-connectable) services in details. Please note this list came from the original [Remotely Save](https://github.com/remotely-save/remotely-save) plugin and may not be up to date for Remotely Secure.
- **Obsidian Mobile supported.** Vaults can be synced across mobile and desktop devices with the cloud service as the "broker".
- **[End-to-end encryption](./docs/encryption.md) supported.** Files would be encrypted using openssl format before being sent to the cloud **if** user specify a password.
- **Scheduled auto sync supported.** You can also manually trigger the sync using sidebar ribbon, or using the command from the command palette (or even bind the hot key combination to the command then press the hot key combination).
- Sync on Save
- Sync status bar
- Syncing bookmarks by default (and other obsidian configuration files if enabled)
- **[Minimal Intrusive](./docs/minimal_intrusive_design.md).**
- **Fully open source under [Apache-2.0 License](./LICENSE).**
- **[Sync Algorithm open](./docs/sync_algorithm_v2.md) for discussion.**

## Limitations

- **To support syncing deleted files, extra metadata will also be uploaded.** See [Minimal Intrusive](./docs/minimal_intrusive_design.md).
  - **No conflict resolution. No content-diff-and-patch algorithm.** All files and folders are compared using their local and remote "last modified time" and those with later "last modified time" win.
- **Cloud services cost you money.** Always be aware of the costs and pricing. Specifically, all the operations, including but not limited to downloading, uploading, listing all files, calling any api, storage sizes, may or may not cost you money.
- **Some limitations from the browser environment.** More technical details are [in the doc](./docs/browser_env.md).
- **You should protect your `data.json` file.** The file contains sensitive information.
  - It's strongly advised **NOT** to share your `data.json` file to anyone.
  - It's usually **NOT** a good idea to check the file into version control. By default, the plugin tries to create a `.gitignore` file inside the plugin directory if it doesn't exist, for ignoring `data.json` in the `git` version control. If you know exactly what it means and want to remove the setting, please modify the `.gitignore` file or set it to be empty.

## Migrating from Remotely Save
The easiest way to migrate from Remotely Save (or other forks) to Remotely Secure is:

1. Make a local, unencrypted backup of your files (make sure to synchronize all changes across your devices)
2. Disable the remotely-save plugin
3. Enable remotely-secure and set a new encryption password
4. Delete the encrypted files in your cloud provider (or make a new S3 bucket in this case)
5. Perform a sync using remotely-secure

## Credit
* Credit to @fyears for the original Remotely Save plugin
* Credit to @sampurkiszb for sync on save
* Credit to @zaiziw for Obsidian bookmark sync

## Questions, Suggestions, Or Bugs

You are greatly welcome to ask questions, post any suggestions, or report any bugs! The project is mainly maintained on GitHub:

- Questions: [GitHub repo Discussions](https://github.com/sboesen/remotely-secure/discussions)
- Suggestions: also in [GitHub repo Discussions](https://github.com/sboesen/remotely-secure/discussions)
- Bugs: [GitHub repo Issues](https://github.com/sboesen/remotely-secure/issues) (NOT Discussion)

## Download and Install

- Option #1: Search in the official "community plugin list", or visit this: [https://obsidian.md/plugins?id=remotely-secure](https://obsidian.md/plugins?id=remotely-secure) (which should redirect you into Obsidian app), then install the plugin.
- Option #2: You can also use [Obsidian42 - BRAT](https://github.com/TfTHacker/obsidian42-brat) to install this plugin. Input `sboesen/remotely-secure` in the configuration of BRAT.
- Option #3: [![GitHub release (latest by SemVer and asset including pre-releases)](https://img.shields.io/github/downloads-pre/sboesen/remotely-secure/latest/main.js?sort=semver)](https://github.com/sboesen/remotely-secure/releases) Manually download assets (`main.js`, `manifest.json`, `styles.css`) from the latest release.

## Usage

### S3

- Prepare your S3 (-compatible) service information: [endpoint, region](https://docs.aws.amazon.com/general/latest/gr/s3.html), [access key id, secret access key](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-your-credentials.html), bucket name. The bucket should be empty and solely for syncing a vault.
- About CORS:
  - If you are using Obsidian desktop >= 0.13.25 or mobile >= 1.1.1, you can skip this CORS part.
  - If you are using Obsidian desktop < 0.13.25 or mobile < 1.1.1, you need to configure (enable) [CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html) for requests from `app://obsidian.md` and `capacitor://localhost` and `http://localhost`, and add at least `ETag` into exposed headers. Full example is [here](./docs/s3_cors_configure.md). It's unfortunately required, because the plugin sends requests from a browser-like envirement. And those addresses are tested and found on desktop and ios and android.
- Download and enable this plugin.
- Enter your information to the settings of this plugin.
- If you want to enable end-to-end encryption, also set a password in settings. If you do not specify a password, the files and folders are synced in plain, original content to the cloud.
- Click the new "circle arrow" icon on the ribbon (the left sidebar), **every time** you want to sync your vault between local and remote. (Or, you could configure auto sync in the settings panel (See next chapter).) While syncing, the icon becomes "two half-circle arrows". Besides clicking the icon on the sidebar ribbon, you can also activate the corresponding command in the command palette.
- **Be patient while syncing.** Especially in the first-time sync.

### Dropbox

- **This plugin is NOT an official Dropbox product.** The plugin just uses Dropbox's public API.
- After the authorization, the plugin can read your name and email (which cannot be unselected on Dropbox api), and read and write files in your Dropbox's `/Apps/remotely-secure` folder.
- If you decide to authorize this plugin to connect to Dropbox, please go to plugin's settings, and choose Dropbox then follow the instructions. [More with screenshot is here](./docs/dropbox_review_material/README.md).
- Password-based end-to-end encryption is also supported. But please be aware that **the vault name itself is not encrypted**.

### OneDrive for personal

- **This plugin is NOT an official Microsoft / OneDrive product.** The plugin just uses Microsoft's [OneDrive's public API](https://docs.microsoft.com/en-us/onedrive/developer/rest-api).
- This plugin only works for "OneDrive for personal", and not works for "OneDrive for Business" (yet). See [#11](https://github.com/fyears/remotely-save/issues/11) to further details.
- After the authorization, the plugin can read your name and email, and read and write files in your OneDrive's `/Apps/remotely-secure` folder.
- If you decide to authorize this plugin to connect to OneDrive, please go to plugin's settings, and choose OneDrive then follow the instructions.
- Password-based end-to-end encryption is also supported. But please be aware that **the vault name itself is not encrypted**.

### webdav

- About CORS:
  - If you are using Obsidian desktop >= 0.13.25 or iOS >= 1.1.1, you can skip this CORS part.
  - If you are using Obsidian desktop < 0.13.25 or iOS < 1.1.1 or any Android version:
    - The webdav server has to be enabled CORS for requests from `app://obsidian.md` and `capacitor://localhost` and `http://localhost`, **AND** all webdav HTTP methods, **AND** all webdav headers. These are required, because Obsidian mobile works like a browser and mobile plugins are limited by CORS policies unless under a upgraded Obsidian version.
    - Popular software NextCloud, OwnCloud, `rclone serve webdav` do **NOT** enable CORS by default. If you are using any of them, you should evaluate the risk, and find a way to enable CORS, before using this plugin, or use a upgraded Obsidian version.
      - **Unofficial** workaround: NextCloud users can **evaluate the risk by themselves**, and if decide to accept the risk, they can install [WebAppPassword](https://apps.nextcloud.com/apps/webapppassword) app, and add `app://obsidian.md`, `capacitor://localhost`, `http://localhost` to `Allowed origins`
      - **Unofficial** workaround: OwnCloud users can **evaluate the risk by themselves**, and if decide to accept the risk, they can download `.tar.gz` of `WebAppPassword` above and manually install and configure it on their instances.
    - The plugin is tested successfully under python package [`wsgidav` (version 4.0)](https://github.com/mar10/wsgidav). See [this issue](https://github.com/mar10/wsgidav/issues/239) for some details.
- Your data would be synced to a `${vaultName}` sub folder on your webdav server.
- Password-based end-to-end encryption is also supported. But please be aware that **the vault name itself is not encrypted**.

## Scheduled Auto Sync

- You can configure auto syncing every N minutes in settings.
- In auto sync mode, if any error occurs, the plugin would **fail silently**.
- Auto sync only works when Obsidian is being opened. It's **technically impossible** to auto sync while Obsidian is in background, because the plugin just works in the browser environment provided by Obsidian.

## How To Deal With Hidden Files Or Folders

**By default, all files or folder starting with `.` (dot) or `_` (underscore) are treated as hidden files, and would NOT be synced.** It's useful if you have some files just staying locally. But this strategy also means that themes / other plugins / settings of this plugin would neither be synced.

In the latest version, you can change the settings to allow syncing `_` files or folders, as well as `.obsidian` special config folder (but not any other `.` files or folders).

## How To Debug

See [here](./docs/how_to_debug/README.md) for more details.

## Bonus: Import And Export Not-Oauth2 Plugin Settings By QR Code

See [here](./docs/import_export_some_settings.md) for more details.
