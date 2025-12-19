import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenuModule} from "@angular/material/menu";
import {Environment} from "@core/models/Environment";
import {EnvironmentService} from "@core/services/environment.service";
import {StateService} from "@core/services/state.service";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    environments: Environment[] = [];
    selectedEnvironment: Environment | null = null;

    constructor(
        public stateService: StateService,
        private environmentService: EnvironmentService
    ) {}

    ngOnInit(): void {
        this.loadEnvironments();
    }

    loadEnvironments(): void {
        this.environmentService.getEnvironments().subscribe({
            next: (envs) => this.environments = envs,
            error: (err) => console.error('Failed to load environments', err)
        });
    }

    selectEnvironment(env: Environment | null): void {
        this.selectedEnvironment = env;
        this.stateService.setActiveEnvironment(env);
    }
}