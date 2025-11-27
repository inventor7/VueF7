import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

/*
  This method hides splashscreen after 2 seconds
  */
export const useSplashscreen = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }
  setTimeout(async () => {
    await SplashScreen.hide();
  }, 2000);
};
