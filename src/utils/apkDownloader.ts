/**
 * KhelaDek APK Binary Downloader
 * Downloads the authentic 7.4 MB binary APK directly into browser memory
 * and saves it locally via Object URL, bypassing Android DownloadManager iframe cookie issues.
 */

export interface DownloadProgressCallback {
  (progress: number, statusText: string): void;
}

export async function downloadKhelaDekBinaryApk(
  onProgress?: DownloadProgressCallback
): Promise<boolean> {
  if (onProgress) {
    onProgress(10, 'সার্ভারের সাথে সংযোগ স্থাপন করা হচ্ছে...');
  }

  try {
    if (onProgress) {
      onProgress(30, 'আসল KhelaDek APK বাইনারি স্ট্রিম রিসিভ হচ্ছে...');
    }

    const response = await fetch('/api/download-apk', {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.android.package-archive, application/octet-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`সার্ভার স্ট্যাটাস: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('COOKIE_CHECK_HTML_DETECTED');
    }

    if (onProgress) {
      onProgress(60, 'অফিশিয়াল সাইনড APK প্যাকেজ প্রসেস করা হচ্ছে...');
    }

    const blob = await response.blob();

    // Verify it's not a tiny error page (valid APK is > 20KB)
    if (blob.size < 20000) {
      throw new Error('INCOMPLETE_FILE_SIZE');
    }

    if (onProgress) {
      onProgress(90, 'ফোনে KhelaDek-v2.4.0.apk সেভ করা হচ্ছে...');
    }

    // Force exact android package MIME type
    const apkBlob = new Blob([blob], {
      type: 'application/vnd.android.package-archive',
    });

    const objectUrl = window.URL.createObjectURL(apkBlob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'KhelaDek-v2.4.0.apk';
    link.setAttribute('style', 'display:none');
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      if (onProgress) {
        onProgress(100, 'ডাউনলোড সম্পন্ন! নোটিফিকেশন থেকে ফাইলটি ইনস্টল করুন।');
      }
    }, 1500);

    return true;
  } catch (error: any) {
    console.warn('In-memory download failed, falling back:', error);

    // Fallback: If inside an iframe and cookie check occurred, open standalone tab
    if (error.message === 'COOKIE_CHECK_HTML_DETECTED' || window.self !== window.top) {
      if (onProgress) {
        onProgress(
          0,
          'গুগল ফ্রেমের কারণে নতুন ট্যাবে ডিরেক্ট ডাউনলোড শুরু হচ্ছে...'
        );
      }
      window.open('/api/download-apk', '_blank');
      return false;
    }

    // Direct browser navigation
    window.location.href = '/api/download-apk';
    return false;
  }
}
