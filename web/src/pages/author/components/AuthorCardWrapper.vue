<template>
  <author-card
    v-if="authorId"
    :id="authorId"
    :if-master="ifMaster"
    @alert="handleAlert"
    @author_name="handleAuthorName"
  ></author-card>
</template>

<script setup>
import AuthorCard from '@/components/user/AuthorCard.vue';

defineProps({
  authorId: {
    type: String,
    default: null,
  },
  ifMaster: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['alert', 'author-name']);

const handleAlert = (msg) => {
  emit('alert', msg);
};

const handleAuthorName = (name) => {
  emit('author-name', name);
};
</script>

