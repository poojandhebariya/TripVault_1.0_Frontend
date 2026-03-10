import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faComment,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { Vault } from "../../types/vault";
import { StateTabs } from "../../components/ui/tabs";
import type { StateTabItem } from "../../components/ui/tabs";

// Tab Components
import DetailsTab from "./tabs/details-tab";
import MapTab from "./tabs/map-tab";
import CommentsTab from "./tabs/comments-tab";

interface VaultDetailTabProps {
  vault: Vault;
}

const VaultDetailTab = ({ vault }: VaultDetailTabProps) => {
  const [activeTab, setActiveTab] = useState<string>("details");

  const tabs: StateTabItem[] = [
    {
      id: "details",
      label: "Details",
      icon: <FontAwesomeIcon icon={faAlignLeft} />,
    },
    {
      id: "map",
      label: "Map",
      icon: <FontAwesomeIcon icon={faMapLocationDot} />,
    },
    ...(vault.allowComments !== false
      ? [
          {
            id: "comments",
            label: "Comments",
            icon: <FontAwesomeIcon icon={faComment} />,
            badge: vault.commentsCount ?? 0,
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* State-driven tab bar */}
      <StateTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="px-4 md:px-5"
      />

      {/* Tab content */}
      <div className="mt-2">
        {activeTab === "details" && <DetailsTab vault={vault} />}
        {activeTab === "map" && <MapTab vault={vault} />}
        {activeTab === "comments" && <CommentsTab />}
      </div>
    </div>
  );
};

export default VaultDetailTab;
