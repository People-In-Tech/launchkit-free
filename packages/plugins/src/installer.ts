import * as fs from "node:fs";
import * as path from "node:path";
import { getPlugin, listPlugins } from "./registry";
import type { PluginManifest } from "./types";

export interface InstallOptions {
  pluginName: string;
  pluginsDir: string;
  targetDir: string;
  dryRun?: boolean;
}

export interface InstallResult {
  plugin: string;
  filesCopied: string[];
  errors: string[];
}

/**
 * Install a plugin by copying its files into the target app directory.
 */
export function installPlugin(options: InstallOptions): InstallResult {
  const { pluginName, pluginsDir, targetDir, dryRun = false } = options;

  const manifest = getPlugin(pluginName);
  if (!manifest) {
    return { plugin: pluginName, filesCopied: [], errors: [`Plugin "${pluginName}" not found in registry`] };
  }

  const result: InstallResult = { plugin: pluginName, filesCopied: [], errors: [] };
  const pluginDir = path.join(pluginsDir, pluginName);

  for (const file of manifest.files) {
    const srcPath = path.join(pluginDir, file.src);
    const destPath = path.join(targetDir, file.dest);

    if (!fs.existsSync(srcPath)) {
      result.errors.push(`Source file not found: ${srcPath}`);
      continue;
    }

    if (dryRun) {
      result.filesCopied.push(file.dest);
      continue;
    }

    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    result.filesCopied.push(file.dest);
  }

  return result;
}

/**
 * Install all registered plugins.
 */
export function installAllPlugins(pluginsDir: string, targetDir: string, dryRun = false): InstallResult[] {
  return listPlugins().map((manifest) =>
    installPlugin({ pluginName: manifest.name, pluginsDir, targetDir, dryRun })
  );
}
