import { createApp } from "vue";
import Framework7 from "framework7/lite-bundle";
import Framework7Vue, { registerComponents } from "framework7-vue/bundle";

import App from "./App.vue";

import pinia from "./plugins/pinia.plugin";
import i18n from "./plugins/i18n.plugin";

import "./assets/css/icons.css";
import "./assets/css/app.css";

const app = createApp(App);

Framework7.use(Framework7Vue);
registerComponents(app);

app.use(pinia);
app.use(i18n);

app.mount("#app");
