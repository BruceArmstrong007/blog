import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  WritableSignal,
  signal,
} from '@angular/core';
import { NgFor, KeyValuePipe } from '@angular/common';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-validation-errors',
  standalone: true,
  imports: [NgFor, KeyValuePipe],
  templateUrl: './validation-errors.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ValidationErrorsComponent implements OnChanges {
  @Input() customErrorMessages!: Record<string, string>;
  @Input() validationErrors!: ValidationErrors | null;
  errors: WritableSignal<any[]> = signal([]);

  ngOnInit(): void {
    this.transformValidation();
  }

  ngOnChanges() {
    this.transformValidation();
  }

  transformValidation() {
    this.errors.update(() => {
      if (this.validationErrors === null) return [];
      return Object.entries(this.validationErrors).map((error) => {
        let key = error[0],
          value = error[1],
          customErrorValue = this.customErrorMessages?.[key];
        switch (key) {
          case 'minlength':
            return (
              customErrorValue ??
              `This field should have atleast ${value.requiedLength} characters.`
            );
            break;
          case 'maxlength':
            return (
              customErrorValue ??
              `This field should not exceed ${value.requiedLength} characters.`
            );
            break;
          case 'min':
            return (
              customErrorValue ??
              `This field should atleast have ${value.requiedLength} digits.`
            );
            break;
          case 'max':
            return (
              customErrorValue ??
              `This field should not exceed ${value.requiedLength} digits.`
            );
            break;
          case 'required':
            return customErrorValue ?? `This field is required.`;
            break;
          case 'pattern':
            return (
              customErrorValue ??
              `This field doesn't follow the specific format.`
            );
            break;
          case 'email':
            return customErrorValue ?? `This field should be in email format.`;
            break;
          default: // Need to check for custom validations eg: password
            break;
        }
        return error;
      });
    });
  }
}

export default ValidationErrorsComponent;