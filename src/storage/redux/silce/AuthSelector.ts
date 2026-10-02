import { RootState } from "../store";

export const Type = (state: RootState) => state.app.type;
export const Tab = (state: RootState) => state.app.tab;
export const HasLaunched = (state: RootState) => state.app.hasLaunched;