import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import {
  OrderEntry,
  CancellationReturnRequestEntryInput,
} from '@spartacus/core';

@Component({
  selector: 'cx-cancellation-return-items',
  templateUrl: './cancellation-return-items.component.html',
})
export class CancellationReturnItemsComponent implements OnInit {
  @Input() entries: OrderEntry[];
  @Input() confirmRequest = false;
  @Input() cancelOrder = true;

  @Output() confirm = new EventEmitter<CancellationReturnRequestEntryInput[]>();

  form: FormGroup;
  inputsControl: FormArray;
  disableConfirmBtn = true;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      entryInput: this.formBuilder.array([]),
    });

    this.inputsControl = this.form.get('entryInput') as FormArray;

    if (this.confirmRequest) {
      this.entries.forEach(entry => {
        this.inputsControl.push(
          this.formBuilder.group({
            orderEntryNumber: entry.entryNumber,
            quantity: [{ value: entry.returnedQuantity, disabled: true }],
          })
        );
      });
    } else {
      this.entries.forEach(entry => {
        this.inputsControl.push(
          this.formBuilder.group({
            orderEntryNumber: entry.entryNumber,
            quantity: '',
          })
        );
      });
    }
  }

  setComplete() {
    for (let i = 0; i < this.entries.length; i++) {
      this.inputsControl.at(i).setValue({
        orderEntryNumber: this.entries[i].entryNumber,
        quantity: this.entries[i].returnableQuantity,
      });
    }
    this.disableEnableConfirm();
  }

  confirmEntryInputs() {
    const inputs: CancellationReturnRequestEntryInput[] = [];
    for (const input of this.form.value.entryInput) {
      if (input.quantity > 0) {
        inputs.push(input);
      }
    }

    this.confirm.emit(inputs);
  }

  disableEnableConfirm() {
    for (const input of this.form.value.entryInput) {
      if (input.quantity > 0) {
        this.disableConfirmBtn = false;
        return;
      }
    }
    this.disableConfirmBtn = true;
  }

  onBlur(value: string, index: number): void {
    if (this.entries[index].returnableQuantity < Number(value)) {
      this.inputsControl.at(index).setValue({
        orderEntryNumber: this.entries[index].entryNumber,
        quantity: this.entries[index].returnableQuantity,
      });
    }
    this.disableEnableConfirm();
  }
}
