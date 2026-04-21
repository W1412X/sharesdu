<template>
    <div class="full-center">
        <div class="panel">
            <div class="title">账户已被封禁</div>
            <p class="hint">您的账号当前无法使用本站服务。如有疑问，请联系管理员了解详情。</p>
            <v-btn
                class="action"
                variant="outlined"
                :color="themeColor"
                text="前往首页"
                @click="goHome"
            />
        </div>
    </div>
</template>

<script>
import { globalProperties } from '@/main';
import { openPage } from '@/utils/other';

export default {
    name: 'BannedPage',
    setup() {
        const themeColor = globalProperties.$themeColor;
        return { themeColor };
    },
    methods: {
        goHome() {
            openPage('router', { name: 'WelcomePage' });
        },
    },
};
</script>

<style scoped>
.panel {
    width: max-content;
    max-width: min(92vw, 420px);
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.title {
    font-size: var(--font-size-title-big);
    font-weight: 600;
    margin-bottom: 12px;
    line-height: 1.35;
}

.hint {
    margin: 0 0 20px;
    font-size: var(--font-size-body, 15px);
    line-height: 1.6;
    color: rgba(var(--v-theme-on-surface), 0.72);
}

.action {
    align-self: flex-start;
}

@media screen and (min-width: 1000px) {
    .full-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin-top: 20px;
    }
}

@media screen and (max-width: 1000px) {
    .full-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin-top: 20px;
        padding: 0 16px;
    }
}
</style>
