import type Framework7 from "framework7";
import { useAndroidBackButton } from "./capcitor/useAndroidBackButton";
import { useKeyboard } from "./capcitor/useKeyboard";
import { useSplashscreen } from "./capcitor/useSplashScreen";

const capacitorApp = {
  f7: null as Framework7 | null,

  handleSplashscreen: useSplashscreen,
  handleAndroidBackButton: useAndroidBackButton,
  handleKeyboard: useKeyboard,

  init: function (f7: Framework7) {
    capacitorApp.f7 = f7;

    capacitorApp.handleAndroidBackButton(f7);
    capacitorApp.handleSplashscreen();
    capacitorApp.handleKeyboard(f7);
  },
};

export default capacitorApp;
