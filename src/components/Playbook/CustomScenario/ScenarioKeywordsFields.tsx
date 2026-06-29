import React from 'react';

interface Props {
  scenConnectKw: string; setScenConnectKw: (v: string) => void;
  scenDiscoverKw: string; setScenDiscoverKw: (v: string) => void;
  scenRecommendKw: string; setScenRecommendKw: (v: string) => void;
  scenProtectKw: string; setScenProtectKw: (v: string) => void;
  scenCloseKw: string; setScenCloseKw: (v: string) => void;
}

export default function ScenarioKeywordsFields({
  scenConnectKw, setScenConnectKw,
  scenDiscoverKw, setScenDiscoverKw,
  scenRecommendKw, setScenRecommendKw,
  scenProtectKw, setScenProtectKw,
  scenCloseKw, setScenCloseKw
}: Props) {
  return (
    <div className="border-t border-[var(--border-glass)] pt-xl">
      <h4 className="text-md text-success mb-sm">Success Keywords (Separated by commas)</h4>
      
      <div className="flex-column gap-sm">
        <div className="form-group m-0">
          <label className="form-label text-xs">Connect Step:</label>
          <input type="text" className="form-control px-md py-sm text-sm" value={scenConnectKw} onChange={(e) => setScenConnectKw(e.target.value)} data-testid="scenario-connect-kw-input" />
        </div>
        <div className="form-group m-0">
          <label className="form-label text-xs">Discover Step:</label>
          <input type="text" className="form-control px-md py-sm text-sm" value={scenDiscoverKw} onChange={(e) => setScenDiscoverKw(e.target.value)} data-testid="scenario-discover-kw-input" />
        </div>
        <div className="form-group m-0">
          <label className="form-label text-xs">Recommend Step:</label>
          <input type="text" className="form-control px-md py-sm text-sm" value={scenRecommendKw} onChange={(e) => setScenRecommendKw(e.target.value)} data-testid="scenario-recommend-kw-input" />
        </div>
        <div className="form-group m-0">
          <label className="form-label text-xs">Protect Step:</label>
          <input type="text" className="form-control px-md py-sm text-sm" value={scenProtectKw} onChange={(e) => setScenProtectKw(e.target.value)} data-testid="scenario-protect-kw-input" />
        </div>
        <div className="form-group m-0">
          <label className="form-label text-xs">Close Step:</label>
          <input type="text" className="form-control px-md py-sm text-sm" value={scenCloseKw} onChange={(e) => setScenCloseKw(e.target.value)} data-testid="scenario-close-kw-input" />
        </div>
      </div>
    </div>
  );
}
