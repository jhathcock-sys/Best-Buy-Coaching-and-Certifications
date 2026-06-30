import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { httpsCallable } from 'firebase/functions';
import { app } from '../services/firebase';
import { getFunctions } from 'firebase/functions';
import FloorAuditUploader from './FloorAuditUploader';
import FloorAuditReport from './FloorAuditReport';
import { Loader } from 'lucide-react';

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
  
  const activeImageRef = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleImageSelect = useCallback((image: string, mime: string) => {
    setSelectedImage(image);
    activeImageRef.current = image;
    setImageMime(mime);
    setAuditResult(null);
    setErrorMsg(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedImage(null);
    activeImageRef.current = null;
    setAuditResult(null);
    setErrorMsg(null);
  }, []);

  const handleRunAudit = useCallback(async () => {
    if (!selectedImage || !playbookSettings) return;
    
    setIsAuditing(true);
    setErrorMsg(null);
    const requestImage = selectedImage;

    try {
      const base64Data = requestImage.split(',')[1];
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
      
      // Abort if the user cleared the image or uploaded a new one while waiting
      if (activeImageRef.current !== requestImage || !isMounted.current) return;

      const data = response.data as AuditResult;
      setAuditResult(data);
    } catch (e: unknown) {
      if (activeImageRef.current !== requestImage || !isMounted.current) return;
      console.error(e);
      if (e instanceof Error) {
        setErrorMsg(e.message || 'An error occurred during the floor layout audit.');
      } else {
        setErrorMsg('An unknown error occurred during the floor layout audit.');
      }
    } finally {
      if (activeImageRef.current === requestImage && isMounted.current) {
        setIsAuditing(false);
      }
    }
  }, [selectedImage, imageMime, playbookSettings]);

  if (!playbookSettings) {
    return (
      <div className="flex-center p-xxl min-h-200">
        <Loader className="spin text-secondary" size={32} />
      </div>
    );
  }

  return (
    <div className="dashboard-grid mt-lg" data-testid="floor-audit-container">
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
