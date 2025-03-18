<template>
    <div>
      <h1>Test Dexie Database</h1>
  
      <div>
        <h2>Set Profile</h2>
        <input v-model="userId" placeholder="Enter User ID" />
        <input v-model="updateTime" placeholder="Enter Update Time" type="number" />
        <input type="file" @change="handleFileUpload" />
        <button @click="setProfile">Save Profile</button>
      </div>
  
      <div v-if="profile">
        <h2>Profile Data</h2>
        <p><strong>User ID:</strong> {{ profile.userId }}</p>
        <p><strong>Update Time:</strong> {{ profile.updateTime }}</p>
        <p><strong>Blob Data:</strong> {{ profile.blob ? "Blob data uploaded" : "No data" }}</p>
      </div>
  
      <div>
        <h2>Get Profile</h2>
        <input v-model="fetchUserId" placeholder="Enter User ID to fetch" />
        <button @click="getProfile">Get Profile</button>
      </div>
      <div>
        <h2>delete Profile</h2>
        <input v-model="fetchUserId" placeholder="Enter User ID to fetch" />
        <button @click="deleteProfile">deleye Profile</button>
      </div>
      <div v-if="fetchedProfile">
        <h2>Fetched Profile</h2>
        <p><strong>User ID:</strong> {{ fetchedProfile.userId }}</p>
        <p><strong>Update Time:</strong> {{ fetchedProfile.updateTime }}</p>
        <p><strong>Blob Data:</strong> {{ fetchedProfile.blob ? "Blob data uploaded" : "No data" }}</p>
      </div>
    </div>
  </template>
  
  <script>
import { dbDeleteProfile, dbGetProfile, dbSetProfile } from '@/utils/db';


  
  export default {
    data() {
      return {
        userId: "",
        updateTime: null,
        blob: null,
        fetchUserId: "",
        profile: null,
        fetchedProfile: null,
      };
    },
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.blob = file;
        }
      },
      setProfile() {
        if (this.userId && this.updateTime && this.blob) {
          dbSetProfile(this.userId, this.updateTime, this.blob);
          this.profile = {
            userId: this.userId,
            updateTime: this.updateTime,
            blob: this.blob,
          };
          alert("Profile saved!");
        } else {
          alert("Please fill out all fields.");
        }
      },
      async getProfile() {
        if (this.fetchUserId) {
          this.fetchedProfile = await dbGetProfile(this.fetchUserId);
          console.log(this.fetchedProfile);
          if (this.fetchedProfile) {
            alert("Profile fetched!");
          } else {
            alert("Profile not found.");
          }
        } else {
          alert("Please enter a User ID to fetch.");
        }
      },
      async deleteProfile() {
        if (this.fetchUserId) {
          this.fetchedProfile = await dbDeleteProfile(this.fetchUserId);
          console.log(this.fetchedProfile);
          if (this.fetchedProfile) {
            alert("Profile deleted!");
          } else {
            alert("Profile not found.");
          }
        } else {
          alert("Please enter a User ID to fetch.");
        }
      },
    },
  };
  </script>
  
  <style scoped>
  input {
    margin-bottom: 10px;
  }
  button {
    margin-top: 10px;
  }
  </style>
  