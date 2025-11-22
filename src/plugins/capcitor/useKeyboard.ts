import capacitorApp from "../capacitor.plugin";

/*
  This method does the following:
    - provides cross-platform view "shrinking" on keyboard open/close
    - hides keyboard accessory bar for all inputs except where it required
  */
export const useKeyboard = () => {
  var f7: any = capacitorApp.f7;
  let window: any = {};

  if (!window.Capacitor || !window.Capacitor.Plugins.Keyboard) return;
  var $ = f7.$;
  var Keyboard = window.Capacitor.Plugins.Keyboard;
  if (!Keyboard) return;
  Keyboard.setResizeMode({ mode: "native" });
  Keyboard.setScroll({ isDisabled: true });
  Keyboard.setAccessoryBarVisible({ isVisible: false });
  window.addEventListener("keyboardWillShow", () => {
    f7.input.scrollIntoView(document.activeElement, 0, true, true);
  });
  window.addEventListener("keyboardDidShow", () => {
    f7.input.scrollIntoView(document.activeElement, 0, true, true);
  });
  window.addEventListener("keyboardDidHide", () => {
    if (
      document.activeElement &&
      $(document.activeElement).parents(".messagebar").length
    ) {
      return;
    }
    Keyboard.setAccessoryBarVisible({ isVisible: true });
  });

  $(document).on(
    "touchstart",
    "input, textarea, select",
    function (e: any) {
      var nodeName = e.target.nodeName.toLowerCase();
      var type = e.target.type;
      var showForTypes = ["datetime-local", "time", "date", "datetime"];
      if (nodeName === "select" || showForTypes.indexOf(type) >= 0) {
        Keyboard.setAccessoryBarVisible({ isVisible: true });
      } else {
        Keyboard.setAccessoryBarVisible({ isVisible: false });
      }
    },
    true
  );
};
