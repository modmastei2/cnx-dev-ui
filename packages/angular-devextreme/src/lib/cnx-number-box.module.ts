import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DxNumberBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CnxNumberBoxComponent } from './components/cnx-number-box/cnx-number-box.component';

@NgModule({
  declarations: [CnxNumberBoxComponent],
  imports: [CommonModule, DxNumberBoxModule, DxTemplateModule],
  exports: [CnxNumberBoxComponent, DxNumberBoxModule, DxTemplateModule],
})
export class CnxNumberBoxModule {}
