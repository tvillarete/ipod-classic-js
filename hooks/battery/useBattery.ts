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
  const [chargePercent, setChargePercent] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  useEffect(() => {
    let detachListeners: () => void = noop;

    const attachListeners = async () => {
      if (!navigator.getBattery) {
        return;
      }

      try {
        const batteryManager = await navigator.getBattery();

        const onLevelChange = () => {
          setChargePercent(Math.round(batteryManager.level * 100));
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
  }, [setChargePercent, setIsCharging]);

  return {
    chargePercent,
    isCharging,
  };
};

export default useBattery;
