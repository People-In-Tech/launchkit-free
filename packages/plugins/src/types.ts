export interface PluginFileMapping {
  src: string;
  dest: string;
}

export interface PluginManifest {
  name: string;
  description: string;
  version: string;
  files: PluginFileMapping[];
  schema: string;
  dependencies: string[];
}
