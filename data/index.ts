import { Registry, type RegistryData } from "../engine/registry";
import type { VersionFlags } from "../engine/types";
import type { NamedSetup } from "./1.16.1/presets";
import type { LootTable } from "./1.16.1/loot";

import {
  REGISTRY_DATA_1_16_1,
  FLAGS_1_16_1,
  LOOT_TABLES as LOOT_1_16_1,
  PRESETS_1_16_1,
} from "./1.16.1";
import { REGISTRY_DATA_1_21, FLAGS_1_21, PRESETS_1_21, LOOT_1_21 } from "./1.21";

export interface VersionBundle {
  version: string;
  label: string;
  data: RegistryData;
  flags: VersionFlags;
  loot: LootTable[];
  presets: NamedSetup[];
}

export const VERSIONS: Record<string, VersionBundle> = {
  "1.16.1": {
    version: "1.16.1",
    label: "1.16.1 (MCSR)",
    data: REGISTRY_DATA_1_16_1,
    flags: FLAGS_1_16_1,
    loot: LOOT_1_16_1,
    presets: PRESETS_1_16_1,
  },
  "1.21": {
    version: "1.21",
    label: "1.21 (latest)",
    data: REGISTRY_DATA_1_21,
    flags: FLAGS_1_21,
    loot: LOOT_1_21,
    presets: PRESETS_1_21,
  },
};

export const DEFAULT_VERSION = "1.16.1";

const registryCache = new Map<string, Registry>();

export function getBundle(version: string): VersionBundle {
  return VERSIONS[version] ?? VERSIONS[DEFAULT_VERSION];
}

export function getRegistry(version: string): Registry {
  const cached = registryCache.get(version);
  if (cached) return cached;
  const reg = new Registry(getBundle(version).data);
  registryCache.set(version, reg);
  return reg;
}

export function listVersions(): { id: string; label: string }[] {
  return Object.values(VERSIONS).map((v) => ({ id: v.version, label: v.label }));
}
