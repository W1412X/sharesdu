<template>
  <div class="bottom-bar toolbar">
    <div class="column-center user-name text-medium">
      {{ userName }}
    </div>
    <v-spacer class="spacer"></v-spacer>
    <div class="row-reverse">
      <div v-if="userId != post.authorId" class="column-center margin-right-15px">
        <alert-button :type="'post'" :id="post.id"></alert-button>
      </div>
      <div v-else class="column-center margin-right-15px">
        <delete-button
          @delete="$emit('delete-post')"
          :id="post.id"
          :type="'post'"
          :size="24"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
        ></delete-button>
      </div>
      <div class="column-center padding-right-5px">
        <like-button
          v-if="post.id"
          :type="'post'"
          :id="post.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :state="post.ifLike"
        ></like-button>
      </div>
      <div class="column-center padding-right-10px">
        <v-btn elevation="0" @click="$emit('show-comment-editor')" icon class="bottom-btn icon-btn">
          <v-icon size="23" icon="mdi-comment-outline"></v-icon>
          <v-tooltip activator="parent">添加评论</v-tooltip>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import LikeButton from '@/components/common/LikeButton.vue';
import AlertButton from '@/components/report/AlertButton.vue';
import DeleteButton from '@/components/common/DeleteButton.vue';

defineProps({
  post: {
    type: Object,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    default: null,
  },
});

defineEmits(['delete-post', 'alert', 'set-loading', 'show-comment-editor']);
</script>

<style scoped>
.toolbar {
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.bottom-bar {
  display: flex;
  flex-direction: row;
  position: fixed;
  bottom: 0;
  height: 40px;
  border: #8a8a8a 1px solid;
  background-color: #ffffff;
  z-index: 1000;
}

.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.text-medium {
  font-size: 14px;
}

.user-name {
  color: var(--theme-color);
}

.row-reverse {
  display: flex;
  flex-direction: row-reverse;
}

.padding-right-5px {
  padding-right: 5px;
}

.padding-right-10px {
  padding-right: 10px;
}

.margin-right-15px {
  margin-right: 20px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  color: #8a8a8a;
  background-color: transparent;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.bottom-btn {
  width: 23px;
  height: 23px;
  color: #8a8a8a;
  background-color: rgba(0, 0, 0, 0);
}

@media screen and (min-width: 1000px) {
  .bottom-bar {
    width: 900px;
  }

  .user-name {
    margin-left: 10px;
    max-width: 300px;
  }
}

@media screen and (max-width: 1000px) {
  .bottom-bar {
    width: 100vw;
  }

  .user-name {
    margin-left: 2vw;
    width: 30vw;
  }

  .spacer {
    max-width: 30vw;
    font-size: 0px;
  }

  .row-reverse {
    width: 40vw;
  }
}
</style>


