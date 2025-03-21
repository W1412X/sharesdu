<template>
    <div class="full-center">
        <div class="title">
            (￣_￣)・・・ <br />{{ reason }}
        </div>
    </div>
</template>
<script>
import { getCancelLoadMsg } from '@/utils/other';

export default {
    name: 'ErrorPage',
    setup() {
        return {
        }
    },
    data() {
        return {
            reason: "",
        }
    },
    methods: {
    },
    mounted() {
        this.setLoading(getCancelLoadMsg());
        if ('reason' in this.$route.params) {
            this.reason = this.$route.params.reason;
        }
    }
}
</script>
<style scoped>
/** desktop */
@media screen and (min-width: 600px) {
    .full-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin-top: 20px;

    }
    .title {
        width: fit-content;
        font-size: 28px;
        font-weight: 600;
        margin: 10px;

    }
}

/** mobile */
@media screen and (max-width: 600px) {
    .full-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        height: 100%;
        margin-top: 20px;

    }
    .title {
        width: fit-content;
        font-size: 28px;
        font-weight: 600;
        margin: 10px;

    }
}
</style>