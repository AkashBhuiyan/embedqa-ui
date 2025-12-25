import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateService} from "@core/services/state.service";
import {CollectionService} from "@core/services/collection.service";
import {Router} from "@angular/router";
import {Collection} from "@core/models/Collection";
import {CollectionDTO} from "@core/models/CollectionDTO";
import {RequestSummary} from "@core/models/RequestSummary";

@Component({
    selector: 'app-collections',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './collections.component.html',
    styleUrl: './collections.component.scss'
})
export class CollectionsComponent implements OnInit {
    private collectionService = inject(CollectionService);
    private stateService = inject(StateService);
    private router = inject(Router);

    collections = signal<Collection[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Modal state
    showModal = signal(false);
    modalMode = signal<'create' | 'edit'>('create');
    editingCollection = signal<Collection | null>(null);

    // Form data
    formData = signal<CollectionDTO>({
        name: '',
        description: ''
    });

    // Expanded collections
    expandedIds = signal<Set<number>>(new Set());

    ngOnInit(): void {
        this.loadCollections();
    }

    loadCollections(): void {
        this.loading.set(true);
        this.error.set(null);

        this.collectionService.getCollections().subscribe({
            next: (collections) => {
                this.collections.set(collections);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err.message || 'Failed to load collections');
                this.loading.set(false);
            }
        });
    }

    // Modal actions
    openCreateModal(): void {
        this.modalMode.set('create');
        this.editingCollection.set(null);
        this.formData.set({name: '', description: ''});
        this.showModal.set(true);
    }

    openEditModal(collection: Collection, event: Event): void {
        event.stopPropagation();
        this.modalMode.set('edit');
        this.editingCollection.set(collection);
        this.formData.set({
            name: collection.name,
            description: collection.description || ''
        });
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingCollection.set(null);
    }

    saveCollection(): void {
        const data = this.formData();
        if (!data.name.trim()) return;

        this.loading.set(true);

        if (this.modalMode() === 'create') {
            this.collectionService.createCollection(data).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadCollections();
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to create collection');
                    this.loading.set(false);
                }
            });
        } else {
            const id = this.editingCollection()?.id;
            if (id) {
                this.collectionService.updateCollection(id, data).subscribe({
                    next: () => {
                        this.closeModal();
                        this.loadCollections();
                    },
                    error: (err) => {
                        this.error.set(err.message || 'Failed to update collection');
                        this.loading.set(false);
                    }
                });
            }
        }
    }

    deleteCollection(collection: Collection, event: Event): void {
        event.stopPropagation();
        if (!confirm(`Delete "${collection.name}"? This will also delete all requests in this collection.`)) {
            return;
        }

        this.collectionService.deleteCollection(collection.id).subscribe({
            next: () => this.loadCollections(),
            error: (err) => this.error.set(err.message || 'Failed to delete collection')
        });
    }

    // Expand/collapse
    toggleExpand(id: number): void {
        const expanded = new Set(this.expandedIds());
        if (expanded.has(id)) {
            expanded.delete(id);
        } else {
            expanded.add(id);
        }
        this.expandedIds.set(expanded);
    }

    isExpanded(id: number): boolean {
        return this.expandedIds().has(id);
    }

    // Open request in new tab
    openRequest(request: RequestSummary): void {
        this.stateService.loadRequestInNewTab(request);
        this.router.navigate(['/']);
    }

    getRequestCount(collection: Collection): number {
        return collection.requestCount || collection.requests?.length || 0;
    }

    // Form helpers
    updateFormField(field: keyof CollectionDTO, value: string): void {
        this.formData.update(data => ({...data, [field]: value}));
    }

    // Method color helper
    getMethodClass(method: string): string {
        return `method-${method.toLowerCase()}`;
    }
}