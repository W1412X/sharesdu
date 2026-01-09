<template>
  <div class="top-bar">
    <span class="logo-text logo-margin">ShareSDU</span>
    <div class="top-btn-div">
      <button @click="handleDeveloperClick" class="custom-nav-btn">开发者文档</button>
      <button @click="$emit('show-contact')" class="custom-nav-btn">联系我们</button>
      <button @click="$emit('download-app')" class="custom-nav-btn">体验APP</button>
    </div>
  </div>
</template>

<script setup>
import { openPage } from '@/utils/other';

defineEmits(['show-contact', 'download-app']);

const handleDeveloperClick = () => {
  openPage('router', { name: 'DeveloperPage' });
};
</script>

<style scoped>
.top-bar {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.logo-margin {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--welcome-theme-gradient-start, #667eea) 0%, var(--welcome-theme-gradient-end, #764ba2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.custom-nav-btn {
  background: transparent;
  border: none;
  color: var(--welcome-theme-color, #667eea);
  font-size: 1rem;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-family: inherit;
  letter-spacing: 0.3px;
}

.custom-nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--welcome-theme-rgba-10, rgba(102, 126, 234, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.custom-nav-btn:hover::before {
  opacity: 1;
}

.custom-nav-btn:hover {
  transform: translateY(-2px);
  color: var(--welcome-theme-color, #667eea);
}

.custom-nav-btn:active {
  transform: translateY(0);
}

@media screen and (min-width: 1000px) {
  .top-bar {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    padding: 20px 40px;
    align-items: center;
    justify-content: space-between;
  }

  .top-btn-div {
    display: flex;
    flex-direction: row-reverse;
    gap: 20px;
  }

  .custom-nav-btn {
    font-size: 1.05rem;
    padding: 12px 24px;
  }

  .logo-margin {
    margin: 0;
    font-size: 2rem;
    cursor: default;
  }
}

@media screen and (max-width: 1000px) {
  .top-bar {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: row;
    padding: 12px 16px;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .top-btn-div {
    display: flex;
    flex-direction: row-reverse;
    gap: 6px;
    flex: 1;
    justify-content: flex-end;
  }

  .custom-nav-btn {
    font-size: 0.9rem;
    padding: 8px 16px;
  }

  .logo-margin {
    margin: 0;
    font-size: 1.5rem;
    flex-shrink: 0;
  }
}
</style>

