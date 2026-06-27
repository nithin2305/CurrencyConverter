package com.example.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

/** Fetches live rates and posts the daily notification. Runs off the main thread. */
public final class RateFetcher {

    private static final String TAG = "RateFetcher";
    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";

    private RateFetcher() {}

    /**
     * Fetch live rates, build the notification body from the configured pairs and post it.
     * @param notifyOnError when true, posts a notification if the fetch fails (used by "Test now").
     */
    public static void fetchAndNotify(Context context, boolean notifyOnError) {
        try {
            JSONObject rates = fetchRates();
            String body = buildBody(context, rates);
            if (body == null || body.isEmpty()) {
                body = "No currency pairs configured. Open the app to add some.";
            }
            NotificationHelper.show(context, "💱 Daily Exchange Rates", body);
        } catch (Exception e) {
            Log.e(TAG, "Failed to fetch/notify", e);
            if (notifyOnError) {
                NotificationHelper.show(context, "💱 Exchange Rates",
                        "Couldn't fetch rates right now. Please check your internet connection.");
            }
        }
    }

    private static JSONObject fetchRates() throws Exception {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(API_URL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int code = conn.getResponseCode();
            if (code != 200) {
                throw new RuntimeException("HTTP " + code);
            }

            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }

            JSONObject root = new JSONObject(sb.toString());
            return root.getJSONObject("rates");
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    /** Build the multi-line notification body from the saved pair list. */
    private static String buildBody(Context context, JSONObject rates) {
        SharedPreferences prefs =
                context.getSharedPreferences(AlarmScheduler.PREFS, Context.MODE_PRIVATE);
        String pairsJson = prefs.getString("pairs", "[]");

        StringBuilder out = new StringBuilder();
        try {
            JSONArray pairs = new JSONArray(pairsJson);
            for (int i = 0; i < pairs.length(); i++) {
                JSONObject p = pairs.getJSONObject(i);
                String base = p.optString("base", "USD").toUpperCase(Locale.US);
                String quote = p.optString("quote", "INR").toUpperCase(Locale.US);

                if (!rates.has(base) || !rates.has(quote)) continue;
                double baseRate = rates.getDouble(base);
                double quoteRate = rates.getDouble(quote);
                if (baseRate == 0) continue;

                double value = quoteRate / baseRate;
                if (out.length() > 0) out.append("\n");
                out.append("1 ").append(base).append(" = ")
                        .append(formatRate(value)).append(" ").append(quote);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to build body", e);
        }
        return out.toString();
    }

    private static String formatRate(double v) {
        if (v >= 1) {
            return String.format(Locale.US, "%,.2f", v);
        }
        return String.format(Locale.US, "%.4f", v);
    }
}
