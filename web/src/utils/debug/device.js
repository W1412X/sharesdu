export function getBrowserInfo() {
    const nav = window.navigator;
    const screen = window.screen;
    const ua = nav.userAgent;
    let OS = 'Unknown';
    if (/Windows/.test(ua)) {
        OS = 'Windows';
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(ua)) {
        OS = 'macOS';
    } else if (/Linux/.test(ua)) {
        OS = 'Linux';
    } else if (/Android/.test(ua)) {
        OS = 'Android';
    } else if (/iPhone|iPad|iPod/.test(ua)) {
        OS = 'iOS';
    }
    let deviceType = 'Desktop';
    if (/Mobi|Android|iPhone|iPad|iPod/.test(ua)) {
        deviceType = 'Mobile';
    } else if (/Tablet|iPad/.test(ua)) {
        deviceType = 'Tablet';
    }
    let platform = 'Unknown';
    if (/Windows/.test(ua)) {
        platform = 'Windows';
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(ua)) {
        platform = 'Mac';
    } else if (/Linux/.test(ua)) {
        platform = 'Linux';
    } else if (/Android|iPhone|iPad|iPod/.test(ua)) {
        platform = 'Mobile';
    }
    const screenWidth = screen.width || 'Unknown';
    const screenHeight = screen.height || 'Unknown';
    const language = nav.language || nav.userLanguage || 'Unknown';
    let netWork = 'Unknown';
    if (nav.connection && nav.connection.effectiveType) {
        netWork = nav.connection.effectiveType;
    }
    let orientation = 'Unknown';
    if (window.screen.orientation && window.screen.orientation.type) {
        orientation = window.screen.orientation.type;
    } else if (typeof window.orientation !== 'undefined') {
        orientation = window.orientation === 0 || window.orientation === 180 ? 'portrait' : 'landscape';
    }
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    const browsers = [
        { name: 'Edg', re: /Edg\/([\d\.]+)/ },
        { name: 'Chrome', re: /Chrome\/([\d\.]+)/ },
        { name: 'Firefox', re: /Firefox\/([\d\.]+)/ },
        { name: 'Safari', re: /Version\/([\d\.]+).*Safari/ },
        { name: 'Opera', re: /OPR\/([\d\.]+)/ },
        { name: 'IE', re: /MSIE ([\d\.]+);|Trident.*rv:([\d\.]+)/ }
    ];
    for (let b of browsers) {
        const match = ua.match(b.re);
        if (match) {
            browserName = b.name;
            browserVersion = match[1] || match[2] || 'Unknown';
            break;
        }
    }
    const fingerprint = JSON.stringify({
        ua: ua,
        lang: language,
        res: `${screenWidth}x${screenHeight}`,
        platform: platform,
        timezone: new Date().getTimezoneOffset()
    });
    const userAgent = {
        appCodeName: nav.appCodeName || 'Unknown',
        appName: nav.appName || 'Unknown',
        appVersion: nav.appVersion || 'Unknown',
        language: language,
        platform: platform,
        raw: ua
    };

    let OSVersion = 'Unknown';
    const osVersions = {
        Windows: /Windows NT ([\d\.]+)/,
        macOS: /Mac OS X ([\d_\.]+)/,
        Android: /Android ([\d\.]+)/,
        iOS: /OS (\d+)_(\d+)_?(\d+)?/,
        Linux: /Linux ([\d\.]+)/
    };
    const osRe = osVersions[OS];
    if (osRe) {
        const match = ua.match(osRe);
        if (match) {
            if (OS === 'iOS') {
                OSVersion = match[1] + '.' + (match[2] || '0') + '.' + (match[3] || '0');
            } else {
                OSVersion = match[1];
            }
        }
    }

    return {
        deviceType: deviceType,
        OS: OS,
        OSVersion: OSVersion,
        platform: platform,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        language: language,
        netWork: netWork,
        orientation: orientation,
        browserInfo: {
            name: browserName,
            version: browserVersion
        },
        fingerprint: fingerprint,
        userAgent: userAgent
    };
}