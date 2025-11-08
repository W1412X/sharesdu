<template>
    <v-btn :loading="loading" :disabled="loading" @click="click" elevation="0" icon :style="{
        'width': size + 'px',
        'height': size + 'px',
        'border-radius': '100%',
    }">
        <v-icon :color="color" :size="size" :icon="heart"></v-icon>
        <v-tooltip activator="parent">点赞</v-tooltip>
    </v-btn>
</template>
<script>
import { likeContent, unlikeContent } from '@/api/modules/like';
import { getNormalErrorAlert } from '@/utils/other';
import { computed } from 'vue';
export default {
    props: {
        type: {
            type: String,
            default: 'answer',
        },
        id: {
            type: String,
            default: '00000000',
        },
        state: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: '24',
        },
    },
    data() {
        const ifClicked = this.state;
        const color = computed(() => {
            return this.ifClicked ? '#db261f' : '#8a8a8a';
        })
        const heart = computed(() => {
            return this.ifClicked ? 'mdi-heart' : 'mdi-heart-outline';
        });
        return {
            color,
            ifClicked,
            heart,
            ifClickable: true,
            loading:false,
        }
    },
    components: {
    },
    methods: {
        async click() {
            if (!this.ifClickable) return;
            this.ifClickable = false;
            let type = -1;
            switch (this.type) {
                case 'article':
                    type = 0;
                    break;
                case 'reply':
                    type = 2;
                    break;
                case 'post':
                    type = 1;
                    break;
                default:
                    type = -1;
                    break;
            }
            let response = { status: -1, message: "网络错误" };
            try {
                if (this.ifClicked) {//liked
                    this.loading=true;
                    response = await unlikeContent(type, this.id);
                    this.loading=false;
                } else {
                    this.loading=true;
                    response = await likeContent(type, this.id);
                    this.loading=false;
                }
                if (response.status == 200) {
                    this.ifClicked = !this.ifClicked;
                } else {
                    this.alert(getNormalErrorAlert(response.message));
                }
            } catch (e) {
                this.loading=false;
                this.alert(getNormalErrorAlert("未知错误，请查看控制台"));
            }
            setTimeout(() => {
                this.ifClickable = true;
            }, 2000)
        },
        setLoading(msg) {
            this.$emit("set_loading", msg);
        },
        alert(msg) {
            this.$emit("alert", msg);
        }
    }
}
</script>