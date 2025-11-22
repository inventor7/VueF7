<template>
  <f7-page name="unauthorized">
    <f7-navbar title="Unauthorized" back-link="Back"></f7-navbar>

    <f7-block strong>
      <f7-block-title>401 - Unauthorized</f7-block-title>
      <p>You don't have permission to access this page.</p>
      <p>Please log in to continue.</p>

      <f7-button fill @click="goToLogin">Login</f7-button>
    </f7-block>
  </f7-page>
</template>
<script setup lang="ts">
import { f7 } from "framework7-vue";

const goToLogin = () => {
  f7.loginScreen.open("#my-login-screen");
};
</script>
