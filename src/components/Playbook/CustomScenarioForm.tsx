import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { generateCustomScenario } from '../../services/ai';
import { useStore } from '../../store/useStore';
import { StoreState } from '../../types/store';
import { CustomScenario } from '../../types/index';
import { useShallow } from 'zustand/react/shallow';

import AiGenerator from './CustomScenario/AiGenerator';
import ScenarioBasicFields from './CustomScenario/ScenarioBasicFields';
import ScenarioObjectionsFields from './CustomScenario/ScenarioObjectionsFields';
import ScenarioKeywordsFields from './CustomScenario/ScenarioKeywordsFields';

export default function CustomScenarioForm() {
  const [scenTitle, setScenTitle] = useState('');
  const [scenName, setScenName] = useState('');
  const [scenAvatar, setScenAvatar] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
  const [scenDesc, setScenDesc] = useState('');
  const [scenCategory, setScenCategory] = useState('Computing');
  const [scenDifficulty, setScenDifficulty] = useState('Medium');
  const [scenGreeting, setScenGreeting] = useState('');
  const [scenNeeds, setScenNeeds] = useState('');
  const [scenMembObj, setScenMembObj] = useState('');
  const [scenProtObj, setScenProtObj] = useState('');
  const [scenCardObj, setScenCardObj] = useState('');
  const [scenConnectKw, setScenConnectKw] = useState('hello, hi, congrats');
  const [scenDiscoverKw, setScenDiscoverKw] = useState('major, engineering, budget');
  const [scenRecommendKw, setScenRecommendKw] = useState('laptop, total, membership');
  const [scenProtectKw, setScenProtectKw] = useState('geek squad, gsp, drop');
  const [scenCloseKw, setScenCloseKw] = useState('finance, card, rewards');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const { apiKey, importCustomScenario } = useStore(useShallow((state: StoreState) => ({
    apiKey: state.apiKey,
    importCustomScenario: state.importCustomScenario
  })));

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError('');
    try {
      const generated = await generateCustomScenario(aiPrompt, apiKey);
      if (isMounted.current) {
        setScenTitle(generated?.title || '');
        setScenName(generated?.name || '');
        setScenCategory(generated?.category || 'Computing');
        setScenDifficulty(generated?.difficulty || 'Medium');
        setScenGreeting(generated?.greeting || '');
        setScenNeeds(generated?.customerNeeds || '');
        setScenMembObj(generated?.objections?.memberships || '');
        setScenProtObj(generated?.objections?.protection || '');
        setScenCardObj(generated?.objections?.creditCard || '');
        setScenConnectKw(generated?.keywords?.connect || '');
        setScenDiscoverKw(generated?.keywords?.discover || '');
        setScenRecommendKw(generated?.keywords?.recommend || '');
        setScenProtectKw(generated?.keywords?.protect || '');
        setAiPrompt('');
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        setAiError(err instanceof Error ? err.message : 'Generation failed');
      }
    } finally {
      if (isMounted.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleCreateScenario = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!scenTitle.trim() || !scenName.trim() || !scenGreeting.trim()) {
      setFormError("Scenario Title, Customer Name, and Initial Greeting are required!");
      return;
    }

    const cleanKeywords = (str: string) => {
      return str.split(',').map((k: string) => k.trim().toLowerCase()).filter((k: string) => k.length > 0);
    };

    const newScenario: CustomScenario = {
      id: 'cust_' + Date.now(),
      title: scenTitle.trim(),
      role: 'Customer',
      name: scenName.trim(),
      avatar: scenAvatar,
      description: scenDesc.trim() || `${scenName} shopping in ${scenCategory}.`,
      category: scenCategory,
      difficulty: scenDifficulty,
      initialGreeting: scenGreeting.trim(),
      needs: scenNeeds.trim() || 'General consultative assistance.',
      objections: {
        membership: scenMembObj.trim() || "Why does a membership cost so much?",
        warranty: scenProtObj.trim() || "Doesn't it already come with a warranty?",
        card: scenCardObj.trim() || "I don't think I need another credit card."
      },
      successKeywords: {
        connect: cleanKeywords(scenConnectKw),
        discover: cleanKeywords(scenDiscoverKw),
        recommend: cleanKeywords(scenRecommendKw),
        protect: cleanKeywords(scenProtectKw),
        close: cleanKeywords(scenCloseKw)
      }
    };

    if (importCustomScenario) {
      importCustomScenario(newScenario);
      setFormSuccess(`Custom Scenario "${scenTitle}" created successfully!`);
      
      setScenTitle('');
      setScenName('');
      setScenDesc('');
      setScenGreeting('');
      setScenNeeds('');
      setScenMembObj('');
      setScenProtObj('');
      setScenCardObj('');
    } else {
      setFormError("Store missing importCustomScenario action.");
    }
  };

  return (
    <form onSubmit={handleCreateScenario} className="glass-card flex-column gap-xl p-xl" data-testid="custom-scenario-form">
      <h3 className="text-xl flex-center justify-start gap-sm text-[var(--bby-yellow)] m-0">
        <Sparkles size={20} color="var(--bby-yellow)" /> Create Custom Scenario
      </h3>
      
      {formError && <div className="bg-red-500/10 border border-red-500/20 text-error p-sm rounded-md text-sm">{formError}</div>}
      {formSuccess && <div className="bg-green-500/10 border border-green-500/20 text-success p-sm rounded-md text-sm">{formSuccess}</div>}

      <AiGenerator 
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        isGenerating={isGenerating}
        handleAiGenerate={handleAiGenerate}
        aiError={aiError}
      />

      <ScenarioBasicFields 
        scenTitle={scenTitle} setScenTitle={setScenTitle}
        scenName={scenName} setScenName={setScenName}
        scenCategory={scenCategory} setScenCategory={setScenCategory}
        scenDifficulty={scenDifficulty} setScenDifficulty={setScenDifficulty}
        scenAvatar={scenAvatar} setScenAvatar={setScenAvatar}
        scenDesc={scenDesc} setScenDesc={setScenDesc}
        scenGreeting={scenGreeting} setScenGreeting={setScenGreeting}
        scenNeeds={scenNeeds} setScenNeeds={setScenNeeds}
      />

      <ScenarioObjectionsFields 
        scenMembObj={scenMembObj} setScenMembObj={setScenMembObj}
        scenProtObj={scenProtObj} setScenProtObj={setScenProtObj}
        scenCardObj={scenCardObj} setScenCardObj={setScenCardObj}
      />

      <ScenarioKeywordsFields 
        scenConnectKw={scenConnectKw} setScenConnectKw={setScenConnectKw}
        scenDiscoverKw={scenDiscoverKw} setScenDiscoverKw={setScenDiscoverKw}
        scenRecommendKw={scenRecommendKw} setScenRecommendKw={setScenRecommendKw}
        scenProtectKw={scenProtectKw} setScenProtectKw={setScenProtectKw}
        scenCloseKw={scenCloseKw} setScenCloseKw={setScenCloseKw}
      />

      <button type="submit" className="btn btn-primary w-full p-md mt-md" disabled={isGenerating} data-testid="scenario-submit-btn">
        Create & Install Roleplay Scenario
      </button>
    </form>
  );
}
