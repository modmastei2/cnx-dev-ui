import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CnxNumberBoxComponent } from './cnx-number-box.component';
import { DxNumberBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [CnxNumberBoxComponent],
  imports: [CommonModule, DxNumberBoxModule],
  exports: [CnxNumberBoxComponent],
})
export class CnxNumberBoxModule {}
