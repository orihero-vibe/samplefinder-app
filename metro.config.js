const { getDefaultConfig } = require("expo/metro-config");
const { withMonicon } = require("@monicon/metro");

const config = getDefaultConfig(__dirname);

const configWithMonicon = withMonicon(config, {
  icons: [
    "mdi:home",
    "mdi:account",
    "mdi:heart",
    "mdi:heart-outline",
    "mdi:calendar",
    "mdi:calendar-plus",
    "mdi:star-outline",
    "mdi:map",
    "mdi:map-marker",
    "mdi:magnify",
    "mdi:office-building",
    "mdi:format-list-bulleted",
    "mdi:circle",
    "mdi:check",
    "mdi:close",
    "mdi:cart",
    "mdi:bed",
    "mdi:chess-rook",
    "mdi:cat",
    "mdi:arrow-left",
    "mdi:share-variant",
    "mdi:chevron-left",
    "mdi:chevron-right",
    "mdi:chevron-down",
    "mdi:chevron-up",
    "mdi:bell",
    "mdi:account-multiple",
  ],
});

module.exports = configWithMonicon;

