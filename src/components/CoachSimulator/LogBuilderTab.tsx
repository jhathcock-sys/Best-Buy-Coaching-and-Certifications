import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

import LogBuilderFormFields from './LogBuilderFormFields';
import LogPreview from './LogPreview';
import { generateCoachingLogLocal, generateCoachingLogGemini } from '../../services/ai';

export default function LogBuilderTab({
  playbookSettings,
  apiKey,
  roster,
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
  isPausedSpeech,
  TEMPLATES
}) {

  const loadTemplate = (type) => {
    if (TEMPLATES[type]) {
      const template = TEMPLATES[type];
      setBuilderForm({
        ...template,
        discFocus: Array.isArray(template.discFocus) ? template.discFocus : [template.discFocus]
      });
    }
  };

  const handleAIFillCoachingLog = async () => {
    if (!builderForm.employeeName.trim()) {
      alert("Please enter the Employee Name first so the system can customize the log!");
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
    const focusSteps = Array.isArray(builderForm.discFocus) 
      ? builderForm.discFocus.join(', ') 
      : (builderForm.discFocus || 'Solve');

    return `## 📋 Coaching Plan: ${builderForm.employeeName || '[Employee Name]'} — DISC Focus: ${focusSteps}

* **What**: ${builderForm.what || 'Pending...'}
* **How**: ${builderForm.how || 'Pending...'}
* **Why**: ${builderForm.why || 'Pending...'}
* **Behavior**: ${builderForm.expectation || 'Pending...'}
* **Validation**: ${builderForm.validation || 'Pending...'}

---
### 🔍 Background & Performance Context
* **Observed Strengths**: ${builderForm.strengths || 'None logged.'}
* **Performance Gap / Metric Focus**: ${builderForm.gapDetails || 'None logged.'}
* **Coaching Date**: ${new Date().toLocaleDateString()}`;
  };

  const compileHuddleScriptText = () => {
    const name = builderForm.employeeName || '[Employee Name]';
    const focusSteps = Array.isArray(builderForm.discFocus) 
      ? builderForm.discFocus.join(', ') 
      : (builderForm.discFocus || 'Solve');

    return `## 💬 Leadership Huddle Script: 1-on-1 with ${name}
DISC Coaching Focus: ${focusSteps}

Hey ${name}, I wanted to pull you aside for a quick second to call out some awesome work. 

First off, I really appreciate your energy on the floor. Especially, I noticed you do an awesome job with:
👉 "${builderForm.strengths || '[Mention strengths]'}"

This week, I want us to focus on moving the needle on your ${builderForm.gapDetails || '[Mention gap]'}. 

Specifically, what I need you to do is:
🎯 "${builderForm.what || '[Specific action plan details]'}"

The best way to handle this during your customer conversations is:
💡 "${builderForm.how || '[Specific DISC sales script guidelines]'}"

This is super important because:
🚀 "${builderForm.why || '[Why it helps the customer and store results]'}"

Let's align to make this our standard behavior:
📈 "${builderForm.expectation || '[Expected behavior targets]'}"

I'm going to follow along and help support you on the floor this week:
🔍 "${builderForm.validation || '[Leader observation and validation details]'}"

Let's crush it! Let me know if you have any questions or need me to jump in and show you a demo on the floor.`;
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
      
      {/* Left Column: Input Form */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Template Loaders */}
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>Load Standard Templates:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="tag-pill" onClick={() => loadTemplate('memberships')}>Membership Gap</button>
            <button className="tag-pill" onClick={() => loadTemplate('gsp')}>GSP / Warranty</button>
            <button className="tag-pill" onClick={() => loadTemplate('card')}>Credit Cards</button>
            <button className="tag-pill" onClick={() => loadTemplate('surveys')}>5-Star Surveys</button>
          </div>
        </div>

        {/* AI Generator Button */}
        <button 
          className="btn btn-primary w-full"
          onClick={handleAIFillCoachingLog}
          disabled={isGeneratingLog}
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

        <hr style={{ borderTop: '1px solid var(--border-glass)', margin: '0.5rem 0' }} />

        
        <LogBuilderFormFields 
          builderForm={builderForm}
          setBuilderForm={setBuilderForm}
          roster={roster}
          handleSpeech={handleSpeech}
          handleStopSpeech={handleStopSpeech}
          isPlayingSpeech={isPlayingSpeech}
          isPausedSpeech={isPausedSpeech}
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
