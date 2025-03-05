import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";

@Component({
  selector: 'app-validation-modal',
  templateUrl: './validation-modal.component.html',
  styleUrls: ['./validation-modal.component.css']
})
export class ValidationModalComponent implements OnChanges {
  @Input() validationJson: string = '';
  @Output() onValidate = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  originalData: any;
  editableData: any;
  originalEditableData: any;
  httpMethod: string = '';
  isDelete: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['validationJson']) {
      this.initializeData();
    }
  }

  private initializeData(): void {
    try {
      this.originalData = JSON.parse(this.validationJson);
      this.httpMethod = this.originalData.method?.toUpperCase() || '';
      this.isDelete = this.httpMethod === 'DELETE';

      if (this.isDelete) {
        this.editableData = {
          resourceId: this.extractIdFromUrl(this.originalData.url)
        };
      } else {
        this.editableData = this.originalData.body || this.originalData.params || {};
      }

      this.originalEditableData = JSON.parse(JSON.stringify(this.editableData));
    } catch (error) {
      console.error('Invalid JSON:', error);
      this.resetData();
    }
  }

  private extractIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  getFieldMaxLength(key: string): number | null {
    if (key === 'resourceId') {
      return 10;  // Example, adjust as needed
    }
    return null;  // No max length
  }

  getFieldPattern(key: string): string | null {
    if (key === 'resourceId') {
      return '^[a-zA-Z0-9]*$';  // Example pattern for resource ID
    }
    return null;
  }

  getFieldMin(key: string): number | null {
    if (key === 'amount') {
      return 1;  // Example, adjust as needed
    }
    return null;
  }

  getFieldMax(key: string): number | null {
    if (key === 'amount') {
      return 100;  // Example, adjust as needed
    }
    return null;
  }

  getJsonPattern(): string {
    return '^\\{.*\\}$';  // Example JSON pattern
  }

  validate(): void {
    try {
      let updatedData = { ...this.originalData };

      if (this.isDelete) {
        updatedData.url = updatedData.url.replace(/[^/]*$/, this.editableData.resourceId);
      } else {
        if (updatedData.body) {
          updatedData.body = { ...updatedData.body, ...this.editableData };
        } else if (updatedData.params) {
          updatedData.params = { ...updatedData.params, ...this.editableData };
        }
      }

      this.onValidate.emit(JSON.stringify(updatedData, null, 2));
    } catch (error) {
      console.error('Validation error:', error);
      this.onValidate.emit(this.validationJson);
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  isValid(): boolean {
    return Object.keys(this.editableData).every(key => {
      const value = this.editableData[key];
      const maxLength = this.getFieldMaxLength(key);
      const pattern = this.getFieldPattern(key);
      const min = this.getFieldMin(key);
      const max = this.getFieldMax(key);

      if (value === undefined || value === null || value === '') {
        return false;
      }

      if (maxLength !== null && value.length > maxLength) {
        return false;
      }

      if (pattern !== null && !new RegExp(pattern).test(value)) {
        return false;
      }

      if (min !== null && value < min) {
        return false;
      }

      if (max !== null && value > max) {
        return false;
      }

      return true;
    });
  }

  private resetData(): void {
    this.originalData = {};
    this.editableData = {};
    this.httpMethod = '';
    this.isDelete = false;
  }

  getFieldType(value: any): string {
    if (value === null) return 'string';
    return typeof value === 'object' ? 'object' : typeof value;
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}
