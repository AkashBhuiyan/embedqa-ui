import {computed, Injectable, signal} from '@angular/core';
import {Environment} from "@core/models/Environment";
import {RequestTab} from "@core/models/RequestTab";
import {ExecuteRequest} from "@core/models/ExecuteRequest";
import {HttpMethod} from "@core/enums/HttpMethod";
import {BodyType} from "@core/enums/BodyType";
import {AuthType} from "@core/enums/AuthType";
import {ApiResponse} from "@core/models/ApiResponse";
import {RequestSummary} from "@core/models/RequestSummary";

@Injectable({
    providedIn: 'root'
})
export class StateService {

    private _activeEnvironment = signal<Environment | null>(null);
    private _sidebarCollapsed = signal<boolean>(false);

    private _tabs = signal<RequestTab[]>([]);
    private _activeTabId = signal<string>('');

    readonly activeEnvironment = computed(() => this._activeEnvironment());
    readonly sidebarCollapsed = computed(() => this._sidebarCollapsed());
    readonly tabs = computed(() => this._tabs());
    readonly activeTabId = computed(() => this._activeTabId());
    readonly activeTab = computed(() =>
        this._tabs().find(t => t.id === this._activeTabId()) || null
    );

    constructor() {
        // Initialize with one default tab
        this.createNewTab();
    }

    setActiveEnvironment(env: Environment | null): void {
        this._activeEnvironment.set(env);
    }

    toggleSidebar(): void {
        this._sidebarCollapsed.update(collapsed => !collapsed);
    }

    setSidebarCollapsed(collapsed: boolean): void {
        this._sidebarCollapsed.set(collapsed);
    }

    createNewTab(): string {
        const id = this.generateId();

        const defaultRequest: ExecuteRequest = {
            url: '',
            method: HttpMethod.GET,
            headers: [{key: '', value: '', enabled: true}],
            queryParams: [{key: '', value: '', enabled: true}],
            body: '',
            bodyType: BodyType.NONE,
            authType: AuthType.NONE,
            timeout: 30000,
            followRedirects: true,
            verifySsl: true
        };

        const newTab: RequestTab = {
            id,
            name: 'New Request',
            request: defaultRequest,
            loading: false,
            dirty: false
        };

        this._tabs.update(tabs => [...tabs, newTab]);
        this._activeTabId.set(id);

        return id;
    }

    closeTab(id: string): void {
        const tabs = this._tabs();

        if (tabs.length <= 1) {
            this.resetTab(id);
            return;
        }

        const index = tabs.findIndex(t => t.id === id);
        this._tabs.update(tabs => tabs.filter(t => t.id !== id));

        if (this._activeTabId() === id) {
            const remainingTabs = tabs.filter(t => t.id !== id);
            const newIndex = Math.min(index, remainingTabs.length - 1);
            this._activeTabId.set(remainingTabs[newIndex]?.id || '');
        }
    }

    setActiveTab(id: string): void {
        this._activeTabId.set(id);
    }

    updateTabRequest(id: string, updates: Partial<ExecuteRequest>): void {
        this._tabs.update(tabs =>
            tabs.map(tab => {
                if (tab.id === id) {
                    return {
                        ...tab,
                        request: {...tab.request, ...updates},
                        dirty: true
                    };
                }
                return tab;
            })
        );
    }

    setTabLoading(id: string, loading: boolean): void {
        this._tabs.update(tabs =>
            tabs.map(tab => tab.id === id ? {...tab, loading} : tab)
        );
    }

    updateTabResponse(id: string, response: ApiResponse | undefined): void {
        this._tabs.update(tabs =>
            tabs.map(tab => tab.id === id ? {...tab, response} : tab)
        );
    }

    private resetTab(id: string): void {
        this._tabs.update(tabs =>
            tabs.map(tab => {
                if (tab.id === id) {
                    return {
                        ...tab,
                        name: 'New Request',
                        request: {
                            url: '',
                            method: HttpMethod.GET,
                            headers: [{key: '', value: '', enabled: true}],
                            queryParams: [{key: '', value: '', enabled: true}],
                            body: '',
                            bodyType: BodyType.NONE,
                            authType: AuthType.NONE,
                            timeout: 30000,
                            followRedirects: true,
                            verifySsl: true
                        },
                        response: undefined,
                        loading: false,
                        dirty: false,
                        savedRequestId: undefined
                    };
                }
                return tab;
            })
        );
    }

    loadRequestInNewTab(request: RequestSummary): string {
        const id = this.generateId();

        const newTab: RequestTab = {
            id,
            name: request.name,
            request: {
                url: request.url,
                method: request.method,
                headers: [{key: '', value: '', enabled: true}],
                queryParams: [{key: '', value: '', enabled: true}],
                body: '',
                bodyType: BodyType.NONE,
                authType: AuthType.NONE,
                timeout: 30000,
                followRedirects: true,
                verifySsl: true
            },
            loading: false,
            dirty: false,
            savedRequestId: request.id
        };

        this._tabs.update(tabs => [...tabs, newTab]);
        this._activeTabId.set(id);

        return id;
    }

    private generateId(): string {
        return `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}