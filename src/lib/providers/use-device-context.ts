import { useEffect, useState } from "react";

interface DeviceContext {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
    deviceType: "mobile" | "tablet" | "desktop";
}

export function useDeviceContext(): DeviceContext {
    const [deviceContext, setDeviceContext] = useState<DeviceContext>({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        deviceType: "desktop",
    });

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            const isMobile = width < 768;
            const isTablet = width >= 768 && width < 1024;
            const isDesktop = width >= 1024;

            let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
            if (isMobile) deviceType = "mobile";
            else if (isTablet) deviceType = "tablet";

            setDeviceContext({
                isMobile,
                isTablet,
                isDesktop,
                isTouchDevice: hasTouch,
                deviceType,
            });
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);

        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    return deviceContext;
}