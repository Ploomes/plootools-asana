import { STATE_GLOBAL } from "../constants";

export type IStates = typeof STATE_GLOBAL;
export interface IChangelog {
  id: number;
  template: string[];
  info: string[];
  hostsets: string[];
}

export interface IDownload {
  data: string;
  name: string;
  type: BlobPropertyBag['type'];
}