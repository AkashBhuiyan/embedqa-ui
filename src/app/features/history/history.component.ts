import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {StateService} from "@core/services/state.service";
import {HistoryService} from "@core/services/history.service";
import {HttpMethod} from "@core/enums/HttpMethod";
import {HistoryEntry} from "@core/models/HistoryEntry";
import {HistoryFilter} from "@core/models/HistoryFilter";
import {BodyType} from "@core/enums/BodyType";
import {AuthType} from "@core/enums/AuthType";
import {PageInfo} from "@core/models/PageInfo";

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryService);
  private stateService = inject(StateService);

  // Data
  entries = signal<HistoryEntry[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  pageInfo = signal<PageInfo | null>(null);

  // Filters
  searchQuery = signal('');
  methodFilter = signal<HttpMethod | ''>('');
  statusFilter = signal<'all' | 'success' | 'error'>('all');

  // UI State
  showClearConfirm = signal(false);
  expandedEntryId = signal<number | null>(null);
  selectedEntry = signal<HistoryEntry | null>(null);

  // Enums for template
  httpMethods = Object.values(HttpMethod);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(page: number = 0): void {
    this.loading.set(true);
    this.error.set(null);

    const filter: HistoryFilter = {};

    if (this.searchQuery()) {
      filter.search = this.searchQuery();
    }
    if (this.methodFilter()) {
      filter.method = this.methodFilter() as HttpMethod;
    }
    if (this.statusFilter() === 'success') {
      filter.statusCode = 200; // Will be handled server-side as < 400
    } else if (this.statusFilter() === 'error') {
      filter.statusCode = 400; // Will be handled server-side as >= 400
    }

    this.historyService.getHistory(page, 20, filter).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.entries.set(response.data);
          if (response.pageInfo) {
            this.pageInfo.set(response.pageInfo);
          }
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load history');
        this.loading.set(false);
        console.error('Error loading history:', err);
      }
    });
  }

  // Apply filters
  applyFilters(): void {
    this.loadHistory(0);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.methodFilter.set('');
    this.statusFilter.set('all');
    this.loadHistory(0);
  }

  // Pagination
  goToPage(page: number): void {
    this.loadHistory(page);
  }

  // Toggle entry expansion
  toggleExpand(entry: HistoryEntry): void {
    if (this.expandedEntryId() === entry.id) {
      this.expandedEntryId.set(null);
    } else {
      this.expandedEntryId.set(entry.id);
      // Load full details if not already loaded
      if (!entry.request) {
        this.loadEntryDetails(entry);
      }
    }
  }

  isExpanded(entry: HistoryEntry): boolean {
    return this.expandedEntryId() === entry.id;
  }

  loadEntryDetails(entry: HistoryEntry): void {
    this.historyService.getById(entry.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the entry in the list with full details
          this.entries.update(entries =>
              entries.map(e => e.id === entry.id ? response.data! : e)
          );
        }
      },
      error: (err) => {
        console.error('Error loading entry details:', err);
      }
    });
  }

  // Replay request in new tab
  replayRequest(entry: HistoryEntry, event: Event): void {
    event.stopPropagation();

    if (!entry.request) {
      // Load details first, then replay
      this.historyService.getById(entry.id).subscribe({
        next: (response) => {
          if (response.success && response.data?.request) {
            this.openRequestInTab(response.data);
          }
        }
      });
    } else {
      this.openRequestInTab(entry);
    }
  }

  private openRequestInTab(entry: HistoryEntry): void {
    const request = entry.request!;

    // Convert to ExecuteRequest format
    const executeRequest = {
      url: request.url,
      method: request.method,
      headers: this.mapToKeyValueArray(request.headers),
      queryParams: this.mapToKeyValueArray(request.queryParams),
      body: request.body || '',
      bodyType: (request.bodyType as BodyType) || BodyType.NONE,
      authType: (request.authType as AuthType) || AuthType.NONE,
      authConfig: request.authConfig,
      timeout: 30000,
      followRedirects: true,
      verifySsl: true
    };

    const tabName = entry.requestName || this.getUrlPath(entry.url);
    this.stateService.loadRequestInNewTabSavedRequestId(executeRequest, tabName);
  }

  private mapToKeyValueArray(obj?: Record<string, string>): Array<{key: string; value: string; enabled: boolean}> {
    if (!obj) return [{key: '', value: '', enabled: true}];

    const arr = Object.entries(obj).map(([key, value]) => ({
      key,
      value,
      enabled: true
    }));

    return arr.length > 0 ? arr : [{key: '', value: '', enabled: true}];
  }

  // Delete entry
  deleteEntry(entry: HistoryEntry, event: Event): void {
    event.stopPropagation();

    this.historyService.delete(entry.id).subscribe({
      next: () => {
        this.entries.update(entries => entries.filter(e => e.id !== entry.id));
      },
      error: (err) => {
        console.error('Error deleting entry:', err);
        this.error.set('Failed to delete entry');
      }
    });
  }

  // Clear all history
  confirmClearAll(): void {
    this.showClearConfirm.set(true);
  }

  cancelClear(): void {
    this.showClearConfirm.set(false);
  }

  clearAllHistory(): void {
    this.historyService.clearAll().subscribe({
      next: () => {
        this.entries.set([]);
        this.showClearConfirm.set(false);
      },
      error: (err) => {
        console.error('Error clearing history:', err);
        this.error.set('Failed to clear history');
        this.showClearConfirm.set(false);
      }
    });
  }

  // Helper methods
  getMethodClass(method: HttpMethod): string {
    const classes: Record<string, string> = {
      'GET': 'method-get',
      'POST': 'method-post',
      'PUT': 'method-put',
      'DELETE': 'method-delete',
      'PATCH': 'method-patch',
      'HEAD': 'method-head',
      'OPTIONS': 'method-options'
    };
    return classes[method] || '';
  }

  getStatusClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 300 && statusCode < 400) return 'status-redirect';
    if (statusCode >= 400 && statusCode < 500) return 'status-client-error';
    if (statusCode >= 500) return 'status-server-error';
    return '';
  }

  getStatusIcon(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✓';
    if (statusCode >= 300 && statusCode < 400) return '↪';
    if (statusCode >= 400) return '✗';
    return '?';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    // Default to date
    return date.toLocaleDateString();
  }

  formatResponseTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || '/';
    } catch {
      return url;
    }
  }

  getUrlHost(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.host;
    } catch {
      return '';
    }
  }

  // Track by
  trackByEntryId(index: number, entry: HistoryEntry): number {
    return entry.id;
  }

  // Helper for template object iteration
  objectEntries(obj: Record<string, string> | undefined): [string, string][] {
    if (!obj) return [];
    return Object.entries(obj);
  }

  hasKeys(obj: Record<string, string> | undefined): boolean {
    return obj ? Object.keys(obj).length > 0 : false;
  }
}

