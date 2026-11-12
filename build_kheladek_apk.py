#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

def run(cmd, cwd=None):
    print(f"==> Running: {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ERROR:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        sys.exit(1)
    return res.stdout

BUILD_DIR = "/tmp/kheladek_apk_build"
if os.path.exists(BUILD_DIR):
    shutil.rmtree(BUILD_DIR)

os.makedirs(f"{BUILD_DIR}/src/com/kheladek/app", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/gen", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/obj", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/values", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/mipmap-hdpi", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/mipmap-mdpi", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/mipmap-xhdpi", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/mipmap-xxhdpi", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/assets/www", exist_ok=True)

# 1. Convert and Copy App Icon as real PNG
logo_path = "/app/applet/src/assets/images/kheladekh_logo_1793952334814.jpg"
if os.path.exists(logo_path):
    from PIL import Image
    im = Image.open(logo_path).convert("RGBA")
    sizes = {"mdpi": (48, 48), "hdpi": (72, 72), "xhdpi": (96, 96), "xxhdpi": (144, 144)}
    for folder, size in sizes.items():
        resized = im.resize(size, Image.Resampling.LANCZOS)
        resized.save(f"{BUILD_DIR}/res/mipmap-{folder}/ic_launcher.png", format="PNG")

# 2. strings.xml
with open(f"{BUILD_DIR}/res/values/strings.xml", "w") as f:
    f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">KhelaDek</string>
</resources>
''')

# 3. styles.xml
with open(f"{BUILD_DIR}/res/values/styles.xml", "w") as f:
    f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.NoTitleBar.Fullscreen">
        <item name="android:windowBackground">@android:color/black</item>
    </style>
</resources>
''')

# 4. AndroidManifest.xml
with open(f"{BUILD_DIR}/AndroidManifest.xml", "w") as f:
    f.write('''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.kheladek.app"
    android:versionCode="24"
    android:versionName="2.4.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name="com.kheladek.app.MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true"
            android:screenOrientation="sensor">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
''')

# 5. MainActivity.java
with open(f"{BUILD_DIR}/src/com/kheladek/app/MainActivity.java", "w") as f:
    f.write('''package com.kheladek.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                             WindowManager.LayoutParams.FLAG_FULLSCREEN);

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(Color.BLACK);
        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        mWebView.setWebChromeClient(new WebChromeClient());

        setContentView(mWebView);
        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
''')

# 6. Splash & App HTML in assets/www/index.html
with open(f"{BUILD_DIR}/assets/www/index.html", "w") as f:
    f.write('''<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KhelaDek App</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #080B12; color: #fff; height: 100vh; overflow-x: hidden; }
        
        /* Splash Screen */
        #splash {
            position: fixed; inset: 0; background: #080B12; z-index: 9999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            transition: opacity 0.5s ease;
        }
        .splash-logo { width: 90px; height: 90px; border-radius: 24px; box-shadow: 0 0 35px rgba(0,183,255,0.6); animation: pulse 1.5s infinite; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #00B7FF; border-radius: 50%; animation: spin 0.8s linear infinite; margin-top: 25px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        /* Main App Interface */
        header { background: #101722; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
        .logo-txt { font-size: 18px; font-weight: 900; }
        .badge { background: #16D98A; color: #000; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 12px; }
        .content { padding: 16px; }
        .card { background: #151E2B; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 16px; margin-bottom: 16px; }
        .live-tag { background: #EF4444; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 8px; }
        .match-title { font-size: 16px; font-weight: 800; margin-bottom: 8px; }
        .score { font-size: 14px; color: #16D98A; font-weight: bold; margin-bottom: 12px; }
        .player-mock { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .play-btn { width: 50px; height: 50px; border-radius: 50%; background: #00B7FF; display: flex; align-items: center; justify-content: center; color: #080B12; font-size: 20px; font-weight: bold; cursor: pointer; }
        .channels-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 12px; }
        .channel-btn { background: #1E293B; border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; color: #fff; text-align: center; font-size: 12px; font-weight: bold; cursor: pointer; }
        .channel-btn:active { background: #00B7FF; color: #000; }
    </style>
</head>
<body>
    <!-- Splash Screen (Auto-dismisses in 2 seconds) -->
    <div id="splash">
        <img class="splash-logo" src="../mipmap-hdpi/ic_launcher.png" alt="Logo" onerror="this.style.display='none'">
        <h2 style="margin-top: 16px; font-weight: 900; font-size: 22px; letter-spacing: -0.5px;">Khela<span style="color:#00B7FF;">Dek</span></h2>
        <p style="font-size: 12px; color: #16D98A; font-weight: bold; margin-top: 4px;">অফিশিয়াল অ্যান্ড্রয়েড অ্যাপ v2.4.0</p>
        <div class="spinner"></div>
        <p style="font-size: 11px; color: #94A3B8; margin-top: 12px;">বাফারমুক্ত ১০৮০p সার্ভার লোড হচ্ছে...</p>
    </div>

    <!-- App Shell -->
    <header>
        <div class="logo-txt">Khela<span style="color:#00B7FF;">Dek</span></div>
        <span class="badge">PRO AD-FREE</span>
    </header>

    <div class="content">
        <div class="card">
            <span class="live-tag">🔴 সরাসরি সম্প্রচার</span>
            <div class="match-title">বাংলাদেশ বনাম শ্রীলঙ্কা — ২য় টি-টোয়েন্টি</div>
            <div class="score">BAN 164/5 (18.4 ov) | SL 160/7</div>
            <div class="player-mock">
                <div class="play-btn" onclick="alert('আল্ট্রা এইচডি ১০৮০p স্ট্রিমিং চালু হচ্ছে...')">▶</div>
            </div>
        </div>

        <div class="card">
            <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 8px;">📺 লাইভ স্পোর্টস টিভি চ্যানেল</h3>
            <div class="channels-grid">
                <button class="channel-btn" onclick="alert('টি স্পোর্টস লাইভ স্ট্রিম সংযুক্ত হচ্ছে...')">টি স্পোর্টস (T Sports HD)</button>
                <button class="channel-btn" onclick="alert('জিটিভি লাইভ স্ট্রিম সংযুক্ত হচ্ছে...')">জিটিভি (GTV Live)</button>
                <button class="channel-btn" onclick="alert('স্টার স্পোর্টস ১ লাইভ স্ট্রিম সংযুক্ত হচ্ছে...')">স্টার স্পোর্টস ১ HD</button>
                <button class="channel-btn" onclick="alert('সনি টেন ২ লাইভ স্ট্রিম সংযুক্ত হচ্ছে...')">সনি টেন ২ HD</button>
            </div>
        </div>
    </div>

    <script>
        setTimeout(function() {
            var splash = document.getElementById('splash');
            splash.style.opacity = '0';
            setTimeout(function() {
                splash.style.display = 'none';
            }, 500);
        }, 2000);
    </script>
</body>
</html>
''')

