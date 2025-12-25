import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {EnvironmentService} from '@core/services/environment.service';
import {StateService} from '@core/services/state.service';
import {Environment} from "@core/models/Environment";
import {EnvironmentVariable} from "@core/models/EnvironmentVariable";

@Component({
  selector: 'app-environments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './environments.component.html',
  styleUrl: './environments.component.scss'
})
export class EnvironmentsComponent implements OnInit {
  private environmentService = inject(EnvironmentService);
  private stateService = inject(StateService);

  environments = signal<Environment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Modal state
  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingEnvironment = signal<Environment | null>(null);

  // Form state
  formName = signal('');
  formDescription = signal('');
  formVariables = signal<EnvironmentVariable[]>([]);

  // Delete confirmation
  showDeleteConfirm = signal(false);
  environmentToDelete = signal<Environment | null>(null);

  // Expanded environments for viewing variables
  expandedIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadEnvironments();
  }

  loadEnvironments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.environmentService.getEnvironments().subscribe({
      next: (response) => {
          this.environments.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load environments');
        this.loading.set(false);
        console.error('Error loading environments:', err);
      }
    });
  }

  // Toggle expand/collapse
  toggleExpand(env: Environment, event: Event): void {
    event.stopPropagation();
    const current = new Set(this.expandedIds());
    if (current.has(env.id!)) {
      current.delete(env.id!);
    } else {
      current.add(env.id!);
    }
    this.expandedIds.set(current);
  }

  isExpanded(env: Environment): boolean {
    return this.expandedIds().has(env.id!);
  }

  // Set as active environment
  setActiveEnvironment(env: Environment, event: Event): void {
    event.stopPropagation();
    this.stateService.setActiveEnvironment(env);
  }

  isActiveEnvironment(env: Environment): boolean {
    const active = this.stateService.activeEnvironment();
    return active?.id === env.id;
  }

  // Modal operations
  openCreateModal(): void {
    this.modalMode.set('create');
    this.formName.set('');
    this.formDescription.set('');
    this.formVariables.set([{name: '', value: '', enabled: true, secret: false}]);
    this.editingEnvironment.set(null);
    this.showModal.set(true);
  }

  openEditModal(env: Environment, event: Event): void {
    event.stopPropagation();
    this.modalMode.set('edit');
    this.formName.set(env.name);
    this.formDescription.set(env.description || '');
    this.formVariables.set(
        env.variables && env.variables.length > 0
            ? env.variables.map(v => ({...v}))
            : [{name: '', value: '', enabled: true, secret: false}]
    );
    this.editingEnvironment.set(env);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingEnvironment.set(null);
  }

  // Variable operations
  addVariable(): void {
    this.formVariables.update(vars => [
      ...vars,
      {name: '', value: '', enabled: true, secret: false}
    ]);
  }

  removeVariable(index: number): void {
    this.formVariables.update(vars => vars.filter((_, i) => i !== index));
  }

  updateVariable(index: number, field: keyof EnvironmentVariable, value: any): void {
    this.formVariables.update(vars => {
      const updated = [...vars];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  }

  toggleVariableEnabled(index: number): void {
    this.formVariables.update(vars => {
      const updated = [...vars];
      updated[index] = {...updated[index], enabled: !updated[index].enabled};
      return updated;
    });
  }

  toggleVariableSecret(index: number): void {
    this.formVariables.update(vars => {
      const updated = [...vars];
      updated[index] = {...updated[index], secret: !updated[index].secret};
      return updated;
    });
  }

  // Save environment
  saveEnvironment(): void {
    const name = this.formName().trim();
    if (!name) return;

    // Filter out empty variables
    const variables = this.formVariables().filter(v => v.name.trim() !== '');

    const environmentData = {
      name,
      description: this.formDescription().trim() || undefined,
      variables
    };

    if (this.modalMode() === 'create') {
      this.environmentService.createEnvironment(environmentData).subscribe({
        next: (response) => {
            this.loadEnvironments();
            this.closeModal();
        },
        error: (err) => {
          console.error('Error creating environment:', err);
          this.error.set('Failed to create environment');
        }
      });
    } else {
      const id = this.editingEnvironment()?.id;
      if (id) {
        this.environmentService.updateEnvironment(id, environmentData).subscribe({
          next: (response) => {
              this.loadEnvironments();
              this.closeModal();

              const active = this.stateService.activeEnvironment();
              if (active?.id === id && response) {
                this.stateService.setActiveEnvironment(response);
              }
          },
          error: (err) => {
            console.error('Error updating environment:', err);
            this.error.set('Failed to update environment');
          }
        });
      }
    }
  }

  // Delete operations
  confirmDelete(env: Environment, event: Event): void {
    event.stopPropagation();
    this.environmentToDelete.set(env);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.environmentToDelete.set(null);
  }

  deleteEnvironment(): void {
    const env = this.environmentToDelete();
    if (!env?.id) return;

    this.environmentService.deleteEnvironment(env.id).subscribe({
      next: () => {
        this.loadEnvironments();
        this.cancelDelete();

        // Clear active environment if it was deleted
        const active = this.stateService.activeEnvironment();
        if (active?.id === env.id) {
          this.stateService.setActiveEnvironment(null);
        }
      },
      error: (err) => {
        console.error('Error deleting environment:', err);
        this.error.set('Failed to delete environment');
        this.cancelDelete();
      }
    });
  }

  // Duplicate environment
  duplicateEnvironment(env: Environment, event: Event): void {
    event.stopPropagation();

    const duplicateData = {
      name: `${env.name} (Copy)`,
      description: env.description,
      variables: env.variables?.map(v => ({...v})) || []
    };

    this.environmentService.createEnvironment(duplicateData).subscribe({
      next: (response) => {
        this.loadEnvironments();

      },
      error: (err) => {
        console.error('Error duplicating environment:', err);
        this.error.set('Failed to duplicate environment');
      }
    });
  }

  // Helper to mask secret values
  getMaskedValue(variable: EnvironmentVariable): string {
    if (variable.secret && variable.value) {
      return '••••••••';
    }
    return variable.value || '';
  }

  // Get enabled variables count
  getEnabledVariablesCount(env: Environment): number {
    return env.variables?.filter(v => v.enabled).length || 0;
  }

  getVariablesCount(env: Environment): number {
    return env.variables?.length || 0;
  }

  // Track by functions
  trackByEnvId(index: number, env: Environment): number {
    return env.id || index;
  }

  trackByVarIndex(index: number): number {
    return index;
  }
}
