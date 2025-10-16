module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "babel-plugin-macros",
      "nativewind/babel",
      ["react-native-worklets/plugin", { blackbox: true }, "worklets"],
      ["react-native-reanimated/plugin", { relativeSourceLocation: true }, "reanimated"]
    ],
  };
};
