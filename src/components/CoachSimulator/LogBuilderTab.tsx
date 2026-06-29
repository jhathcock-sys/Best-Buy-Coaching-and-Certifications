import React from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { useShallow } from 'zustand/react/shallow';

import LogBuilderFormFields, { LogBuilderForm } from './LogBuilderFormFields';
import LogPreview from './LogPreview';
import { generateCoachingLogLocal, generateCoachingLogGemini } from '../../services/ai';
import { TEMPLATES } from './templates';

export interface LogBuilderTabProps {
  prefillBuilderData: any;
  clearPrefillBuilderData: () => void;
  builderForm: LogBuilderForm;
  setBuilderForm: React.Dispatch<React.SetStateAction<LogBuilderForm>>;
  isGeneratingLog: boolean;
  setIsGeneratingLog: React.Dispatch<React.SetStateAction<boolean>>;
  copySuccess: boolean;
  setCopySuccess: React.Dispatch<React.SetStateAction<boolean>>;
  outputViewMode: string;
  setOutputViewMode: React.Dispatch<React.SetStateAction<string>>;
  handleSpeech: (text: string) => void;
  handleStopSpeech: () => void;
  isPlayingSpeech: boolean;
  isPausedSpeech: boolean;
}

export default function LogBuilderTab({
  prefillBuilderData,
  clearPrefillBuilderData,
  builderForm,
  setBuilderForm,
  isGeneratingLog,
  setIsGeneratingLog,
  copySuccess,
  setCopySuccess,
  outputViewMode,
  setOutputViewMode,
  handleSpeech,
  handleStopSpeech,
  isPlayingSpeech,
  isPausedSpeech
}: LogBuilderTabProps) {

  const { playbookSettings, apiKey } = useStore(useShallow(state => ({
    playbookSettings: state.playbookSettings,
    apiKey: state.apiKey
  })));

  const loadTemplate = (type: string) => {
    if (TEMPLATES && TEMPLATES[type]) {
      const template = TEMPLATES[type];
      setBuilderForm({
        ...template,
        discFocus: Array.isArray(template.discFocus) ? template.discFocus : [template.discFocus]
      });
    }
  };

  const handleAIFillCoachingLog = async () => {
    if (!builderForm?.employeeName?.trim()) {
      toast.error("Please enter the Employee Name first so the system can customize the log!");
      return;
    }
    
    setIsGeneratingLog(true);
    const isProMode = playbookSettings?.aiMode === 'pro';
    const hasApiKey = apiKey && apiKey.trim().length > 10;
    
    try {
      if (isProMode) {
        const response = await fetch('/api/generate-coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: builderForm.employeeName,
            gapType: builderForm.metricGap,
            gapDetails: builderForm.gapDetails || "Needs performance coaching to meet store targets",
            positives: builderForm.strengths,
            rawObservation: builderForm.rawObservation,
            playbookSettings,
            selectedDiscSteps: builderForm.discFocus
          })
        });
        if (!response.ok) throw new Error('Premium coaching log generation failed.');
        const data = await response.json();
        if (data) {
          setBuilderForm(prev => ({
            ...prev,
            what: data.what,
            how: data.how,
            why: data.why,
            strengths: data.strengths || prev.strengths,
            expectation: data.expectation,
            validation: data.validation,
            discFocus: data.discStep ? (Array.isArray(prev.discFocus) ? [data.discStep] : data.discStep) : prev.discFocus
          }));
        }
      } else if (hasApiKey) {
        const data = await generateCoachingLogGemini(
          apiKey,
          builderForm.employeeName,
          builderForm.metricGap,
          builderForm.gapDetails || "Needs performance coaching to meet store targets",
          builderForm.strengths,
          builderForm.rawObservation,
          playbookSettings,
          builderForm.discFocus
        );
        
        if (data) {
          setBuilderForm(prev => ({
            ...prev,
            what: data.what,
            how: data.how,
            why: data.why,
            strengths: data.strengths || prev.strengths,
            expectation: data.expectation,
            validation: data.validation,
          }));
          toast.success('AI Coaching Log generated!');
        } else {
          toast.error("Gemini API failed to generate a response. Please check your API key and connection.");
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const localData = generateCoachingLogLocal(
          builderForm.employeeName,
          builderForm.metricGap,
          builderForm.gapDetails,
          builderForm.strengths,
          builderForm.rawObservation,
          builderForm.discFocus
        );
        
        setBuilderForm(prev => ({
          ...prev,
          what: localData.what,
          how: localData.how,
          why: localData.why,
          strengths: localData.strengths,
          expectation: localData.expectation,
          validation: localData.validation
        }));
      }
    } catch (e) {
      toast.error("Cloud generation failed, falling back to offline mode.");
      console.error(e);
      const localData = generateCoachingLogLocal(
        builderForm.employeeName,
        builderForm.metricGap,
        builderForm.gapDetails,
        builderForm.strengths,
        builderForm.rawObservation,
        builderForm.discFocus
      );
      setBuilderForm(prev => ({
        ...prev,
        what: localData.what,
        how: localData.how,
        why: localData.why,
        strengths: localData.strengths,
        expectation: localData.expectation,
        validation: localData.validation
      }));
    } finally {
      setIsGeneratingLog(false);
    }
  };

  const compileCoachingLogText = () => {
    const focusSteps = Array.isArray(builderForm?.discFocus) 
      ? builderForm.discFocus.join(', ') 
      : (builderForm?.discFocus || 'Solve');

    return `## 📋 Coaching Plan: ${builderForm?.employeeName || '[Employee Name]'} — DISC Focus: ${focusSteps}

* **What**: ${builderForm?.what || 'Pending...'}
* **How**: ${builderForm?.how || 'Pending...'}
* **Why**: ${builderForm?.why || 'Pending...'}
* **Behavior**: ${builderForm?.expectation || 'Pending...'}
* **Validation**: ${builderForm?.validation || 'Pending...'}

---
### 🔍 Background & Performance Context
* **Observed Strengths**: ${builderForm?.strengths || 'None logged.'}
* **Performance Gap / Metric Focus**: ${builderForm?.gapDetails || 'None logged.'}
* **Coaching Date**: ${new Date().toLocaleDateString()}`;
  };

  const compileHuddleScriptText = () => {
    const name = builderForm?.employeeName || '[Employee Name]';
    const focusSteps = Array.isArray(builderForm?.discFocus) 
      ? builderForm.discFocus.join(', ') 
      : (builderForm?.discFocus || 'Solve');

    return `## 💬 Leadership Huddle Script: 1-on-1 with ${name}
DISC Coaching Focus: ${focusSteps}

Hey ${name}, I wanted to pull you aside for a quick second to call out some awesome work. 

First off, I really appreciate your energy on the floor. Especially, I noticed you do an awesome job with:
👉 "${builderForm?.strengths || '[Mention strengths]'}"

This week, I want us to focus on moving the needle on your ${builderForm?.gapDetails || '[Mention gap]'}. 

Specifically, what I need you to do is:
🎯 "${builderForm?.what || '[Specific action plan details]'}"

The best way to handle this during your customer conversations is:
💡 "${builderForm?.how || '[Specific DISC sales script guidelines]'}"

This is super important because:
🚀 "${builderForm?.why || '[Why it helps the customer and store results]'}"

Let's align to make this our standard behavior:
📈 "${builderForm?.expectation || '[Expected behavior targets]'}"

I'm going to follow along and help support you on the floor this week:
🔍 "${builderForm?.validation || '[Leader observation and validation details]'}"

Let's crush it! Let me know if you have any questions or need me to jump in and show you a demo on the floor.`;
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div className="grid gap-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      
      {/* Left Column: Input Form */}
      <div className="glass-card flex-column gap-xl">
        
        {/* Template Loaders */}
        <div className="p-md bg-white-alpha-02 rounded-xl border border-glass">
          <p className="text-sm font-semibold mb-md text-white">Load Standard Templates:</p>
          <div className="flex-row gap-sm flex-wrap">
            <button className="tag-pill cursor-pointer" onClick={() => loadTemplate('memberships')} disabled={isGeneratingLog} data-testid="template-memberships-btn">Membership Gap</button>
            <button className="tag-pill cursor-pointer" onClick={() => loadTemplate('gsp')} disabled={isGeneratingLog} data-testid="template-gsp-btn">GSP / Warranty</button>
            <button className="tag-pill cursor-pointer" onClick={() => loadTemplate('card')} disabled={isGeneratingLog} data-testid="template-card-btn">Credit Cards</button>
            <button className="tag-pill cursor-pointer" onClick={() => loadTemplate('surveys')} disabled={isGeneratingLog} data-testid="template-surveys-btn">5-Star Surveys</button>
          </div>
        </div>

        {/* AI Generator Button */}
        <button 
          className="btn btn-primary w-full flex-center gap-sm cursor-pointer"
          onClick={handleAIFillCoachingLog}
          disabled={isGeneratingLog}
          data-testid="ai-generate-log-btn"
        >
          {isGeneratingLog ? (
            <>
              <Sparkles size={18} className="pulse-animation" /> 
              Generative AI is writing your coaching plan...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Auto-Generate Coaching Plan (AI)
            </>
          )}
        </button>

        <hr className="border-t border-glass my-sm w-full" />

        <LogBuilderFormFields 
          builderForm={builderForm}
          setBuilderForm={setBuilderForm}
        />
      </div>

      {/* Right Column: Dynamic Preview */}
      <LogPreview 
        isGeneratingLog={isGeneratingLog}
        outputViewMode={outputViewMode}
        setOutputViewMode={setOutputViewMode}
        coachingLogText={compileCoachingLogText()}
        huddleScriptText={compileHuddleScriptText()}
        copySuccess={copySuccess}
        handleCopyToClipboard={handleCopyToClipboard}
        isPlayingSpeech={isPlayingSpeech}
        isPausedSpeech={isPausedSpeech}
        handleSpeech={handleSpeech}
        handleStopSpeech={handleStopSpeech}
      />
    </div>
  );
}
