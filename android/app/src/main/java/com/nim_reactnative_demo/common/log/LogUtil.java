package com.nim_reactnative_demo.common.log;


import android.content.Context;
import android.os.Environment;
import android.text.TextUtils;

import com.netease.nimlib.log.sdk.LogBase;
import com.netease.nimlib.log.sdk.wrapper.NimLog;
import com.nim_reactnative_demo.AppCache;

import java.io.File;
import java.io.IOException;

public class LogUtil extends NimLog {

    private static final String LOG_FILE_NAME_PREFIX = "demo_native";

    public static void init(String dirName, int level) {
        final String logDir = getAppCacheDir(AppCache.getContext()) + File.separator + dirName;
        final LogBase.LogInterceptor interceptor = new LogBase.LogInterceptor() {
            @Override
            public boolean checkValidBeforeWrite() {
                return ExternalStorage.checkStorageValid(AppCache.getContext());
            }
        };

        NimLog.initDateNLog(null, logDir, LOG_FILE_NAME_PREFIX, level, 0, 0, true, interceptor);
    }

    private static String getAppCacheDir(final Context context) {
        String storageRootPath = null;
        try {
            // SD卡应用扩展存储区(APP卸载后，该目录下被清除，用户也可以在设置界面中手动清除)，请根据APP对数据缓存的重要性及生命周期来决定是否采用此缓存目录.
            // 该存储区在API 19以上不需要写权限，即可配置 <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="18"/>
            if (context.getExternalCacheDir() != null) {
                storageRootPath = context.getExternalCacheDir().getCanonicalPath();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        if (TextUtils.isEmpty(storageRootPath)) {
            // SD卡应用公共存储区(APP卸载后，该目录不会被清除，下载安装APP后，缓存数据依然可以被加载。SDK默认使用此目录)，该存储区域需要写权限!
            storageRootPath = Environment.getExternalStorageDirectory() + "/" + context.getPackageName();
        }

        return storageRootPath;
    }

    public static void ui(String msg) {
        getLog().i("ui", buildMessage(msg));
    }
}
