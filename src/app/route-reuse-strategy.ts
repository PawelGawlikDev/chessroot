import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
} from '@angular/router';

const REUSABLE_ROUTE_PATHS = new Set(['tools', 'achievements', 'explorer']);

export interface RouteReactivatable {
  onRouteReactivated(): void;
}

export function isRouteReactivatable(component: unknown): component is RouteReactivatable {
  return (
    !!component &&
    typeof (component as Partial<RouteReactivatable>).onRouteReactivated === 'function'
  );
}

@Injectable()
export class ChessRootRouteReuseStrategy extends BaseRouteReuseStrategy {
  private readonly handles = new Map<string, DetachedRouteHandle>();

  public override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.routeKey(route) !== null;
  }

  public override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    const key = this.routeKey(route);
    if (!key) return;

    if (handle) {
      this.handles.set(key, handle);
    } else {
      this.handles.delete(key);
    }
  }

  public override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.routeKey(route);
    return key !== null && this.handles.has(key);
  }

  public override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.routeKey(route);
    return key ? (this.handles.get(key) ?? null) : null;
  }

  private routeKey(route: ActivatedRouteSnapshot): string | null {
    const path = route.routeConfig?.path;
    return path && REUSABLE_ROUTE_PATHS.has(path) ? path : null;
  }
}
