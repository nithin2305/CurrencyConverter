package com.example.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import java.util.Calendar;

/** Schedules / cancels the daily inexact alarm that triggers the rate fetch. */
public final class AlarmScheduler {

    public static final String PREFS = "rate_notifier_prefs";
    public static final String ACTION_DAILY = "com.example.app.DAILY_RATE_ALARM";
    private static final int REQUEST_CODE = 1001;

    private AlarmScheduler() {}

    private static PendingIntent buildPendingIntent(Context context) {
        Intent intent = new Intent(context, RateAlarmReceiver.class);
        intent.setAction(ACTION_DAILY);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags);
    }

    /** Reads saved config and (re)schedules the alarm, or cancels it if disabled. */
    public static void schedule(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        PendingIntent pi = buildPendingIntent(context);
        am.cancel(pi);

        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean enabled = prefs.getBoolean("enabled", false);
        if (!enabled) return;

        int hour = prefs.getInt("hour", 10);
        int minute = prefs.getInt("minute", 0);

        Calendar next = Calendar.getInstance();
        next.set(Calendar.HOUR_OF_DAY, hour);
        next.set(Calendar.MINUTE, minute);
        next.set(Calendar.SECOND, 0);
        next.set(Calendar.MILLISECOND, 0);
        if (next.getTimeInMillis() <= System.currentTimeMillis()) {
            next.add(Calendar.DAY_OF_YEAR, 1);
        }

        // Inexact "allow while idle" alarm: works in Doze, needs no special permission.
        // The receiver reschedules the next day after each fire.
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), pi);
    }

    public static void cancel(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        am.cancel(buildPendingIntent(context));
    }
}
