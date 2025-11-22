<template>
  <F7App v-bind="f7Params">
    <F7Views tabs animated class="safe-areas" :class="{ 'pb-12': showToolbar }">
      <F7View
        v-for="view in views"
        :id="view.id"
        :main="view.isActiveTab"
        tab
        :tab-active="view.isActiveTab"
        :url="view.url"
        :key="view.id"
        @tab:show="(tab : Element) => activeRoute = tab.id"
      ></F7View>

      <F7Toolbar
        v-show="showToolbar"
        tabbar
        icons
        bottom
        class="!h-16 !rounded-t-2xl toolbar-transition"
      >
        <F7Link
          v-for="link in views"
          :key="link.id"
          icon-only
          :tab-link="`#${link.id}`"
          :tab-link-active="link.isActiveTab"
          :badge="5"
          badge-color="primary"
          ripple-color="transparent"
          transition="f7-cover"
          class="!pt-2"
        >
          <f7-icon
            :ios="
              activeRoute === link.id ? `${link.icon.ios}_fill` : link.icon.ios
            "
            :md="link.icon.android"
          >
            <f7-badge v-if="link.name === 'Cart'" color="red">1</f7-badge>
          </f7-icon>
          <span class="tabbar-label">{{ link.name }}</span>
        </F7Link>
      </F7Toolbar>
    </F7Views>
  </F7App>
</template>

<script setup lang="ts">
import capacitorApp from "./plugins/capacitor.plugin";
import { framework7 } from "./plugins/framework7.plugin";

const device = getDevice();
const f7Params = framework7();
const activeRoute = ref("view-home");
const currentPath = ref("/");

const mainViewRoutes = ["/", "/about"];

const showToolbar = computed(() => {
  return mainViewRoutes.includes(currentPath.value);
});

onMounted(() => {
  f7ready(() => {
    if (device.capacitor) {
      capacitorApp.init(f7);
    }

    const router = f7.views.main?.router;
    if (router) {
      router.on("routeChanged", (newRoute) => {
        currentPath.value = newRoute.route.path;
      });
    }
  });
});

onBeforeUnmount(() => {
  f7.off("routeChange");
  const router = f7.views.main?.router;
  if (router) {
    router.off("routeChanged");
  }
});

const views = [
  {
    id: "view-home",
    name: "Home",
    url: "/",
    isActiveTab: true,
    icon: {
      ios: "f7:house",
      android: "material:home",
    },
  },
  {
    id: "view-about",
    name: "About",
    url: "/about",
    isActiveTab: undefined,
    icon: {
      ios: "f7:info",
      android: "material:info",
    },
  },
];
</script>

<style scoped>
.toolbar-transition {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
