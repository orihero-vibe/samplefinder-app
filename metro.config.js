const { getDefaultConfig } = require("expo/metro-config");
const { withMonicon } = require("@monicon/metro");

const config = getDefaultConfig(__dirname);

const configWithMonicon = withMonicon(config, {
  icons: [
    "mage:stars-a",
    "mdi:account",
    "mdi:account-multiple",
    "mdi:arrow-left",
    "mdi:bed",
    "mdi:bell",
    "mdi:calendar",
    "mdi:calendar-check",
    "mdi:calendar-plus",
    "mdi:cart",
    "mdi:cat",
    "mdi:cellphone",
    "mdi:check",
    "mdi:chess-rook",
    "mdi:chevron-down",
    "mdi:chevron-left",
    "mdi:chevron-right",
    "mdi:chevron-up",
    "mdi:circle",
    "mdi:close",
    "mdi:format-list-bulleted",
    "mdi:heart",
    "mdi:heart-outline",
    "mdi:help-circle",
    "mdi:magnify",
    "mdi:map",
    "mdi:map-marker",
    "mdi:office-building",
    "mdi:refresh",
    "mdi:share-variant",
    "mdi:shield-check",
    "mdi:star",
    "mdi:star-outline",
    "oi:map-marker",
    "ph:seal-check-light",
    "ph:seal-fill",
    "streamline:star-2-remix",
  ],
});

module.exports = configWithMonicon;
