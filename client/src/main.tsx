import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.css";
import {installAulaTransport} from "./utils/aulaTransport";
import App from "./App.tsx";
import "./styles/mobile.css";
import "./styles/navigation.css";
import {installResponsiveDialogs} from "./utils/responsiveDialogs";
installResponsiveDialogs();
import {installSpanishUi} from "./utils/spanishUi";
installSpanishUi();
import "./styles/seguimiento.css";
import "./styles/responsiveSurfaces.css";
import "./styles/activityImages.css";
import {installPreferences} from "./utils/preferences";
installPreferences();
import {installTesterTransport} from "./utils/testerSession";
installTesterTransport();
installAulaTransport();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
