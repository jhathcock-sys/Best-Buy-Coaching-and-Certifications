export interface MockRentDue {
  name: string;
  rph: number;
  rphOwed: number;
  rphStatus: 'on-track' | 'off-track' | 'none';
  revenue: number;
  revenueOwed: number;
  revenueStatus: 'on-track' | 'off-track' | 'none';
  apps: number;
  appsOwed: number;
  appsStatus: 'on-track' | 'off-track' | 'none';
  memberships: number;
  membershipsOwed: number;
  membershipsStatus: 'on-track' | 'off-track' | 'none';
  warranty: number;
  warrantyGoal: number;
  warrantyStatus: 'on-track' | 'off-track' | 'none';
}

export const mockRentsDuePayload: MockRentDue[] = [
        {
          name: "Ricky",
          rph: 649,
          rphOwed: 700,
          rphStatus: "off-track",
          revenue: 38875,
          revenueOwed: 42000,
          revenueStatus: "off-track",
          apps: 7,
          appsOwed: 10,
          appsStatus: "off-track",
          memberships: 3,
          membershipsOwed: 5,
          membershipsStatus: "off-track",
          warranty: 11.5,
          warrantyGoal: 12.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Yinel",
          rph: 744,
          rphOwed: 640,
          rphStatus: "on-track",
          revenue: 25668,
          revenueOwed: 22000,
          revenueStatus: "on-track",
          apps: 10,
          appsOwed: 8,
          appsStatus: "on-track",
          memberships: 22,
          membershipsOwed: 15,
          membershipsStatus: "on-track",
          warranty: 22.2,
          warrantyGoal: 11.0,
          warrantyStatus: "on-track"
        },
        {
          name: "Muntarin",
          rph: 868,
          rphOwed: 800,
          rphStatus: "on-track",
          revenue: 44615,
          revenueOwed: 48000,
          revenueStatus: "off-track",
          apps: 0,
          appsOwed: 5,
          appsStatus: "off-track",
          memberships: 4,
          membershipsOwed: 6,
          membershipsStatus: "off-track",
          warranty: 17.1,
          warrantyGoal: 11.0,
          warrantyStatus: "on-track"
        },
        {
          name: "Victor",
          rph: 629,
          rphOwed: 800,
          rphStatus: "off-track",
          revenue: 81203,
          revenueOwed: 103200,
          revenueStatus: "off-track",
          apps: 13,
          appsOwed: 15,
          appsStatus: "off-track",
          memberships: 11,
          membershipsOwed: 12,
          membershipsStatus: "off-track",
          warranty: 8.0,
          warrantyGoal: 11.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Daniel",
          rph: 1386,
          rphOwed: 700,
          rphStatus: "on-track",
          revenue: 42688,
          revenueOwed: 21500,
          revenueStatus: "on-track",
          apps: 3,
          appsOwed: 4,
          appsStatus: "off-track",
          memberships: 2,
          membershipsOwed: 3,
          membershipsStatus: "off-track",
          warranty: 7.5,
          warrantyGoal: 8.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Paulie",
          rph: 1436,
          rphOwed: 1200,
          rphStatus: "on-track",
          revenue: 35900,
          revenueOwed: 30000,
          revenueStatus: "on-track",
          apps: 3,
          appsOwed: 3,
          appsStatus: "on-track",
          memberships: 2,
          membershipsOwed: 2,
          membershipsStatus: "on-track",
          warranty: 11.6,
          warrantyGoal: 12.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Sarah Jenkins",
          rph: 850,
          rphOwed: 900,
          rphStatus: "off-track",
          revenue: 15400,
          revenueOwed: 18000,
          revenueStatus: "off-track",
          apps: 4,
          appsOwed: 5,
          appsStatus: "off-track",
          memberships: 3,
          membershipsOwed: 4,
          membershipsStatus: "off-track",
          warranty: 10.5,
          warrantyGoal: 11.0,
          warrantyStatus: "off-track"
        },
        {
          name: "Marcus Vance",
          rph: 720,
          rphOwed: 700,
          rphStatus: "on-track",
          revenue: 12500,
          revenueOwed: 11000,
          revenueStatus: "on-track",
          apps: 3,
          appsOwed: 2,
          appsStatus: "on-track",
          memberships: 2,
          membershipsOwed: 2,
          membershipsStatus: "on-track",
          warranty: 8.5,
          warrantyGoal: 8.0,
          warrantyStatus: "on-track"
        },
        {
          name: "Elena Rostova",
          rph: 1250,
          rphOwed: 1200,
          rphStatus: "on-track",
          revenue: 41200,
          revenueOwed: 36000,
          revenueStatus: "on-track",
          apps: 5,
          appsOwed: 4,
          appsStatus: "on-track",
          memberships: 4,
          membershipsOwed: 3,
          membershipsStatus: "on-track",
          warranty: 13.2,
          warrantyGoal: 12.0,
          warrantyStatus: "on-track"
        }
      ];
