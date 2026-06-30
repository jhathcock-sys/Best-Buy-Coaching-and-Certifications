import React from 'react';
import StorePinSecurityCard from './SupervisorProfiles/StorePinSecurityCard';
import SupervisorProfilesCard from './SupervisorProfiles/SupervisorProfilesCard';

export default function SupervisorProfilesTab() {
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-2xl items-start" data-testid="supervisor-profiles-tab">
        <StorePinSecurityCard />
        <SupervisorProfilesCard />
      </div>
    </>
  );
}
