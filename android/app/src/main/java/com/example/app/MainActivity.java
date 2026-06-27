package com.example.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the custom plugin before the bridge is created.
        registerPlugin(RateNotifierPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
