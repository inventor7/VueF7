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

    <f7-block class="mb-2">
      <f7-block-title class="text-center">VueF7 Template</f7-block-title>
      <p class="text-center text-gray-600 dark:text-gray-300">
        Enterprise Mobile-First Development Template
      </p>
    </f7-block>

    <f7-block class="pt-0">
      <!-- Core Technologies -->
      <f7-block-title medium>Core Technologies</f7-block-title>
      <f7-list>
        <f7-list-item title="Vue 3" after="Composition API" />
        <f7-list-item title="TypeScript" after="Type Safety" />
        <f7-list-item title="Framework7" after="Native Look & Feel" />
        <f7-list-item title="Capacitor" after="Cross-Platform" />
        <f7-list-item title="Vite" after="Fast Bundler" />
        <f7-list-item title="Pinia" after="State Management" />
      </f7-list>

      <!-- Development Experience -->
      <f7-block-title medium class="mt-6"
        >Development Experience</f7-block-title
      >
      <f7-list>
        <f7-list-item title="Auto Imports" after="Automatic" />
        <f7-list-item title="Auto Components" after="Automatic" />
        <f7-list-item title="Turbo Console" after="Enhanced Debugging" />
        <f7-list-item title="Modular Architecture" after="Feature-Based" />
        <f7-list-item title="Type-Safe Routing" after="Framework7" />
        <f7-list-item title="TailwindCSS" after="Styling" />
      </f7-list>

      <!-- Database Options -->
      <f7-block-title medium class="mt-6">Database Solutions</f7-block-title>
      <f7-list>
        <f7-list-item title="SQLite Branch" after="Capacitor + Kysely" />
        <f7-list-item title="PowerSync Branch" after="Real-time Sync" />
        <f7-list-item
          title="WASQLite OPFS"
          after="Fastest Web Performance"
          badge="Current"
          badge-color="primary"
        />
        <f7-list-item title="Evolu Branch" after="Local-First CRDT" />
      </f7-list>

      <!-- Branch Information -->
      <f7-block-title medium class="mt-6">Branch Information</f7-block-title>
      <f7-list>
        <f7-list-item title="Current Branch" after="db/sqlite-opfs" />
        <f7-list-item title="Database" after="WASQLite + OPFS" />
        <f7-list-item title="Architecture" after="PowerSync (client-only)" />
        <f7-list-item title="Performance" after="Extremely Fast" />
      </f7-list>

      <!-- Features -->
      <f7-block-title medium class="mt-6">Special Features</f7-block-title>
      <f7-list>
        <f7-list-item title="Offline-First" after="Available" />
        <f7-list-item title="i18n Support" after="Multi-Language" />
        <f7-list-item title="RTL Support" after="Available" />
        <f7-list-item title="Dark Mode" after="Native" />
        <f7-list-item title="Native Animations" after="Framework7" />
      </f7-list>

      <!-- GitHub Link -->
      <f7-block-title medium class="mt-6">GitHub Repository</f7-block-title>
      <f7-list>
        <f7-list-item
          link="https://github.com/inventor7/VueF7"
          title="VueF7 on GitHub"
          after="Check it out"
          target="_blank"
          external
        >
          <f7-icon slot="media" f7="logo_github" color="gray"></f7-icon>
        </f7-list-item>
      </f7-list>
    </f7-block>

    <HomePanel />
  </f7-page>
</template>

<script setup lang="ts"></script>
