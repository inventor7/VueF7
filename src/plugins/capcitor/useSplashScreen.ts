/*
  This method hides splashscreen after 2 seconds
  */
export const useSplashscreen = () => {
  let window: any = {};
  if (!window.Capacitor) return;
  setTimeout(() => {
    if (window.Capacitor.Plugins && window.Capacitor.Plugins.SplashScreen) {
      window.Capacitor.Plugins.SplashScreen.hide();
    }
  }, 2000);
};
