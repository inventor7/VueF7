<template>
  <F7Page>
    <F7Navbar
      transparent
      :sliding="true"
      large
      title="Home"
      class="!rounded-b-2xl"
    >
      <F7NavRight sliding>
        <F7Link
          icon-ios="f7:sparkles"
          icon-md="material:auto_awesome"
          popup-open="#theme-popup"
        ></F7Link>
      </F7NavRight>
    </F7Navbar>

    <F7Block>Home page</F7Block>
    <HomePanel />
  </F7Page>
</template>
<script setup lang="ts"></script>
