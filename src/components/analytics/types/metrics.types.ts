import React from "react";

// Metric keys
export type MetricKey = 'views' | 'likes' | 'comments' | 'shares';

// Metric info structure
export interface MetricInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

// Daily data structure
export interface DailyData {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  [key: string]: number | string; // Allow indexing by string
}

// Totals structure
export interface Totals {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  [key: string]: number; // Allow indexing by string
}