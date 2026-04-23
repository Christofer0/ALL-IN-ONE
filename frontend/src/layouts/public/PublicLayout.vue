<script setup lang="ts">
import Navbar from "../../components/public/Navbar.vue";
import Footer from "../../components/public/Footer.vue";
</script>

<template>
  <div class="public min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style>
/* Any layout-specific styles can go here if needed, 
   but most are in style.css under .public */
</style>
