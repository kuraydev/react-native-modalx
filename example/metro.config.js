const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the parent library so edits to ../src hot-reload.
config.watchFolders = [workspaceRoot];

// Make sure metro resolves dependencies from the example's node_modules first,
// then falls back to the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Avoid duplicate copies of single-instance peers.
config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "react-native-reanimated": path.resolve(
    projectRoot,
    "node_modules/react-native-reanimated",
  ),
  "react-native-gesture-handler": path.resolve(
    projectRoot,
    "node_modules/react-native-gesture-handler",
  ),
};

module.exports = config;
