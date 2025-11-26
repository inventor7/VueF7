<template>
  <F7Page ptr @ptr:refresh="handleRefresh" class="pb-16">
    <F7Navbar
      @navbar:collapse="isNavbarCollapsed = true"
      @navbar:expand="isNavbarCollapsed = false"
      large
      transparent
      title="FairShare"
      :sliding="false"
    >
      <F7NavRight>
        <F7Link
          icon-ios="f7:plus_circle_fill"
          icon-md="material:add_circle"
          @click="showCreateGroup = true"
          color="primary"
          icon-size="32"
          size="32"
        />
      </F7NavRight>

      <F7Subnavbar
        :bg-color="!isNavbarCollapsed ? 'transparent' : ''"
        :inner="false"
      >
        <F7Searchbar
          class="search-groups"
          :custom-search="true"
          :disable-button="true"
          placeholder="Search groups..."
          :clear-button="true"
          :backdrop="false"
          @searchbar:search="handleSearch"
          @searchbar:clear="clearSearch"
      /></F7Subnavbar>
    </F7Navbar>

    <GroupsList ref="groupsList" @create-group="showCreateGroup = true" />
    <CreateGroupSheet v-model:opened="showCreateGroup" />
  </F7Page>
</template>

<script setup lang="ts">
const groupsStore = useGroupsStore();
const showCreateGroup = ref(false);
const groupsList = ref<any>(null);
const isNavbarCollapsed = ref(false);

function handleSearch(searchbar: Element, query: string) {
  if (groupsList.value) {
    groupsList.value.searchQuery = query;
  }
}

function clearSearch() {
  if (groupsList.value) {
    groupsList.value.searchQuery = "";
  }
}

async function handleRefresh(done: any) {
  await groupsStore.refreshGroups();

  done();
}

onMounted(() => {
  groupsStore.watchGroups();
});

onUnmounted(() => {
  groupsStore.stopWatching();
});
</script>
