<template>
  <F7Sheet
    class="demo-sheet-swipe-to-close"
    style="height: auto; --f7-sheet-bg-color: #fff"
    swipe-to-close
    backdrop
    :opened="opened"
    @sheet:closed="$emit('update:opened', false)"
  >
    <div class="sheet-modal-swipe-step">
      <div
        class="display-flex padding justify-content-space-between align-items-center"
      >
        <div style="font-size: 18px"><b>Create New Group</b></div>
      </div>
      <div class="padding-bottom">
        <F7List no-hairlines-md>
          <F7ListInput
            label="Group Name"
            type="text"
            placeholder="e.g. Summer Trip"
            :value="name"
            @input="name = $event.target.value"
            clear-button
          />
          <F7ListInput
            label="Currency"
            type="select"
            :value="currency"
            @change="currency = $event.target.value"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </F7ListInput>
        </F7List>
        <div class="padding-horizontal padding-bottom">
          <F7Button fill large @click="create" :loading="loading"
            >Create Group</F7Button
          >
        </div>
      </div>
    </div>
  </F7Sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGroupsStore } from "@/stores/groups.store";

const props = defineProps<{
  opened: boolean;
}>();

const emit = defineEmits<{
  (e: "update:opened", value: boolean): void;
}>();

const groupsStore = useGroupsStore();
const name = ref("");
const currency = ref("USD");
const loading = ref(false);

async function create() {
  if (!name.value.trim()) return;

  loading.value = true;
  try {
    await groupsStore.createGroup(name.value, currency.value);
    name.value = "";
    emit("update:opened", false);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>
