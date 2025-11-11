<template>
    <div class="full-center">
        <v-dialog v-model="ifShowDialog" class="dialog">
            <div class="dialog-card-container">
            </div>
        </v-dialog>
        <v-navigation-drawer v-if="deviceType === 'desktop'" v-model="drawer" :rail="rail" permanent
            @click="rail = false">
            <v-btn v-if="!rail" size="30" class="menu-btn" :icon="'mdi-chevron-left'"
                @click.stop="rail = !rail">
            </v-btn>
            <v-list density="compact" nav :color="themeColor" v-model="choose">
                <v-list-item @click="choose = 'post-html'" prepend-icon="mdi-language-html5" title="帖子HTML" value="item"></v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-navigation-drawer v-if="deviceType === 'mobile' && navVisible" v-model="drawer" :rail='false' permanent
            @click="rail = false">
            <v-btn size="30" class="menu-btn" :icon="navVisible ? 'mdi-chevron-left' : 'mdi-chevron-right'"
                @click="navVisible = !navVisible"></v-btn>
            <v-list density="compact" nav :color="themeColor" v-model="choose">
                <v-list-item @click="choose = 'post-html'" prepend-icon="mdi-language-html5" title="帖子HTML" value="item"></v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-btn size="30" class="mobile-menu-btn" :icon="'mdi-chevron-right'" @click="navVisible = true"></v-btn>
        <PostHtmlDevCard v-if="choose === 'post-html'"></PostHtmlDevCard>
    </div>
</template>
<script>
import PostHtmlDevCard from '@/components/dev/PostHtmlDevCard.vue';
import { globalProperties } from '@/main';
import { getCancelLoadMsg, getLoadMsg } from '@/utils/loading';
import { ref } from 'vue';

export default {
    props: {
    },
    setup() {

        let drawer = ref(true);
        let choose = ref('post-html');
        const rail = ref(true);
        const deviceType = globalProperties.$deviceType;
        const navVisible = ref(false);
        const themeColor = globalProperties.$themeColor;
        return {
            themeColor,
            choose,
            drawer,
            rail,
            deviceType,
            navVisible
        }
    },
    components: {
        PostHtmlDevCard,
    },
    data() {
        return {
        }
    },
    methods: {
        setLoading(msg) {
            this.$emit('set_loading', msg);
        },
    },
    mounted() {
        this.setLoading(getLoadMsg("正在加载开发信息..."));
        this.itemType = this.init_type;
        this.itemId = this.init_id;
        this.setLoading(getCancelLoadMsg());
    }
}
</script>
<style scoped>
.user-list-card {
    padding: 10px;
}

.mobile-menu-btn {
  position: fixed;
  bottom: 50%;
  left: 0px;
  z-index: 100;
}

.dialog-card-container {
    display: flex;
    justify-content: center;
}

.menu-btn {
  position: fixed;
  bottom: 50%;
  right: -15px;
  z-index: 100;
}


@media screen and (min-width: 1000px) {
    .full-center {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }

    .card {
        margin: 20px;
        width: 1000px;
        max-height: 800px;
        padding: 20px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 650px;
        overflow: auto;
    }

}

@media screen and (max-width: 1000px) {

    .full-center {
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
    }

    .card {
        width: 90vw;
        max-height: 90vh;
        padding: 15px;
    }

    .column-div-scroll {
        display: flex;
        flex-direction: column;
        max-height: 80vh;
        overflow: auto;
    }
}
</style>