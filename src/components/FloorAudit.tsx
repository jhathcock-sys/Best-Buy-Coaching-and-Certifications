import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { httpsCallable } from 'firebase/functions';
import { app } from '../services/firebase';
import { getFunctions } from 'firebase/functions';
import FloorAuditUploader from './FloorAuditUploader';
import FloorAuditReport from './FloorAuditReport';

interface AuditResult {
  status: 'Green' | 'Yellow' | 'Red';
  statusDetails: string;
  observations: string[];
  actionPlan: string[];
}

export default function FloorAudit() {
  const playbookSettings = useStore((state) => state.playbookSettings);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/png');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageSelect = useCallback((image: string, mime: string) => {
    setSelectedImage(image);
    setImageMime(mime);
    setAuditResult(null);
    setErrorMsg(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedImage(null);
    setAuditResult(null);
    setErrorMsg(null);
  }, []);

  const handleRunAudit = useCallback(async () => {
    if (!selectedImage) return;
    
    setIsAuditing(true);
    setErrorMsg(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      if (!app) throw new Error('Firebase not initialized');
      
      const functionsInstance = getFunctions(app);
      const auditStoreFloor = httpsCallable(functionsInstance, 'auditStoreFloor');
      
      // The Callable validates auth automatically and timeouts are handled server-side/client-side 
      // but we wrap in try catch to surface meaningful errors.
      const response = await auditStoreFloor({
        base64Image: base64Data,
        mimeType: imageMime,
        playbookSettings
      });
      
      const data = response.data as AuditResult;
      setAuditResult(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'An error occurred during the floor layout audit.');
    } finally {
      setIsAuditing(false);
    }
  }, [selectedImage, imageMime, playbookSettings]);

  return (
    <div className="dashboard-grid mt-lg">
      <div className="flex-column gap-lg">
        <FloorAuditUploader
          selectedImage={selectedImage}
          isAuditing={isAuditing}
          onImageSelect={handleImageSelect}
          onRunAudit={handleRunAudit}
          onClear={handleClear}
        />
      </div>

      <div className="flex-column gap-lg">
        <FloorAuditReport
          isAuditing={isAuditing}
          auditResult={auditResult}
          errorMsg={errorMsg}
        />
      </div>
    </div>
  );
}
