import { useEffect, useState } from 'react';

declare global {
  interface BatteryManager extends EventTarget {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
  }

  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

const noop = () => {};

/**
 * Interfaces with the Battery Management API (if available; at present only in Chromium-based browsers)
 * to return the current battery charge level and charging status.
 */
const useBattery = () => {
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(true);

  useEffect(() => {
    let detachListeners: () => void = noop;

    const attachListeners = async () => {
      if (!navigator.getBattery) {
        return;
      }

      try {
        const batteryManager = await navigator.getBattery();

        const onLevelChange = () => {
          setBatteryLevel(Math.round(batteryManager.level * 100));
        };

        const onChargingChange = () => {
          setIsCharging(batteryManager.charging);
        };

        batteryManager.addEventListener('levelchange', onLevelChange);
        batteryManager.addEventListener('chargingchange', onChargingChange);

        onLevelChange();
        onChargingChange();

        detachListeners = () => {
          batteryManager.removeEventListener('levelchange', onLevelChange);
          batteryManager.removeEventListener(
            'chargingchange',
            onChargingChange
          );
        };
      } catch (e) {
        // failed to attach handlers; most likely the request was denied
      }
    };

    attachListeners();

    return () => detachListeners();
  }, [setBatteryLevel, setIsCharging]);

  return {
    batteryLevel,
    isCharging,
  };
};

export default useBattery;
