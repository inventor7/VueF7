<template>
  <f7-page>
    <f7-navbar large transparent title="About">
      <F7NavRight sliding>
        <F7Link
          icon-ios="f7:sparkles"
          icon-md="material:auto_awesome"
          popup-open="#theme-popup"
        ></F7Link>
      </F7NavRight>
    </f7-navbar>

    <F7Block>About</F7Block>

    <HomePanel />
  </f7-page>
</template>
<script setup lang="ts"></script>
