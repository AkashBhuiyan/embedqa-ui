import {computed, Injectable, signal} from '@angular/core';
import {Environment} from "@core/models/Environment";

@Injectable({
    providedIn: 'root'
})
export class StateService {

    private _activeEnvironment = signal<Environment | null>(null);
    private _sidebarCollapsed = signal<boolean>(false);

    readonly activeEnvironment = computed(() => this._activeEnvironment());
    readonly sidebarCollapsed = computed(() => this._sidebarCollapsed());

    setActiveEnvironment(env: Environment | null): void {
        this._activeEnvironment.set(env);
    }

    toggleSidebar(): void {
        this._sidebarCollapsed.update(collapsed => !collapsed);
    }

    setSidebarCollapsed(collapsed: boolean): void {
        this._sidebarCollapsed.set(collapsed);
    }
}