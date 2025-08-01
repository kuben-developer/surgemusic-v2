// This file is intentionally kept minimal since the app router imports directly from sub-features.
// The videos sub-feature exports are used internally by the detail sub-feature.

// Video components used by detail sub-feature
export { 
  VideoTableView, 
  ViewToggle,
  type ViewMode 
} from './videos';