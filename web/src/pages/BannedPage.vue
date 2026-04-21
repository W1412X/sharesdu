<template>
    <div class="full-center">
        <div class="panel">
            <div class="title">账户已被封禁</div>
            <p class="hint">
                您的账号当前无法使用本站服务。如有疑问，请联系管理员了解详情。
            </p>

            <div v-if="serverMessage" class="detail-block">
                <div class="detail-label">系统说明</div>
                <p class="detail-text">{{ serverMessage }}</p>
            </div>

            <div v-if="blockReason" class="detail-block">
                <div class="detail-label">封禁原因</div>
                <p class="detail-text">{{ blockReason }}</p>
            </div>

            <div v-if="accountLine" class="detail-block muted">
                <div class="detail-label">账号</div>
                <p class="detail-text">{{ accountLine }}</p>
            </div>

            <div v-if="endTimeSectionVisible" class="detail-block">
                <div class="detail-label">预计解封时间</div>
                <p class="detail-text">{{ endTimeDisplay }}</p>
                <p v-if="countdownLine" class="countdown">{{ countdownLine }}</p>
            </div>
        </div>

        <v-btn
            class="action"
            variant="outlined"
            :color="themeColor"
            text="前往首页"
            @click="goHome"
        />
    </div>
</template>

<script>
import { globalProperties } from '@/main';
import { openPage } from '@/utils/other';
import { BANNED_PAGE_INFO_KEY } from '@/utils/auth';

const PERMANENT_REMAINING_MS = 100 * 365 * 24 * 60 * 60 * 1000;

function parseBlockEndTime(raw) {
    if (raw == null || raw === '') return null;
    if (typeof raw === 'number') {
        const ms = raw < 1e12 ? raw * 1000 : raw;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatCountdown(ms) {
    if (ms <= 0) return '封禁期已满，您可尝试重新登录';
    if (ms > PERMANENT_REMAINING_MS) {
        return '当前为长期或永久类封禁，具体解封规则请联系管理员';
    }
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `剩余 ${d} 天 ${h} 小时 ${m} 分 ${sec} 秒`;
}

export default {
    name: 'BannedPage',
    setup() {
        const themeColor = globalProperties.$themeColor;
        return { themeColor };
    },
    data() {
        return {
            serverMessage: '',
            blockReason: '',
            accountLine: '',
            endTimeDisplay: '',
            countdownLine: '',
            endTimeSectionVisible: false,
            countdownEndDate: null,
            countdownIntervalId: null,
        };
    },
    mounted() {
        this.loadStoredInfo();
        this.startCountdown();
    },
    beforeUnmount() {
        if (this.countdownIntervalId != null) {
            clearInterval(this.countdownIntervalId);
        }
    },
    methods: {
        loadStoredInfo() {
            try {
                const raw = sessionStorage.getItem(BANNED_PAGE_INFO_KEY);
                if (!raw) return;
                const info = JSON.parse(raw);
                if (info.message) {
                    this.serverMessage = String(info.message);
                }
                if (info.block_reason) {
                    this.blockReason = String(info.block_reason);
                }
                const name = info.user_name ? String(info.user_name) : '';
                const id = info.user_id != null && info.user_id !== '' ? String(info.user_id) : '';
                if (name && id) {
                    this.accountLine = `${name}（ID ${id}）`;
                } else if (name) {
                    this.accountLine = name;
                } else if (id) {
                    this.accountLine = `用户 ID ${id}`;
                }

                const end = parseBlockEndTime(info.block_end_time);
                if (end) {
                    this.countdownEndDate = end;
                    this.endTimeDisplay = end.toLocaleString('zh-CN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    });
                    this.endTimeSectionVisible = true;
                } else if (info.block_end_time != null && info.block_end_time !== '') {
                    this.endTimeDisplay = String(info.block_end_time);
                    this.endTimeSectionVisible = true;
                } else {
                    this.endTimeDisplay = '未提供预计解封时间，可能为长期封禁，请联系管理员确认。';
                    this.endTimeSectionVisible = true;
                }
            } catch (e) {
                console.error(e);
            }
        },
        startCountdown() {
            if (!this.countdownEndDate) {
                return;
            }
            const tick = () => {
                this.countdownLine = formatCountdown(this.countdownEndDate.getTime() - Date.now());
            };
            tick();
            this.countdownIntervalId = setInterval(tick, 1000);
        },
        goHome() {
            openPage('router', { name: 'WelcomePage' });
        },
    },
};
</script>

<style scoped>
.full-center {
    box-sizing: border-box;
    min-height: 100dvh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px 48px;
}

.panel {
    width: 100%;
    max-width: min(92vw, 440px);
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
    line-height: 1.65;
    color: rgba(var(--v-theme-on-surface), 0.72);
}

.detail-block {
    margin-bottom: 16px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(var(--v-theme-on-surface), 0.04);
}

.detail-block.muted {
    background: rgba(var(--v-theme-on-surface), 0.03);
}

.detail-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: rgba(var(--v-theme-on-surface), 0.55);
    margin-bottom: 6px;
    text-transform: uppercase;
}

.detail-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(var(--v-theme-on-surface), 0.85);
    white-space: pre-wrap;
    word-break: break-word;
}

.countdown {
    margin: 10px 0 0;
    font-size: 15px;
    font-weight: 600;
    color: rgb(var(--v-theme-primary));
    font-variant-numeric: tabular-nums;
}

.action {
    margin-top: 8px;
    align-self: center;
}
</style>
