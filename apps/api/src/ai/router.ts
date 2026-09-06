import type {
  AiGenerationMode,
  AiGenerationRequest,
  AiSourceSensitivity,
  AiSubjectDomain,
} from "./contracts.js";
import type { AiProviderAdapter } from "./provider.js";

export interface AiRouteCapacity {
  providerMaxConcurrent?: number;
  projectMaxConcurrent?: number;
  modelMaxConcurrent?: number;
}

export interface AiModelRoute {
  routeKey: string;
  providerKey: string;
  modelKey: string;
  benchmarkVersion: string;
  tier: number;
  projectAlias?: string;
  credentialAlias?: string;
  modes?: readonly AiGenerationMode[];
  subjectDomains?: readonly AiSubjectDomain[];
  sourceSensitivities?: readonly AiSourceSensitivity[];
  capacity?: AiRouteCapacity;
  enabled?: boolean;
}

export interface ResolvedAiRouteCapacity {
  providerMaxConcurrent: number;
  projectMaxConcurrent: number | null;
  modelMaxConcurrent: number;
}

export type AiRouteAvailability = (route: AiModelRoute, request: AiGenerationRequest) => boolean;

function includesOrAll<T>(values: readonly T[] | undefined, value: T): boolean {
  return !values || values.includes(value);
}

function assertCapacityValue(routeKey: string, name: string, value: number | undefined): void {
  if (value === undefined) return;
  if (!Number.isInteger(value) || value < 1 || value > 10_000) {
    throw new Error(`ai_route_capacity_invalid:${routeKey}:${name}`);
  }
}

export function resolveRouteCapacity(route: AiModelRoute): ResolvedAiRouteCapacity {
  return {
    providerMaxConcurrent: route.capacity?.providerMaxConcurrent ?? 1,
    projectMaxConcurrent: route.projectAlias ? (route.capacity?.projectMaxConcurrent ?? 1) : null,
    modelMaxConcurrent: route.capacity?.modelMaxConcurrent ?? 1,
  };
}

export class AiModelRouter {
  private readonly adapterByProvider = new Map<string, AiProviderAdapter>();

  constructor(
    private readonly routes: readonly AiModelRoute[],
    adapters: readonly AiProviderAdapter[],
    private readonly isAvailable: AiRouteAvailability = () => true,
  ) {
    for (const adapter of adapters) {
      if (this.adapterByProvider.has(adapter.providerKey)) {
        throw new Error(`duplicate_ai_provider_adapter:${adapter.providerKey}`);
      }
      this.adapterByProvider.set(adapter.providerKey, adapter);
    }
    for (const route of routes) {
      if (!this.adapterByProvider.has(route.providerKey)) {
        throw new Error(`ai_route_provider_missing:${route.routeKey}:${route.providerKey}`);
      }
      if (!route.routeKey.trim() || !route.modelKey.trim() || !route.benchmarkVersion.trim()) {
        throw new Error(`ai_route_invalid:${route.routeKey}`);
      }
      if (!Number.isInteger(route.tier) || route.tier < 1)
        throw new Error(`ai_route_tier_invalid:${route.routeKey}`);
      assertCapacityValue(route.routeKey, "provider", route.capacity?.providerMaxConcurrent);
      assertCapacityValue(route.routeKey, "project", route.capacity?.projectMaxConcurrent);
      assertCapacityValue(route.routeKey, "model", route.capacity?.modelMaxConcurrent);
      if (!route.projectAlias && route.capacity?.projectMaxConcurrent !== undefined) {
        throw new Error(`ai_route_project_capacity_without_project:${route.routeKey}`);
      }
    }
  }

  routesFor(request: AiGenerationRequest): readonly AiModelRoute[] {
    return [...this.routes]
      .filter((route) => route.enabled !== false)
      .filter((route) => includesOrAll(route.modes, request.mode))
      .filter((route) => includesOrAll(route.subjectDomains, request.subjectDomain))
      .filter((route) => includesOrAll(route.sourceSensitivities, request.sourceSensitivity))
      .filter((route) => this.isAvailable(route, request))
      .sort((left, right) => left.tier - right.tier || left.routeKey.localeCompare(right.routeKey));
  }

  adapterFor(route: AiModelRoute): AiProviderAdapter {
    const adapter = this.adapterByProvider.get(route.providerKey);
    if (!adapter) throw new Error(`ai_route_provider_missing:${route.routeKey}:${route.providerKey}`);
    return adapter;
  }
}
