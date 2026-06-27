package com.example.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Fired daily at the configured time. Fetches rates, notifies, reschedules. */
public class RateAlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        final PendingResult pending = goAsync();
        final Context appCtx = context.getApplicationContext();
        new Thread(() -> {
            try {
                RateFetcher.fetchAndNotify(appCtx, false);
            } finally {
                // Schedule tomorrow's alarm and release the broadcast.
                AlarmScheduler.schedule(appCtx);
                pending.finish();
            }
        }).start();
    }
}
