import Reactotron from "reactotron-react-native";
import { Platform } from "react-native";

Reactotron.configure({
  name: "SampleFinder App",
  host: Platform.OS === "ios" ? "localhost" : "localhost", // iOS simulator uses localhost
}) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .connect(); // let's connect! // let's connect!