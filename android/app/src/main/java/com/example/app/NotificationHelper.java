package com.example.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

/** Creates the notification channel and posts the daily-rates notification. */
public final class NotificationHelper {

    public static final String CHANNEL_ID = "daily_rates";
    public static final int NOTIFICATION_ID = 2002;

    private NotificationHelper() {}

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager mgr = context.getSystemService(NotificationManager.class);
            if (mgr == null) return;
            NotificationChannel channel = mgr.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Daily Exchange Rates",
                        NotificationManager.IMPORTANCE_DEFAULT);
                channel.setDescription("Your daily currency exchange rate update.");
                mgr.createNotificationChannel(channel);
            }
        }
    }

    public static void show(Context context, String title, String body) {
        ensureChannel(context);

        Intent launch = context.getPackageManager()
                .getLaunchIntentForPackage(context.getPackageName());
        PendingIntent contentIntent = null;
        if (launch != null) {
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            contentIntent = PendingIntent.getActivity(context, 0, launch, flags);
        }

        int smallIcon = context.getApplicationInfo().icon;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(smallIcon)
                .setContentTitle(title)
                .setContentText(body.replace("\n", "  •  "))
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true);

        if (contentIntent != null) {
            builder.setContentIntent(contentIntent);
        }

        Notification notification = builder.build();

        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification);
        } catch (SecurityException ignored) {
            // POST_NOTIFICATIONS not granted on Android 13+. Silently ignore.
        }
    }
}
