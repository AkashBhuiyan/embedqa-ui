import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {StateService} from '@core/services/state.service';
import {ApiExecutorService} from '@core/services/api-executor.service';
import {HttpMethod, getAllHttpMethods} from '@core/enums/HttpMethod';
import {BodyType, getAllBodyTypes} from '@core/enums/BodyType';
import {AuthType, getAllAuthTypes} from '@core/enums/AuthType';
import {KeyValuePair} from '@core/models/KeyValuePair';
import {KeyValueEditorComponent} from "@shared/key-value-editor/key-value-editor.component";

@Component({
    selector: 'app-request-builder',
    standalone: true,
    imports: [CommonModule, FormsModule, KeyValueEditorComponent],
    templateUrl: './request-builder.component.html',
    styleUrl: './request-builder.component.scss'
})
export class RequestBuilderComponent {
    private stateService = inject(StateService);
    private apiExecutor = inject(ApiExecutorService);

    // Expose to template
    tabs = this.stateService.tabs;
    activeTab = this.stateService.activeTab;
    activeTabId = this.stateService.activeTabId;
    activeEnvironment = this.stateService.activeEnvironment;

    // Enums for template
    httpMethods = getAllHttpMethods();
    bodyTypes = getAllBodyTypes();
    authTypes = getAllAuthTypes();

    // UI State
    activeConfigTab: 'params' | 'headers' | 'body' | 'auth' = 'params';
    activeResponseTab: 'body' | 'headers' = 'body';

    // Tab Actions
    createNewTab(): void {
        this.stateService.createNewTab();
    }

    closeTab(id: string, event: Event): void {
        event.stopPropagation();
        this.stateService.closeTab(id);
    }

    selectTab(id: string): void {
        this.stateService.setActiveTab(id);
    }

    // Request Updates
    updateUrl(url: string): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {url});
        }
    }

    updateMethod(method: HttpMethod): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {method});
        }
    }

    updateHeaders(headers: KeyValuePair[]): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {headers});
        }
    }

    updateParams(queryParams: KeyValuePair[]): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {queryParams});
        }
    }

    updateBody(body: string): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {body});
        }
    }

    updateBodyType(bodyType: BodyType): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {bodyType});
        }
    }

    updateAuthType(authType: AuthType): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {authType});
        }
    }

    updateAuthConfig(field: string, value: string): void {
        const tab = this.activeTab();
        if (tab) {
            const authConfig = {...(tab.request.authConfig || {}), [field]: value};
            this.stateService.updateTabRequest(tab.id, {authConfig});
        }
    }

    // Send Request
    sendRequest(): void {
        const tab = this.activeTab();
        if (!tab || !tab.request.url) return;

        this.stateService.setTabLoading(tab.id, true);
        this.stateService.updateTabResponse(tab.id, undefined);

        const request = {
            ...tab.request,
            environmentId: this.activeEnvironment()?.id
        };

        this.apiExecutor.executeRequest(request).subscribe({
            next: (response) => {
                this.stateService.updateTabResponse(tab.id, response);
                this.stateService.setTabLoading(tab.id, false);
            },
            error: (err) => {
                this.stateService.updateTabResponse(tab.id, {
                    statusCode: 0,
                    statusText: 'Error',
                    body: '',
                    contentType: '',
                    bodySize: 0,
                    headers: [],
                    responseTimeMs: 0,
                    requestUrl: tab.request.url,
                    requestMethod: tab.request.method,
                    timestamp: new Date().toISOString(),
                    success: false,
                    errorMessage: err.message || 'Request failed'
                });
                this.stateService.setTabLoading(tab.id, false);
            }
        });
    }

    // Helpers
    getMethodClass(method: HttpMethod): string {
        return `method-${method.toLowerCase()}`;
    }

    getStatusClass(statusCode: number): string {
        if (statusCode >= 200 && statusCode < 300) return 'status-success';
        if (statusCode >= 300 && statusCode < 400) return 'status-redirect';
        if (statusCode >= 400 && statusCode < 500) return 'status-client-error';
        if (statusCode >= 500) return 'status-server-error';
        return 'status-error';
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    getParamsCount(): number {
        const tab = this.activeTab();
        return tab ? tab.request.queryParams.filter(p => p.key).length : 0;
    }

    getHeadersCount(): number {
        const tab = this.activeTab();
        return tab ? tab.request.headers.filter(h => h.key).length : 0;
    }
}
