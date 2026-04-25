import { faLaptop, faMobileScreen, faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";

export type DeviceType = "desktop" | "mobile" | "tablet";

export const DEVICE_ICON = {
  desktop: faLaptop,
  mobile: faMobileScreen,
  tablet: faTabletScreenButton,
};
