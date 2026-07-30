# Day 57: Scaffolding a First Anchor Project

## Steps

1. Confirm the prerequisites are present. If any of these print an error, fix that one first before continuing.
   ```bash
   solana --version
   rustc --version
   cargo --version
   node --version
   ```
2. Install the Anchor Version Manager (AVM). AVM is to Anchor what nvm is to Node: it lets me install multiple Anchor CLI versions side by side and switch between them per project. This is always preferable to installing a single fixed Anchor binary, because real Solana projects pin specific Anchor versions in `Anchor.toml`.
   ```bash
   cargo install --git https://github.com/solana-foundation/anchor avm --force
   ```
3. Use AVM to install the latest stable Anchor CLI and select it as the active version.
   ```bash
   avm install latest
   avm use latest
   anchor --version
   ```
   I should see a version line like `anchor-cli 1.0.x`. The exact patch number does not matter for this challenge, only that the command answers.
4. Move into a parent folder where I keep Solana work (not inside any existing project), then scaffold a brand new Anchor project.
   ```bash
   anchor init counter
   cd counter
   ```
   This creates a fresh directory with a complete, buildable Anchor workspace inside it.

   Note: if the `anchor` command is not found or does not work right after installing, close the terminal/CLI completely and open a new one, then try again. A fresh session picks up the updated PATH.
5. Take a tour of what just appeared. Open the project in the editor and look at each of these:
   - `Anchor.toml`: the project configuration. Notice the `[programs.localnet]` section, which maps the program's name to a public key. That key is the on-chain address the program will deploy to.
   - `Cargo.toml` at the workspace root: a standard Rust workspace file that lists `programs/*` as members.
   - `programs/counter/src/lib.rs`: the actual program. Three things to pay attention to:
     - `declare_id!(...)`: the same address seen in `Anchor.toml`, baked into the binary.
     - `#[program]`: the module that contains every instruction handler. Anchor expands this macro into the dispatcher that routes incoming transactions to the functions.
     - `pub fn initialize(_ctx: Context<Initialize>) -> Result<()>`: a single no-op instruction. The `Context` wraps the accounts the instruction receives.
   - `programs/counter/tests/test_initialize.rs`: a scaffolded Rust integration test that loads the compiled program into LiteSVM and calls the no-op `initialize` instruction. Not run today; replaced with my own test tomorrow.
   - `package.json`: the JavaScript dependencies for Anchor's client tooling.
6. Compile the scaffolded program. This is the moment of truth for the toolchain.

## Run it

```bash
anchor build
```

The first build takes a while because Anchor pulls down and compiles the Solana program SDK. Subsequent builds are seconds. When it finishes, I should see a fresh `target/` directory containing a `.so` file (the compiled program) and an `idl/` folder containing a JSON file (the Interface Definition Language description of the program). Both are the artifacts used for the rest of this arc.
