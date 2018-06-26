package com.nim_reactnative_demo;

import android.app.Application;
import android.util.Log;

import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.ReactApplication;
import io.realm.react.RealmReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.imagepicker.ImagePickerPackage;
import com.netease.nim.rn.push.NIMPushPackage;
import com.nim_reactnative_demo.common.log.LogUtil;
import com.oblador.vectoricons.VectorIconsPackage;
import com.rnfs.RNFSPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new ReactVideoPackage(),
                    new RNFSPackage(),
                    new RealmReactPackage(),
                    new VectorIconsPackage(),
                    new ImagePickerPackage(),
                    new NIMPushPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        AppCache.setContext(this);
        LogUtil.init("app", Log.DEBUG);
        SoLoader.init(this, /* native exopackage */ false);
    }
}
