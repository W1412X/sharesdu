<template>
  <div class="loading-skeleton" :class="[`loading-skeleton--${variant}`, { 'loading-skeleton--dense': dense }]">
    <div class="loading-skeleton__accent"></div>

    <template v-if="variant === 'page'">
      <div class="loading-skeleton__page">
        <v-skeleton-loader type="heading" class="skeleton-block skeleton-title"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--wide"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--mid"></v-skeleton-loader>
        <div class="loading-skeleton__page-grid">
          <v-skeleton-loader type="article" class="skeleton-card skeleton-card--large"></v-skeleton-loader>
          <v-skeleton-loader type="article" class="skeleton-card skeleton-card--large"></v-skeleton-loader>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'course'">
      <div class="loading-skeleton__card">
        <v-skeleton-loader type="heading" class="skeleton-block skeleton-title"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--wide"></v-skeleton-loader>
        <div class="loading-skeleton__meta-grid">
          <v-skeleton-loader type="text" v-for="index in 4" :key="`course-meta-${index}`" class="skeleton-chip"></v-skeleton-loader>
        </div>
        <div class="loading-skeleton__rating">
          <v-skeleton-loader type="avatar" class="skeleton-avatar"></v-skeleton-loader>
          <div class="loading-skeleton__rating-bars">
            <v-skeleton-loader type="text" v-for="index in 5" :key="`course-bar-${index}`" class="skeleton-bar"></v-skeleton-loader>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'section'">
      <div class="loading-skeleton__section">
        <v-skeleton-loader type="image" class="skeleton-section-cover"></v-skeleton-loader>
        <div class="loading-skeleton__section-info">
          <v-skeleton-loader type="heading" class="skeleton-block skeleton-title"></v-skeleton-loader>
          <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--wide"></v-skeleton-loader>
          <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--mid"></v-skeleton-loader>
          <div class="loading-skeleton__meta-row">
            <v-skeleton-loader type="text" v-for="index in metaCount" :key="`section-meta-${index}`" class="skeleton-chip"></v-skeleton-loader>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'list'">
      <div class="loading-skeleton__list">
        <div v-for="index in itemCount" :key="`list-${index}`" class="loading-skeleton__list-item">
          <v-skeleton-loader type="avatar" class="skeleton-avatar"></v-skeleton-loader>
          <div class="loading-skeleton__list-text">
            <v-skeleton-loader type="heading" class="skeleton-block skeleton-title skeleton-title--list"></v-skeleton-loader>
            <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--wide"></v-skeleton-loader>
            <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--short"></v-skeleton-loader>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'header'">
      <div class="loading-skeleton__card">
        <v-skeleton-loader type="heading" class="skeleton-block skeleton-title"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--wide"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--mid"></v-skeleton-loader>
        <div class="loading-skeleton__meta-row">
          <v-skeleton-loader type="text" v-for="index in metaCount" :key="`header-meta-${index}`" class="skeleton-chip"></v-skeleton-loader>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="loading-skeleton__card">
        <v-skeleton-loader type="avatar" class="skeleton-avatar"></v-skeleton-loader>
        <v-skeleton-loader type="heading" class="skeleton-block skeleton-title"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--wide"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="skeleton-block skeleton-line skeleton-line--mid"></v-skeleton-loader>
        <div class="loading-skeleton__meta-row">
          <v-skeleton-loader type="text" v-for="index in chipCount" :key="`card-chip-${index}`" class="skeleton-chip"></v-skeleton-loader>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'card',
  },
  itemCount: {
    type: Number,
    default: 3,
  },
  metaCount: {
    type: Number,
    default: 3,
  },
  chipCount: {
    type: Number,
    default: 3,
  },
  dense: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.loading-skeleton {
  position: relative;
  width: 100%;
  min-height: 100%;
  overflow: hidden;
}

.loading-skeleton__accent {
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.03) 100%);
  opacity: 0.9;
}

.loading-skeleton__card,
.loading-skeleton__page,
.loading-skeleton__list {
  padding: 16px;
}

.loading-skeleton--dense .loading-skeleton__card,
.loading-skeleton--dense .loading-skeleton__page,
.loading-skeleton--dense .loading-skeleton__list {
  padding: 12px;
}

.skeleton-block {
  border-radius: 12px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.skeleton-title {
  width: 72%;
  margin-bottom: 12px;
}

.skeleton-title--list {
  width: 58%;
}

.skeleton-line {
  height: 14px;
  margin-bottom: 10px;
}

.skeleton-line--wide {
  width: 92%;
}

.skeleton-line--mid {
  width: 74%;
}

.skeleton-line--short {
  width: 52%;
}

.skeleton-chip {
  width: 88px;
  height: 28px;
  margin-right: 10px;
  border-radius: 999px;
}

.skeleton-card {
  width: 100%;
  border-radius: 16px;
  margin-bottom: 12px;
}

.skeleton-card--large {
  min-height: 150px;
}

.skeleton-bar {
  width: 100%;
  height: 12px;
  margin-bottom: 10px;
  border-radius: 999px;
}

.loading-skeleton__meta-row,
.loading-skeleton__meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.loading-skeleton__page-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.loading-skeleton__section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.loading-skeleton__section-info {
  flex: 1;
  min-width: 0;
}

.skeleton-section-cover {
  width: 124px;
  height: 124px;
  border-radius: 18px;
}

.loading-skeleton__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.loading-skeleton__list-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.loading-skeleton__list-text {
  flex: 1;
  min-width: 0;
}

.loading-skeleton__rating {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 18px;
}

.loading-skeleton__rating-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 1000px) {
  .loading-skeleton__card,
  .loading-skeleton__page,
  .loading-skeleton__list {
    padding: 12px;
  }

  .loading-skeleton__page-grid {
    grid-template-columns: 1fr;
  }

  .loading-skeleton__section {
    gap: 12px;
  }

  .skeleton-section-cover {
    width: 96px;
    height: 96px;
    border-radius: 16px;
  }

}
</style>
