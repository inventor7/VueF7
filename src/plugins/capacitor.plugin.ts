import { useAndroidBackButton } from "./capcitor/useAndroidBackButton";
import { useKeyboard } from "./capcitor/useKeyboard";
import { useSplashscreen } from "./capcitor/useSplashScreen";

var capacitorApp = {
  f7: null,

  handleSplashscreen: useSplashscreen,
  handleAndroidBackButton: useAndroidBackButton,
  handleKeyboard: useKeyboard,

  init: function (f7: any) {
    capacitorApp.f7 = f7;

    capacitorApp.handleAndroidBackButton();
    capacitorApp.handleSplashscreen();
    capacitorApp.handleKeyboard();
  },
};

export default capacitorApp;
