import UpdateModal from "./UpdateModal";
import { useAppUpdateCheck } from "../../services/appUpdate";

/** Mount once near the root. No-ops entirely on iOS/web (see services/appUpdate.ts). */
const AppUpdatePrompt = () => {
  const { release, visible, mandatory, dismiss } = useAppUpdateCheck();
  return <UpdateModal visible={visible} release={release} mandatory={mandatory} onDismiss={dismiss} />;
};

export default AppUpdatePrompt;
