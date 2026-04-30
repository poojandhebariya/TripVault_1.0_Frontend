import { useNavigate } from "react-router-dom";
import {
  PanelTitle,
  PanelSubtitle,
  RowItem,
  SettingsCard,
} from "../settings-primitives";
import { ROUTES } from "../../../utils/constants";

const InsightsPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-[slideDown_0.3s_ease-out]">
      <div className="p-5 md:p-0">
        <PanelTitle>Insights & Analytics</PanelTitle>
        <PanelSubtitle>
          Track your travel influence and engagement across the globe.
        </PanelSubtitle>

        <div className="space-y-6">
          {/* Core Metrics */}
          <SettingsCard>
            <RowItem
              label="Profile Visits"
              description="Number of unique travelers who viewed your profile"
              onClick={() => navigate(ROUTES.USER.SETTINGS_INSIGHTS_VISITS)}
            />
            <RowItem
              label="Avg. Time Spent"
              description="Average duration users spend exploring your vaults"
              onClick={() => navigate(ROUTES.USER.SETTINGS_INSIGHTS_TIME)}
            />
          </SettingsCard>

          {/* Reach & Impact */}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-1">
            Reach & Impact
          </p>
          <SettingsCard>
            <RowItem
              label="Global Reach"
              description="Demographics of your audience by country"
              onClick={() => navigate(ROUTES.USER.SETTINGS_INSIGHTS_REACH)}
            />
            <RowItem
              label="Total Distance Covered"
              description="Cumulative distance tracked across all your vaults"
              onClick={() => navigate(ROUTES.USER.SETTINGS_INSIGHTS_DISTANCE)}
            />
          </SettingsCard>

          {/* Content Insights */}
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] px-1">
            Content Insights
          </p>
          <SettingsCard>
            <RowItem
              label="Most Engaging Mood"
              description="The trip vibe that resonates most with your audience"
              onClick={() => navigate(ROUTES.USER.SETTINGS_INSIGHTS_MOOD)}
            />
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
