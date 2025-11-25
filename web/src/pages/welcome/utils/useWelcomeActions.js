/**
 * WelcomePage 操作管理 Composable
 */
import { openPage } from '@/utils/navigation';

export function useWelcomeActions(setDownloadState) {
  /**
   * 下载 APP
   */
  const downloadApp = () => {
    setDownloadState(true);
  };
  
  /**
   * 打开 URL
   * @param {String} url - URL 地址
   */
  const openUrl = (url) => {
    openPage('url', { url: url });
  };
  
  /**
   * 下载 iOS 配置文件
   */
  const downloadIOS = () => {
    const a = document.createElement('a');
    a.href = '/app/ios/sharesdu.mobileconfig';
    a.download = 'sharesdu.mobileconfig';
    document.body.appendChild(a);
    a.click();
    a.href = '/app/ios/sharesdu.mobileprovision';
    a.download = 'sharesdu.mobileprovision';
    a.click();
    document.body.removeChild(a);
  };
  
  return {
    downloadApp,
    openUrl,
    downloadIOS,
  };
}

