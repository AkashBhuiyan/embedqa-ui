import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {KeyValuePair} from '@core/models/KeyValuePair';

@Component({
    selector: 'app-key-value-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './key-value-editor.component.html',
    styleUrls: ['./key-value-editor.component.scss']
})
export class KeyValueEditorComponent {
    @Input() pairs: KeyValuePair[] = [];
    @Input() keyPlaceholder = 'Key';
    @Input() valuePlaceholder = 'Value';
    @Output() pairsChange = new EventEmitter<KeyValuePair[]>();

    onToggle(index: number): void {
        const updated = [...this.pairs];
        updated[index] = {...updated[index], enabled: !updated[index].enabled};
        this.pairsChange.emit(updated);
    }

    onKeyChange(index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        const updated = [...this.pairs];
        updated[index] = {...updated[index], key: value};
        this.pairsChange.emit(updated);
    }

    onValueChange(index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        const updated = [...this.pairs];
        updated[index] = {...updated[index], value: value};
        this.pairsChange.emit(updated);
    }

    onAdd(): void {
        const updated = [...this.pairs, {key: '', value: '', enabled: true}];
        this.pairsChange.emit(updated);
    }

    onRemove(index: number): void {
        if (this.pairs.length <= 1) return;
        const updated = this.pairs.filter((_, i) => i !== index);
        this.pairsChange.emit(updated);
    }
}