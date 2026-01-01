<template>
  <div class="welcome-mobile-container">
    <v-card class="intro-card" elevation="12">
      <WelcomeHero></WelcomeHero>
      
      <div class="content-grid">
        <WelcomeFeatures></WelcomeFeatures>
        <WelcomeAdvantages></WelcomeAdvantages>
      </div>
      
      <WelcomeNotices></WelcomeNotices>
      <WelcomeContact></WelcomeContact>
    </v-card>
  </div>
</template>

<script setup>
import {
  WelcomeHero,
  WelcomeFeatures,
  WelcomeAdvantages,
  WelcomeNotices,
  WelcomeContact,
} from '../components';

defineOptions({
  name: 'WelcomePageMobile',
});
</script>

<style scoped>
.welcome-mobile-container {
  width: 100vw;
  display: grid;
  justify-content: center;
  padding: 12px;
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.intro-card {
  margin-top: 50px;
  margin-bottom: 30px;
  max-width: 96vw;
  padding: 24px 18px;
  height: fit-content;
  display: grid;
  justify-content: center;
  flex-direction: column;
  border-radius: 24px !important;
}
</style>

