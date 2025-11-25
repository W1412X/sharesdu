<template>
  <div id="type-container" class="type-bar">
    <v-btn
      variant="tonal"
      :prepend-icon="sortIconNow"
      :color="themeColor"
      :slim="true"
    >
      {{ sortTypeLabelNow }}
      <v-menu activator="parent">
        <v-list style="padding-right: 10px;">
          <v-list-item
            v-for="(sortOption, index) in sortOptionsToShow"
            :key="index"
            :variant="sortType === sortOption.value ? 'tonal' : ''"
            :slim="true"
            density="compact"
            :rounded="true"
            :active-color="themeColor"
            base-color="grey"
            class="text-small sort-btn"
            @click="$emit('update:sort-type', sortOption.value)"
            :active="sortType === sortOption.value"
            :prepend-icon="sortOption.icon"
            :title="sortOption.label"
          >
            <v-list-item-title></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  sortType: {
    type: [String, null],
    required: true,
  },
  sortIconNow: {
    type: String,
    required: true,
  },
  sortTypeLabelNow: {
    type: String,
    required: true,
  },
  sortOptionsToShow: {
    type: Array,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
  },
});

defineEmits(['update:sort-type']);
</script>

<style scoped>
.sort-btn {
  margin-left: 10px;
  max-height: 25px;
}

.type-bar {
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
  max-width: 400px;
  margin-right: 10px;
  width: fit-content;
  overflow-x: auto;
}

@media screen and (max-width: 1000px) {
  .type-bar {
    max-width: 60vw;
  }
}
</style>
