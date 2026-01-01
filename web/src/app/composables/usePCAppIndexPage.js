import { computed } from 'vue';

export function usePCAppIndexPage(deviceType, page) {
    return computed(() => {
        return deviceType.value == 'desktop' && page.value == 'IndexPage';
    });
}