import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { initialImageSelected } from 'features/parameters/store/generationSlice';
import { setActiveTabReducer } from './extraReducers';
import { InvokeTabName, tabMap } from './tabMap';
import { AddNewModelType, UIState } from './uiTypes';

const initialtabsState: UIState = {
  activeTab: 0,
  currentTheme: 'dark',
  parametersPanelScrollPosition: 0,
  shouldPinParametersPanel: true,
  shouldShowParametersPanel: true,
  shouldShowImageDetails: false,
  shouldUseCanvasBetaLayout: false,
  shouldShowExistingModelsInSearch: false,
  shouldUseSliders: false,
  addNewModelUIOption: null,
  shouldPinGallery: true,
  shouldShowGallery: true,
  disabledParameterPanels: [],
  disabledTabs: [],
};

const initialState: UIState = initialtabsState;

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<number | InvokeTabName>) => {
      setActiveTabReducer(state, action.payload);
    },
    setCurrentTheme: (state, action: PayloadAction<string>) => {
      state.currentTheme = action.payload;
    },
    setParametersPanelScrollPosition: (
      state,
      action: PayloadAction<number>
    ) => {
      state.parametersPanelScrollPosition = action.payload;
    },
    setShouldPinParametersPanel: (state, action: PayloadAction<boolean>) => {
      state.shouldPinParametersPanel = action.payload;
      state.shouldShowParametersPanel = true;
    },
    setShouldShowParametersPanel: (state, action: PayloadAction<boolean>) => {
      state.shouldShowParametersPanel = action.payload;
    },
    setShouldShowImageDetails: (state, action: PayloadAction<boolean>) => {
      state.shouldShowImageDetails = action.payload;
    },
    setShouldUseCanvasBetaLayout: (state, action: PayloadAction<boolean>) => {
      state.shouldUseCanvasBetaLayout = action.payload;
    },
    setShouldShowExistingModelsInSearch: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.shouldShowExistingModelsInSearch = action.payload;
    },
    setShouldUseSliders: (state, action: PayloadAction<boolean>) => {
      state.shouldUseSliders = action.payload;
    },
    setAddNewModelUIOption: (state, action: PayloadAction<AddNewModelType>) => {
      state.addNewModelUIOption = action.payload;
    },
    setShouldPinGallery: (state, action: PayloadAction<boolean>) => {
      state.shouldPinGallery = action.payload;
    },
    setShouldShowGallery: (state, action: PayloadAction<boolean>) => {
      state.shouldShowGallery = action.payload;
    },
    togglePinGalleryPanel: (state) => {
      state.shouldPinGallery = !state.shouldPinGallery;
    },
    togglePinParametersPanel: (state) => {
      state.shouldPinParametersPanel = !state.shouldPinParametersPanel;
    },
    toggleParametersPanel: (state) => {
      state.shouldShowParametersPanel = !state.shouldShowParametersPanel;
    },
    toggleGalleryPanel: (state) => {
      state.shouldShowGallery = !state.shouldShowGallery;
    },
    togglePanels: (state) => {
      if (state.shouldShowGallery || state.shouldShowParametersPanel) {
        state.shouldShowGallery = false;
        state.shouldShowParametersPanel = false;
      } else {
        state.shouldShowGallery = true;
        state.shouldShowParametersPanel = true;
      }
    },
    setDisabledPanels: (state, action: PayloadAction<string[]>) => {
      state.disabledParameterPanels = action.payload;
    },
    setDisabledTabs: (state, action: PayloadAction<InvokeTabName[]>) => {
      state.disabledTabs = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(initialImageSelected, (state) => {
      if (tabMap[state.activeTab] !== 'img2img') {
        setActiveTabReducer(state, 'img2img');
      }
    });
  },
});

export const {
  setActiveTab,
  setCurrentTheme,
  setParametersPanelScrollPosition,
  setShouldPinParametersPanel,
  setShouldShowParametersPanel,
  setShouldShowImageDetails,
  setShouldUseCanvasBetaLayout,
  setShouldShowExistingModelsInSearch,
  setShouldUseSliders,
  setAddNewModelUIOption,
  setShouldPinGallery,
  setShouldShowGallery,
  togglePanels,
  togglePinGalleryPanel,
  togglePinParametersPanel,
  toggleParametersPanel,
  toggleGalleryPanel,
  setDisabledPanels,
  setDisabledTabs,
} = uiSlice.actions;

export default uiSlice.reducer;
