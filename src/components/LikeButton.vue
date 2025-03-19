<template>
    <v-btn @click="click" elevation="0" icon :style="{
        'width': size + 'px',
        'height': size + 'px',
        'border-radius': '100%',
    }">
        <v-icon :color="color" :size="size" :icon="heart"></v-icon>
    </v-btn>
</template>
<script>
import { likeContent, unlikeContent } from '@/axios/like';
import { getCancelLoadMsg, getLoadMsg, getNormalErrorAlert } from '@/utils/other';
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
                    this.setLoading(getLoadMsg("正在取消点赞..."));
                    response = await unlikeContent(type, this.id);
                    this.setLoading(getCancelLoadMsg());
                } else {
                    this.setLoading(getLoadMsg("正在点赞..."));
                    response = await likeContent(type, this.id);
                    this.setLoading(getCancelLoadMsg());
                }
                if (response.status == 200) {
                    this.ifClicked = !this.ifClicked;
                } else {
                    this.alert(getNormalErrorAlert(response.message));
                }
            } catch (e) {
                this.setLoading(getCancelLoadMsg());
                this.alert(getNormalErrorAlert("未知错误，请查看控制台"));
                console.log(e);
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