# 7. Compile Resources with aapt
ANDROID_JAR = "/usr/lib/android-sdk/platforms/android-23/android.jar"
print("--> Generating R.java and package base...")
run(f"aapt package -f -m -J {BUILD_DIR}/gen -M {BUILD_DIR}/AndroidManifest.xml -S {BUILD_DIR}/res -I {ANDROID_JAR}")

# 8. Compile Java classes with ecj
print("--> Compiling Java sources with ecj...")
run(f"ecj -proc:none -d {BUILD_DIR}/obj -cp {ANDROID_JAR} -source 1.8 -target 1.8 {BUILD_DIR}/src/com/kheladek/app/MainActivity.java {BUILD_DIR}/gen/com/kheladek/app/R.java")

# 9. Convert to DEX with dalvik-exchange (dx)
print("--> Converting classes to DEX bytecode...")
run(f"/usr/bin/dalvik-exchange --dex --output={BUILD_DIR}/classes.dex {BUILD_DIR}/obj")

# 10. Package APK with aapt
print("--> Packaging APK with aapt...")
run(f"aapt package -f -M {BUILD_DIR}/AndroidManifest.xml -S {BUILD_DIR}/res -A {BUILD_DIR}/assets -I {ANDROID_JAR} -F {BUILD_DIR}/unaligned.apk")

# 11. Add classes.dex into unaligned.apk
print("--> Adding classes.dex to APK...")
run(f"aapt add {BUILD_DIR}/unaligned.apk classes.dex", cwd=BUILD_DIR)

# 12. ZipAlign
print("--> Zipaligning APK...")
run(f"zipalign -f -v 4 {BUILD_DIR}/unaligned.apk {BUILD_DIR}/aligned.apk")

# 13. Generate Release Keystore
KEYSTORE = f"{BUILD_DIR}/kheladek.keystore"
print("--> Generating release keystore...")
run(f"keytool -genkeypair -v -keystore {KEYSTORE} -alias kheladek -keyalg RSA -keysize 2048 -validity 10000 -storepass kheladek2026 -keypass kheladek2026 -dname 'CN=KhelaDek, OU=App, O=KhelaDek, L=Dhaka, ST=Dhaka, C=BD'")

# 14. Sign APK with apksigner (v1 + v2 signatures)
FINAL_APK = "/app/applet/public/KhelaDek-v2.4.0.apk"
FINAL_BACKUP = "/app/applet/public/downloads/KhelaDek-v2.4.0.apk"
print("--> Signing APK with apksigner (v1 + v2)...")
run(f"apksigner sign --ks {KEYSTORE} --ks-pass pass:kheladek2026 --ks-key-alias kheladek --key-pass pass:kheladek2026 --out {FINAL_APK} {BUILD_DIR}/aligned.apk")

# Copy to backup location
shutil.copy(FINAL_APK, FINAL_BACKUP)

# 15. Verify APK with apksigner
print("--> Verifying APK signature...")
verify_output = run(f"apksigner verify -v {FINAL_APK}")
print("Verification Result:\n" + verify_output)

final_size = os.path.getsize(FINAL_APK)
print(f"SUCCESS: Real signed APK created at {FINAL_APK} ({final_size} bytes)")
