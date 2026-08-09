# Greeting Helper

سلام

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8fcae60c-9d66-40f7-8995-c04b7f611207).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Desktop App (Tauri v2)

This project includes a desktop app powered by Tauri v2.

### Prerequisites

To build the desktop app locally, you must have the Rust toolchain installed.

1.  **Install Rust**: Visit [rustup.rs](https://rustup.rs/) and follow the instructions.
2.  **Platform Dependencies**:
    *   **Windows**: [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed).
    *   **macOS**: Xcode Command Line Tools (`xcode-select --install`).
    *   **Linux**: Various system libraries (e.g., `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`). See the [Tauri Linux guide](https://v2.tauri.app/start/prerequisites/#linux).

### Troubleshooting: "program not found: cargo metadata"

If you see this error, it means the Rust toolchain is either not installed or not in your system's PATH.

*   **Verification**: Run `cargo --version` in your terminal. If it fails, install Rust.
*   **PATH**: Ensure `~/.cargo/bin` (macOS/Linux) or `%USERPROFILE%\.cargo\bin` (Windows) is in your environment PATH variable. You may need to restart your terminal after installation.

### Building for Production

```sh
npm run desktop:build
```

---

**Production Status**: 
'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

Create a README section with the exact local prerequisites (Rust, required Tauri deps) and troubleshooting for the "program not found" cargo metadata error.

Configure a GitHub Actions workflow to install Rust and run `npm run tauri build` so production desktop builds succeed automatically.

Implement a preflight check in the build script that fails with a clear message if `cargo` is not found, including install instructions.

Add steps to install the Rust toolchain (cargo) and verify it with `cargo --version` before running `npm run tauri build`.

