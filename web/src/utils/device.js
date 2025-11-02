/**
 * A function to get the current device type
 * @returns mobile/desktop
 */
export function getDeviceType() {
    /**
     * get the device type
     */
    let deviceType="";
    if (window.innerWidth <= 1000) {
      deviceType = 'mobile';
    } else {
      deviceType = 'desktop';
    }
    return deviceType
  }

  export function getDeviceTypeByAgent() {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android|iPhone|Windows Phone/i.test(userAgent)) {
        return 'mobile';
    }
    if (/iPad|Android.*Tablet/i.test(userAgent)) {
        return 'tablet';
    }
    return 'desktop';
}
