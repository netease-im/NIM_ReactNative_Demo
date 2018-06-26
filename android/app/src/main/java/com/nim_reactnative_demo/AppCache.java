package com.nim_reactnative_demo;

import android.app.Application;
import android.content.Context;

public class AppCache {

    private static Application context;

    public static void setContext(Context context) {
        AppCache.context = (Application) context.getApplicationContext();
    }

    public static Context getContext() {
        return AppCache.context;
    }
}
