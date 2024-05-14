import { STATE_GLOBAL } from "../constants";

export type IStates = typeof STATE_GLOBAL;
export interface IChangelog {
  id: number;
  title: string;
  template: string[];
  info: string[];
  hostsets: string[];
  prs: string[];
  linkAsana: string;
}

export interface IDownload {
  data: string;
  name: string;
  type: BlobPropertyBag['type'];
}

export interface IExportation {
  changelog: boolean;
  hostsets: boolean;
  pr: boolean;
}