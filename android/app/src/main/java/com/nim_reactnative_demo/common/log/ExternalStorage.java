package com.nim_reactnative_demo.common.log;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;

public class ExternalStorage {

    private static final String TAG = "ExternalStorage";

    private static boolean hasPermission = true; // 是否拥有存储卡权限

    /**
     * SD卡存储权限检查
     */
    private static boolean checkPermission(Context context) {
        if (context == null) {
            Log.e(TAG, "checkMPermission context null");
            return false;
        }

        // 写权限有了默认就赋予了读权限
        PackageManager pm = context.getPackageManager();
        if (PackageManager.PERMISSION_GRANTED !=
                pm.checkPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE, context.getApplicationInfo().packageName)) {
            Log.e(TAG, "without permission to access storage");
            return false;
        }

        return true;
    }

    /**
     * 有效性检查
     */
    public static boolean checkStorageValid(Context context) {
        if (hasPermission) {
            return true; // M以下版本&授权过的M版本不需要检查
        }

        hasPermission = checkPermission(context); // 检查是否已经获取权限了
        if (hasPermission) {
            Log.i(TAG, "get permission to access storage");
        }
        return hasPermission;
    }
}
