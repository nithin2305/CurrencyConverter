import { Injectable } from '@angular/core';
import { registerPlugin, Capacitor } from '@capacitor/core';

export interface RatePair {
  base: string;
  quote: string;
}

export interface NotifStatus {
  enabled: boolean;
  hour: number;
  minute: number;
  hasPermission: boolean;
  pairs: RatePair[];
}

export interface ScheduleOptions {
  enabled: boolean;
  hour: number;
  minute: number;
  pairs: RatePair[];
}

interface RateNotifierPlugin {
  requestPermission(): Promise<{ granted: boolean }>;
  schedule(opts: ScheduleOptions): Promise<NotifStatus>;
  cancel(): Promise<NotifStatus>;
  triggerNow(): Promise<void>;
  getStatus(): Promise<NotifStatus>;
}

// Bridges to the native Android plugin (com.example.app.RateNotifierPlugin).
// On the web this is a no-op proxy that rejects, so callers guard with `isNative`.
const RateNotifier = registerPlugin<RateNotifierPlugin>('RateNotifier');

@Injectable({ providedIn: 'root' })
export class NotificationService {
  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  requestPermission(): Promise<{ granted: boolean }> {
    return RateNotifier.requestPermission();
  }

  schedule(opts: ScheduleOptions): Promise<NotifStatus> {
    return RateNotifier.schedule(opts);
  }

  cancel(): Promise<NotifStatus> {
    return RateNotifier.cancel();
  }

  triggerNow(): Promise<void> {
    return RateNotifier.triggerNow();
  }

  getStatus(): Promise<NotifStatus> {
    return RateNotifier.getStatus();
  }
}
