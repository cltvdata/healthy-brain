export const PUBLIC_APP_URL = 'https://ais-pre-5nojwrqi4oxavhsuuii6iq-100403363829.us-west2.run.app';

/**
 * Returns the public base URL of the app.
 * Automatically filters out dev/studio domains so share links and QR codes always point to the clean public production app.
 */
export function getPublicBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    const origin = window.location.origin;
    if (
      !origin.includes('aistudio.google.com') && 
      !origin.includes('ais-dev') &&
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1')
    ) {
      return origin;
    }
  }
  return PUBLIC_APP_URL;
}

/**
 * Returns the absolute URL for downloading healthy-brain.apk (for QR codes and share links)
 */
export function getApkDownloadUrl(): string {
  return `${getPublicBaseUrl()}/healthy-brain.apk`;
}

/**
 * Triggers direct APK download with fallback to Blob fetching for webviews/mobile browsers
 */
export async function triggerApkDownload(): Promise<boolean> {
  const apkPath = '/healthy-brain.apk';
  const apkUrl = getApkDownloadUrl();
  try {
    // Attempt standard direct download first
    const link = document.createElement('a');
    link.href = apkPath;
    link.download = 'healthy-brain.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.warn('Standard APK download failed, triggering blob fallback:', err);
    try {
      const response = await fetch(apkPath);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'healthy-brain.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      return true;
    } catch (blobErr) {
      console.error('Blob download failed, opening in new window:', blobErr);
      window.open(apkUrl, '_blank');
      return false;
    }
  }
}





