package com.example.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

/**
 * Bridge between the Angular UI and the native daily-notification system.
 *
 * JS usage:
 *   const RateNotifier = registerPlugin('RateNotifier');
 *   await RateNotifier.requestPermission();
 *   await RateNotifier.schedule({ enabled:true, hour:10, minute:0,
 *                                 pairs:[{base:'USD',quote:'INR'}] });
 *   await RateNotifier.triggerNow();   // test immediately
 *   const status = await RateNotifier.getStatus();
 *   await RateNotifier.cancel();
 */
@CapacitorPlugin(name = "RateNotifier")
public class RateNotifierPlugin extends Plugin {

    private static final int PERM_REQUEST = 7321;

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(AlarmScheduler.PREFS, Context.MODE_PRIVATE);
    }

    private boolean hasNotifPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return true; // permission not required below Android 13
        }
        return ContextCompat.checkSelfPermission(getContext(),
                Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotifPermission()) {
            ActivityCompat.requestPermissions(getActivity(),
                    new String[]{Manifest.permission.POST_NOTIFICATIONS}, PERM_REQUEST);
        }
        JSObject ret = new JSObject();
        ret.put("granted", hasNotifPermission());
        call.resolve(ret);
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", true));
        int hour = call.getInt("hour", 10);
        int minute = call.getInt("minute", 0);
        JSArray pairs = call.getArray("pairs", new JSArray());

        SharedPreferences.Editor e = prefs().edit();
        e.putBoolean("enabled", enabled);
        e.putInt("hour", hour);
        e.putInt("minute", minute);
        e.putString("pairs", pairs.toString());
        e.apply();

        AlarmScheduler.schedule(getContext());
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        prefs().edit().putBoolean("enabled", false).apply();
        AlarmScheduler.cancel(getContext());
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void triggerNow(PluginCall call) {
        final Context ctx = getContext().getApplicationContext();
        new Thread(() -> RateFetcher.fetchAndNotify(ctx, true)).start();
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(buildStatus());
    }

    private JSObject buildStatus() {
        SharedPreferences p = prefs();
        JSObject ret = new JSObject();
        ret.put("enabled", p.getBoolean("enabled", false));
        ret.put("hour", p.getInt("hour", 10));
        ret.put("minute", p.getInt("minute", 0));
        ret.put("hasPermission", hasNotifPermission());
        try {
            ret.put("pairs", new JSArray(p.getString("pairs", "[]")));
        } catch (Exception ex) {
            ret.put("pairs", new JSArray());
        }
        return ret;
    }
}
