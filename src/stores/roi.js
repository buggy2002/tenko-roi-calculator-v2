import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { calculateAutoOt, calculateRoi } from '@/utils/roi/calculate-roi.js';
import { FORMULA_VERSION } from '@/utils/roi/constants.js';
import { defaultInput, roiPresets } from '@/utils/roi/presets.js';
import { createScenario, deleteScenarioRequest, hasScenarioApiConfig, listScenarios, updateScenario, } from '@/services/roi-scenarios.js';
const STORAGE_KEY = 'tenko-roi-scenarios';
function cloneInput(input) {
    return { ...input };
}
function createLocalId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        return crypto.randomUUID();
    return `scenario-${Date.now()}`;
}
function getDefaultScenarioName(presetKey) {
    return roiPresets[presetKey].name;
}
function resolvePresetKey(value) {
    return value && value in roiPresets ? value : 'default';
}
function inferFactorChoice(value) {
    const fixed = value.toFixed(2);
    return ['1.20', '1.25', '1.35'].includes(fixed) ? fixed : 'custom';
}
function inferAutoOtEnabled(presetKey) {
    return roiPresets[presetKey].autoOT;
}
function normalizeStoredScenario(raw) {
    if (typeof raw.localId !== 'string' ||
        typeof raw.name !== 'string' ||
        typeof raw.language !== 'string' ||
        typeof raw.savedAt !== 'string' ||
        !raw.input)
        return null;
    const presetKey = resolvePresetKey(raw.presetKey);
    return {
        localId: raw.localId,
        remoteId: typeof raw.remoteId === 'string' ? raw.remoteId : null,
        name: raw.name,
        customerName: typeof raw.customerName === 'string' ? raw.customerName : '',
        notes: typeof raw.notes === 'string' ? raw.notes : '',
        language: raw.language,
        presetKey,
        input: cloneInput(raw.input),
        autoOTEnabled: typeof raw.autoOTEnabled === 'boolean' ? raw.autoOTEnabled : inferAutoOtEnabled(presetKey),
        otEdited: typeof raw.otEdited === 'boolean' ? raw.otEdited : false,
        factorChoice: typeof raw.factorChoice === 'string' ? raw.factorChoice : inferFactorChoice(raw.input.employeeCostFactor),
        savedAt: raw.savedAt,
    };
}
function toStoredScenarioFromRecord(record, fallbackLocalId) {
    const nextPresetKey = resolvePresetKey(record.presetKey);
    const autoOTEnabled = inferAutoOtEnabled(nextPresetKey);
    const calculatedOt = Number(calculateAutoOt(record.input).toFixed(1));
    return {
        localId: fallbackLocalId ?? `remote-${record.id}`,
        remoteId: record.id,
        name: record.name,
        customerName: record.customerName ?? '',
        notes: record.notes ?? '',
        language: record.language,
        presetKey: nextPresetKey,
        input: cloneInput(record.input),
        autoOTEnabled,
        otEdited: autoOTEnabled ? record.input.otHoursPerDay !== calculatedOt : false,
        factorChoice: inferFactorChoice(record.input.employeeCostFactor),
        savedAt: record.updatedAt,
    };
}
function mergeScenarioCollections(localItems, remoteItems) {
    const byRemoteId = new Map(localItems.filter(item => item.remoteId).map(item => [item.remoteId, item]));
    const mergedRemote = remoteItems.map(item => {
        const localMatch = item.remoteId ? byRemoteId.get(item.remoteId) : undefined;
        return localMatch ? { ...item, localId: localMatch.localId } : item;
    });
    const remoteIds = new Set(mergedRemote.map(item => item.remoteId).filter(Boolean));
    const localOnly = localItems.filter(item => !item.remoteId || !remoteIds.has(item.remoteId));
    return [...mergedRemote, ...localOnly].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
export const useRoiStore = defineStore('roi', () => {
    const language = ref('th');
    const presetKey = ref('default');
    const input = ref({
        ...defaultInput,
        otHoursPerDay: Number(calculateAutoOt(defaultInput).toFixed(1)),
    });
    const autoOTEnabled = ref(true);
    const otEdited = ref(false);
    const factorChoice = ref('1.20');
    const scenarioName = ref(roiPresets.default.name);
    const customerName = ref('');
    const scenarioNotes = ref('');
    const currentLocalId = ref(null);
    const currentRemoteId = ref(null);
    const savedScenarios = ref([]);
    const openTabIds = ref([]);
    const hiddenPresetKeys = ref([]);
    const hasHydrated = ref(false);
    const isRemoteLoading = ref(false);
    const sortMode = ref('recent');
    const renamingLocalId = ref(null);
    const renameDraft = ref('');
    const hasRestoredEditor = ref(false);
    const formatterLocale = computed(() => {
        if (language.value === 'th')
            return 'th-TH';
        if (language.value === 'ja')
            return 'ja-JP';
        return 'en-US';
    });
    const result = computed(() => calculateRoi(input.value));
    const visibleTabs = computed(() => {
        const itemMap = new Map(savedScenarios.value.map(item => [item.localId, item]));
        return openTabIds.value.map(id => itemMap.get(id)).filter(Boolean);
    });
    const visiblePresetKeys = computed(() => Object.keys(roiPresets).filter(key => !hiddenPresetKeys.value.includes(key)));
    const scenarioGroups = computed(() => {
        const sortItems = (items) => [...items].sort((a, b) => {
            if (sortMode.value === 'name')
                return a.name.localeCompare(b.name, formatterLocale.value, { sensitivity: 'base' });
            return b.savedAt.localeCompare(a.savedAt);
        });
        const remoteItems = sortItems(savedScenarios.value.filter(item => item.remoteId));
        const localItems = sortItems(savedScenarios.value.filter(item => !item.remoteId));
        const groups = [];
        if (remoteItems.length > 0)
            groups.push({ value: 'remote', items: remoteItems });
        if (localItems.length > 0)
            groups.push({ value: 'local', items: localItems });
        return groups;
    });
    function setEditorFromScenario(scenario) {
        scenarioName.value = scenario.name;
        customerName.value = scenario.customerName;
        scenarioNotes.value = scenario.notes;
        currentLocalId.value = scenario.localId;
        currentRemoteId.value = scenario.remoteId;
        language.value = scenario.language;
        presetKey.value = scenario.presetKey;
        autoOTEnabled.value = scenario.autoOTEnabled;
        otEdited.value = scenario.otEdited;
        factorChoice.value = scenario.factorChoice;
        input.value = cloneInput(scenario.input);
    }
    function syncSavedScenario(scenario) {
        savedScenarios.value = mergeScenarioCollections(savedScenarios.value.filter(item => item.localId !== scenario.localId), [scenario]);
    }
    function resetToDefaultSession() {
        const baseInput = {
            ...defaultInput,
            otHoursPerDay: Number(calculateAutoOt(defaultInput).toFixed(1)),
        };
        scenarioName.value = roiPresets.default.name;
        customerName.value = '';
        scenarioNotes.value = '';
        currentLocalId.value = null;
        currentRemoteId.value = null;
        language.value = 'th';
        presetKey.value = 'default';
        autoOTEnabled.value = true;
        otEdited.value = false;
        factorChoice.value = '1.20';
        input.value = baseInput;
        renamingLocalId.value = null;
        renameDraft.value = '';
    }
    function applyInput(next, changedKey, forceAuto = false) {
        const shouldAuto = autoOTEnabled.value && (!otEdited.value || forceAuto) && changedKey !== 'otHoursPerDay';
        if (shouldAuto)
            next = { ...next, otHoursPerDay: Number(calculateAutoOt(next).toFixed(1)) };
        input.value = next;
    }
    function updateInput(key, value) {
        const next = { ...input.value, [key]: Math.max(0, Number.isFinite(value) ? value : 0) };
        if (key === 'otHoursPerDay') {
            otEdited.value = true;
            input.value = next;
            return;
        }
        if (key === 'employeeCostFactor')
            factorChoice.value = 'custom';
        applyInput(next, key);
    }
    function setLanguage(nextLanguage) {
        language.value = nextLanguage;
    }
    function selectPreset(key) {
        const preset = roiPresets[key];
        presetKey.value = key;
        autoOTEnabled.value = preset.autoOT;
        otEdited.value = false;
        factorChoice.value = '1.20';
        scenarioName.value = currentLocalId.value ? scenarioName.value : getDefaultScenarioName(key);
        const next = { ...preset, employeeCostFactor: 1.2 };
        const { key: _presetKey, name: _name, autoOT: _autoOT, ...presetInput } = next;
        if (preset.autoOT)
            presetInput.otHoursPerDay = Number(calculateAutoOt(presetInput).toFixed(1));
        input.value = presetInput;
    }
    function activatePresetTab(key) {
        currentLocalId.value = null;
        currentRemoteId.value = null;
        scenarioName.value = roiPresets[key].name;
        selectPreset(key);
    }
    function closePresetTab(key) {
        if (key === 'default')
            return;
        if (!hiddenPresetKeys.value.includes(key))
            hiddenPresetKeys.value = [...hiddenPresetKeys.value, key];
        if (currentLocalId.value === null && presetKey.value === key)
            activatePresetTab('default');
    }
    function selectFactor(value) {
        factorChoice.value = value;
        if (value !== 'custom') {
            updateInput('employeeCostFactor', Number(value));
            factorChoice.value = value;
        }
    }
    function openScenario(scenario) {
        setEditorFromScenario(scenario);
        openTabIds.value = openTabIds.value.includes(scenario.localId)
            ? openTabIds.value
            : [scenario.localId, ...openTabIds.value];
    }
    function closeScenarioTab(localId) {
        const remainingIds = openTabIds.value.filter(item => item !== localId);
        openTabIds.value = remainingIds;
        if (currentLocalId.value !== localId)
            return;
        const nextScenario = savedScenarios.value.find(item => item.localId === remainingIds[0]);
        if (nextScenario) {
            setEditorFromScenario(nextScenario);
            return;
        }
        resetToDefaultSession();
    }
    function duplicateScenario(scenario) {
        const nextScenario = {
            ...scenario,
            localId: createLocalId(),
            remoteId: null,
            name: `${scenario.name} Copy`,
            input: cloneInput(scenario.input),
            savedAt: new Date().toISOString(),
        };
        syncSavedScenario(nextScenario);
        openTabIds.value = [nextScenario.localId, ...openTabIds.value.filter(item => item !== nextScenario.localId)];
        setEditorFromScenario(nextScenario);
        return nextScenario;
    }
    function startRenameScenario(scenario) {
        renamingLocalId.value = scenario.localId;
        renameDraft.value = scenario.name;
    }
    function cancelRenameScenario() {
        renamingLocalId.value = null;
        renameDraft.value = '';
    }
    async function submitRenameScenario(scenario) {
        const nextName = renameDraft.value.trim();
        if (!nextName)
            return 'empty';
        const updatedScenario = {
            ...scenario,
            name: nextName,
            savedAt: new Date().toISOString(),
        };
        syncSavedScenario(updatedScenario);
        if (currentLocalId.value === scenario.localId)
            scenarioName.value = nextName;
        cancelRenameScenario();
        if (!scenario.remoteId || !hasScenarioApiConfig())
            return 'local';
        try {
            const updated = await updateScenario(scenario.remoteId, { name: nextName });
            syncSavedScenario(toStoredScenarioFromRecord(updated, scenario.localId));
            return 'synced';
        }
        catch {
            return 'sync-failed';
        }
    }
    async function deleteScenario(scenario) {
        const nextSavedScenarios = savedScenarios.value.filter(item => item.localId !== scenario.localId);
        const nextOpenTabIds = openTabIds.value.filter(item => item !== scenario.localId);
        savedScenarios.value = nextSavedScenarios;
        openTabIds.value = nextOpenTabIds;
        if (currentLocalId.value === scenario.localId) {
            const nextScenario = nextSavedScenarios.find(item => nextOpenTabIds.includes(item.localId));
            if (nextScenario)
                setEditorFromScenario(nextScenario);
            else
                resetToDefaultSession();
        }
        cancelRenameScenario();
        if (!scenario.remoteId || !hasScenarioApiConfig())
            return 'local';
        try {
            await deleteScenarioRequest(scenario.remoteId);
            return 'synced';
        }
        catch {
            return 'sync-failed';
        }
    }
    function toCreatePayload() {
        return {
            name: scenarioName.value.trim() || getDefaultScenarioName(presetKey.value),
            customerName: customerName.value.trim() || null,
            notes: scenarioNotes.value.trim() || null,
            language: language.value,
            presetKey: presetKey.value,
            formulaVersion: FORMULA_VERSION,
            input: cloneInput(input.value),
            result: result.value,
        };
    }
    function toUpdatePayload() {
        return toCreatePayload();
    }
    async function saveScenario() {
        const nextLocalId = currentLocalId.value ?? createLocalId();
        const baseScenario = {
            localId: nextLocalId,
            remoteId: currentRemoteId.value,
            name: scenarioName.value.trim() || getDefaultScenarioName(presetKey.value),
            customerName: customerName.value.trim(),
            notes: scenarioNotes.value.trim(),
            language: language.value,
            presetKey: presetKey.value,
            input: cloneInput(input.value),
            autoOTEnabled: autoOTEnabled.value,
            otEdited: otEdited.value,
            factorChoice: factorChoice.value,
            savedAt: new Date().toISOString(),
        };
        syncSavedScenario(baseScenario);
        openTabIds.value = openTabIds.value.includes(nextLocalId) ? openTabIds.value : [nextLocalId, ...openTabIds.value];
        currentLocalId.value = nextLocalId;
        scenarioName.value = baseScenario.name;
        if (!hasScenarioApiConfig())
            return { status: 'local', scenario: baseScenario };
        try {
            if (currentRemoteId.value) {
                const updated = await updateScenario(currentRemoteId.value, toUpdatePayload());
                const synced = toStoredScenarioFromRecord(updated, nextLocalId);
                syncSavedScenario(synced);
                currentRemoteId.value = synced.remoteId;
                return { status: 'synced', scenario: synced };
            }
            const created = await createScenario(toCreatePayload());
            const synced = toStoredScenarioFromRecord(created, nextLocalId);
            currentRemoteId.value = created.id;
            syncSavedScenario(synced);
            return { status: 'synced', scenario: synced };
        }
        catch {
            return { status: 'sync-failed', scenario: baseScenario };
        }
    }
    async function loadRemoteScenarios() {
        if (!hasHydrated.value || !hasScenarioApiConfig())
            return;
        isRemoteLoading.value = true;
        try {
            const records = await listScenarios();
            savedScenarios.value = mergeScenarioCollections(savedScenarios.value, records.map(record => {
                const existing = savedScenarios.value.find(item => item.remoteId === record.id);
                return toStoredScenarioFromRecord(record, existing?.localId);
            }));
            return 'ok';
        }
        catch {
            return 'error';
        }
        finally {
            isRemoteLoading.value = false;
        }
    }
    function hydrate() {
        if (hasHydrated.value || typeof window === 'undefined')
            return;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            hasHydrated.value = true;
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            const items = Array.isArray(parsed.items)
                ? parsed.items.map(item => normalizeStoredScenario(item)).filter(Boolean)
                : [];
            const tabs = Array.isArray(parsed.openTabIds) ? parsed.openTabIds : [];
            const nextHiddenPresetKeys = Array.isArray(parsed.hiddenPresetKeys)
                ? parsed.hiddenPresetKeys.filter(key => typeof key === 'string' && key in roiPresets && key !== 'default')
                : [];
            const nextCurrentLocalId = typeof parsed.currentLocalId === 'string' && items.some(item => item.localId === parsed.currentLocalId)
                ? parsed.currentLocalId
                : null;
            savedScenarios.value = items;
            openTabIds.value = tabs.filter(tabId => items.some(item => item.localId === tabId));
            hiddenPresetKeys.value = nextHiddenPresetKeys;
            currentLocalId.value = nextCurrentLocalId;
            sortMode.value = parsed.sortMode === 'name' ? 'name' : 'recent';
        }
        catch {
            savedScenarios.value = [];
            openTabIds.value = [];
            hiddenPresetKeys.value = [];
            currentLocalId.value = null;
            sortMode.value = 'recent';
        }
        finally {
            hasHydrated.value = true;
        }
        if (!hasRestoredEditor.value && savedScenarios.value.length > 0) {
            const targetScenario = (currentLocalId.value ? savedScenarios.value.find(item => item.localId === currentLocalId.value) : undefined)
                ?? savedScenarios.value.find(item => openTabIds.value.includes(item.localId));
            if (targetScenario) {
                hasRestoredEditor.value = true;
                setEditorFromScenario(targetScenario);
            }
        }
    }
    watch([savedScenarios, openTabIds, hiddenPresetKeys, currentLocalId, sortMode], () => {
        if (!hasHydrated.value || typeof window === 'undefined')
            return;
        const payload = {
            items: savedScenarios.value,
            openTabIds: openTabIds.value,
            hiddenPresetKeys: hiddenPresetKeys.value,
            currentLocalId: currentLocalId.value,
            sortMode: sortMode.value,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, { deep: true });
    return {
        autoOTEnabled,
        cancelRenameScenario,
        closePresetTab,
        closeScenarioTab,
        currentLocalId,
        currentRemoteId,
        customerName,
        deleteScenario,
        duplicateScenario,
        factorChoice,
        formatterLocale,
        hasHydrated,
        hiddenPresetKeys,
        hydrate,
        input,
        isRemoteLoading,
        language,
        loadRemoteScenarios,
        openScenario,
        openTabIds,
        otEdited,
        presetKey,
        renameDraft,
        renamingLocalId,
        resetToDefaultSession,
        result,
        saveScenario,
        savedScenarios,
        scenarioGroups,
        scenarioName,
        scenarioNotes,
        selectFactor,
        selectPreset,
        setLanguage,
        setEditorFromScenario,
        sortMode,
        startRenameScenario,
        submitRenameScenario,
        syncSavedScenario,
        updateInput,
        activatePresetTab,
        visiblePresetKeys,
        visibleTabs,
    };
});
