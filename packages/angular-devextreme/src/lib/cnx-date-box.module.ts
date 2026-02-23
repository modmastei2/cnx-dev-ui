import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DxDateBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CnxDateBoxComponent } from './components/cnx-date-box/cnx-date-box.component';

@NgModule({
  declarations: [CnxDateBoxComponent],
  imports: [CommonModule, DxDateBoxModule, DxTemplateModule],
  exports: [CnxDateBoxComponent, DxDateBoxModule, DxTemplateModule],
})
export class CnxDateBoxModule {}
