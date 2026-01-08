import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {StateService} from '@core/services/state.service';
import {ApiExecutorService} from '@core/services/api-executor.service';
import {RequestService} from '@core/services/request.service';
import {CollectionService} from '@core/services/collection.service';
import {HttpMethod, getAllHttpMethods} from '@core/enums/HttpMethod';
import {BodyType, getAllBodyTypes} from '@core/enums/BodyType';
import {AuthType, getAllAuthTypes} from '@core/enums/AuthType';
import {KeyValuePair} from '@core/models/KeyValuePair';
import {Collection} from '@core/models/Collection';
import {SaveRequest} from '@core/models/SaveRequest';
import {KeyValueEditorComponent} from "@shared/key-value-editor/key-value-editor.component";

@Component({
    selector: 'app-request-builder',
    standalone: true,
    imports: [CommonModule, FormsModule, KeyValueEditorComponent],
    templateUrl: './request-builder.component.html',
    styleUrl: './request-builder.component.scss'
})
export class RequestBuilderComponent implements OnInit {
    private stateService = inject(StateService);
    private apiExecutor = inject(ApiExecutorService);
    private requestService = inject(RequestService);
    private collectionService = inject(CollectionService);

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

    // Save Modal State
    showSaveModal = signal(false);
    collections = signal<Collection[]>([]);
    saveForm = signal({
        name: '',
        description: '',
        collectionOption: 'existing' as 'existing' | 'new' | 'none',
        selectedCollectionId: null as number | null,
        newCollectionName: '',
        newCollectionDescription: ''
    });
    saving = signal(false);
    saveError = signal<string | null>(null);
    saveSuccess = signal(false);

    ngOnInit(): void {
        this.loadCollections();
    }

    loadCollections(): void {
        this.collectionService.getCollections().subscribe({
            next: (collections) => this.collections.set(collections),
            error: (err) => console.error('Failed to load collections:', err)
        });
    }

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

    updateFormData(formData: KeyValuePair[]): void {
        const tab = this.activeTab();
        if (tab) {
            this.stateService.updateTabRequest(tab.id, {formData});
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

    // Save Request Modal
    openSaveModal(): void {
        const tab = this.activeTab();
        if (!tab) return;

        // Pre-fill form with current request info
        const urlPath = this.extractPathFromUrl(tab.request.url);
        this.saveForm.set({
            name: tab.name !== 'New Request' ? tab.name : urlPath || 'New Request',
            description: '',
            collectionOption: 'existing',
            selectedCollectionId: null,
            newCollectionName: '',
            newCollectionDescription: ''
        });
        this.saveError.set(null);
        this.saveSuccess.set(false);
        this.loadCollections();
        this.showSaveModal.set(true);
    }

    closeSaveModal(): void {
        this.showSaveModal.set(false);
        this.saveError.set(null);
        this.saveSuccess.set(false);
    }

    updateSaveForm(field: string, value: any): void {
        this.saveForm.update(form => ({...form, [field]: value}));
    }

    saveRequest(): void {
        const tab = this.activeTab();
        const form = this.saveForm();

        if (!tab || !form.name.trim()) {
            this.saveError.set('Request name is required');
            return;
        }

        if (form.collectionOption === 'new' && !form.newCollectionName.trim()) {
            this.saveError.set('Collection name is required');
            return;
        }

        this.saving.set(true);
        this.saveError.set(null);

        const saveRequest: SaveRequest = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            url: tab.request.url,
            method: tab.request.method,
            headers: tab.request.headers.filter(h => h.key && h.enabled),
            queryParams: tab.request.queryParams.filter(p => p.key && p.enabled),
            body: tab.request.body,
            bodyType: tab.request.bodyType,
            authType: tab.request.authType,
            authConfig: tab.request.authConfig,
            environmentId: this.activeEnvironment()?.id
        };

        // Set collection based on option
        if (form.collectionOption === 'existing' && form.selectedCollectionId) {
            saveRequest.collectionId = form.selectedCollectionId;
        } else if (form.collectionOption === 'new') {
            saveRequest.newCollectionName = form.newCollectionName.trim();
            saveRequest.newCollectionDescription = form.newCollectionDescription.trim() || undefined;
        }

        this.requestService.saveRequest(saveRequest).subscribe({
            next: (savedRequest) => {
                this.saving.set(false);
                this.saveSuccess.set(true);

                // Update tab name
                this.stateService.updateTabName(tab.id, savedRequest.name);

                // Reload collections to show the new request
                this.loadCollections();

                // Close modal after a short delay
                setTimeout(() => {
                    this.closeSaveModal();
                }, 1500);
            },
            error: (err) => {
                this.saving.set(false);
                this.saveError.set(err.error?.message || 'Failed to save request');
            }
        });
    }

    private extractPathFromUrl(url: string): string {
        try {
            // Add protocol if missing for URL parsing
            const urlWithProtocol = url.includes('://') ? url : `http://${url}`;
            const urlObj = new URL(urlWithProtocol);
            const path = urlObj.pathname;
            // Get last segment of path
            const segments = path.split('/').filter(s => s);
            return segments[segments.length - 1] || path;
        } catch {
            return url.split('/').pop() || url;
        }
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

    getBodyPlaceholder(bodyType: BodyType): string {
        switch (bodyType) {
            case BodyType.JSON:
                return '{\n  "key": "value"\n}';
            case BodyType.XML:
                return '<?xml version="1.0"?>\n<root>\n  <element>value</element>\n</root>';
            case BodyType.RAW:
                return 'Enter raw body content...';
            default:
                return 'Enter request body...';
        }
    }
}
