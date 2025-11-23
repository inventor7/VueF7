import type Framework7 from "framework7";
import { useAndroidBackButton } from "./capcitor/useAndroidBackButton";
import { useKeyboard } from "./capcitor/useKeyboard";
import { useSplashscreen } from "./capcitor/useSplashScreen";

var capacitorApp = {
  f7,
  handleSplashscreen: useSplashscreen,
  handleAndroidBackButton: useAndroidBackButton,
  handleKeyboard: useKeyboard,

  init: function (f7: Framework7) {
    capacitorApp.f7 = f7;

    capacitorApp.handleAndroidBackButton();
    capacitorApp.handleSplashscreen();
    capacitorApp.handleKeyboard();
  },
};

export default capacitorApp;
