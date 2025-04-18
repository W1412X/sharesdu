/**
 * A function to get the current device type
 * @returns mobile/desktop
 */
export function getDeviceType() {
    /**
     * get the device type
     */
    var deviceType="";
    if (window.innerWidth <= 1000) {
      deviceType = 'mobile';
    } else {
      deviceType = 'desktop';
    }
    return deviceType
  }

export function getDeviceTypeByAgent() {
    const userAgent = navigator.userAgent;
  
    if (/mobile/i.test(userAgent)) {
      return 'mobile'; // 手机
    } else if (/tablet/i.test(userAgent)) {
      return 'tablet'; // 平板
    } else {
      return 'desktop'; // 电脑
    }
  }