module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ["react-native-worklets/plugin", {}, "worklets"],           // 👈 UNIQUE NAME
      ["react-native-reanimated/plugin", {}, "reanimated"],       // 👈 UNIQUE NAME
    ],
  };
};
