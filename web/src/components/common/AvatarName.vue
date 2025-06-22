<!--  -->
<template>
    <div class="avatar-name" @click="toAuthorPage">
        <v-icon v-if="this.profileUrl == null" icon="mdi-account-circle" :size="size" color='#bbbbbb'></v-icon>
        <v-avatar v-if="this.profileUrl != null" :size="size" :image="this.profileUrl"></v-avatar>
        <div v-if="ifShowName" :style="{ color: color, 'font-size': nameSize + 'px' }">
            {{ initData.name }}
        </div>
    </div>
</template>
<script>
import { globalProperties } from '@/main'
import { getCookie } from '@/utils/cookie'
import { globalProfileCacher } from '@/utils/global_img_cache'
import { acquireLock, releaseLock } from '@/utils/lock'
import { openPage } from '@/utils/other'
import { getProfileUrl } from '@/utils/profile'

export default {
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    name: null,
                }
            }
        },
        size: {
            type: String,
            default: '30'
        },
        color: {
            type: String,
            default: '#000'
        },
        clickable: {
            type: Boolean,
            default: true
        },
        ifShowName: {
            type: Boolean,
            default: true
        },
        nameSize: {
            type: String,
            default: '16'
        }
    },
    data() {
        return {
            profileUrl: null,
            time: 1000,
        }
    },
    methods: {
        toAuthorPage() {
            if (!this.clickable) {
                return;
            }
            if (getCookie("userId") == this.initData.id) {
                openPage("router",{
                    name: 'SelfPage',
                    params: {
                        id: this.initData.id
                    }
                });
            } else {
                openPage("router",{
                    name: 'AuthorPage',
                    params: {
                        id: this.initData.id
                    }
                })
            }
        },
        async getProfile() {
            /**
             * check global cache first  
             */
            let tmp = globalProfileCacher.getImage(globalProperties.$apiUrl + '/image/user?user_id=' + this.initData.id);
            if (tmp) {
                this.profileUrl = tmp;
                return;
            } else {
                let url = await getProfileUrl(this.initData.id);
                this.profileUrl = url;
            }
        },
    },
    // mounted()
    async mounted() {
        const lockKey = 'profile-' + this.initData.id;
        await acquireLock(lockKey);
        try {
            await this.getProfile(); // 这里不再重复加锁
        } finally {
            releaseLock(lockKey);
        }
    }
}
</script>
<style scoped>
.avatar-name {
    display: flex;
    align-items: center;
    gap: 10px;
}
</style>