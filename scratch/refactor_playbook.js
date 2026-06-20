const fs = require('fs');
const code = fs.readFileSync('src/components/PlaybookStudio.tsx', 'utf8');
const lines = code.split('\n');

const importsEnd = lines.findIndex(l => l.includes('export default function PlaybookStudio'));
const beforeComponent = lines.slice(0, importsEnd).join('\n');

const componentStart = lines.findIndex(l => l.includes('export default function PlaybookStudio'));
const renderStart = lines.findIndex(l => l.includes('return (') && l.includes('<div'));
const componentBody = lines.slice(componentStart, renderStart).join('\n');

const renderContentStart = lines.findIndex(l => l.includes('{activeTab === \\'engine\\' && ('));
const renderHeader = lines.slice(renderStart, renderContentStart).join('\n');

const newCode = beforeComponent + \
import AiEngineTab from './PlaybookStudio/AiEngineTab';
import SystemPromptsTab from './PlaybookStudio/SystemPromptsTab';
import SupervisorProfilesTab from './PlaybookStudio/SupervisorProfilesTab';
import BbyVocabTab from './PlaybookStudio/BbyVocabTab';
import DepartmentTargetsTab from './PlaybookStudio/DepartmentTargetsTab';
import SyncDiagnosticsTab from './PlaybookStudio/SyncDiagnosticsTab';
\ + '\\n' + componentBody + '\\n' + renderHeader + \
      {activeTab === 'engine' && (
        <AiEngineTab 
          aiMode={aiMode} setAiMode={setAiMode}
          localApiKey={localApiKey} setLocalApiKey={setLocalApiKey}
          playbookSettings={playbookSettings}
          storePin={storePin} setStorePin={setStorePin}
        />
      )}

      {activeTab === 'prompts' && (
        <SystemPromptsTab 
          customSystemPrompt={customSystemPrompt} 
          setCustomSystemPrompt={setCustomSystemPrompt} 
        />
      )}

      {activeTab === 'supervisors' && (
        <SupervisorProfilesTab 
          managers={managers}
          newManagerName={newManagerName} setNewManagerName={setNewManagerName}
          newManagerRole={newManagerRole} setNewManagerRole={setNewManagerRole}
          newManagerPin={newManagerPin} setNewManagerPin={setNewManagerPin}
          editingManagerIndex={editingManagerIndex} setEditingManagerIndex={setEditingManagerIndex}
          editingManagerName={editingManagerName} setEditingManagerName={setEditingManagerName}
          editingManagerRole={editingManagerRole} setEditingManagerRole={setEditingManagerRole}
          editingManagerPin={editingManagerPin} setEditingManagerPin={setEditingManagerPin}
          visiblePins={visiblePins} togglePinVisibility={togglePinVisibility}
          handleAddManager={handleAddManager}
          startEditingManager={startEditingManager}
          saveEditingManager={saveEditingManager}
          handleDeleteManager={handleDeleteManager}
        />
      )}

      {activeTab === 'vocab' && (
        <BbyVocabTab />
      )}

      {activeTab === 'targets' && (
        <DepartmentTargetsTab 
          selectedDept={selectedDept} setSelectedDept={setSelectedDept}
          deptGoals={deptGoals} handleSaveDeptGoals={handleSaveDeptGoals}
        />
      )}

      {activeTab === 'scenarios' && (
        <CustomScenariosTab 
          customScenarios={customScenarios}
          onAddCustomScenario={onAddCustomScenario}
          onDeleteCustomScenario={onDeleteCustomScenario}
        />
      )}

      {activeTab === 'sync' && (
        <SyncDiagnosticsTab 
          runDiagnostics={runDiagnostics}
          isRunningDiagnostics={isRunningDiagnostics}
          diagnosticsLogs={diagnosticsLogs}
          dbConnected={dbConnected}
        />
      )}
    </div>
  );
}
\;

fs.writeFileSync('src/components/PlaybookStudio.tsx', newCode);
console.log('PlaybookStudio refactored successfully.');
