# @cnx-dev/angular-devextreme

Angular UI Component Library powered by DevExtreme for CNX Dev internal applications.
Provides enhanced, easy-to-use wrappers around DevExtreme components with built-in support for Dependency Injection and dynamic data loading.

## Features

- **SelectBox (`<cnx-select-box>`)**: A smart dropdown component that supports dynamic data loading, pagination, search, cascading options (`cascadeBy`), and hidden options (`ignoreValue`) via the `SELECTBOX_DATA_PROVIDER` injection token.
- Seamless integration with Angular 17+ and DevExtreme 23.2+.
- Built with Angular Package Format (APF) for optimal consumption in both Module-based and Standalone Angular applications.

## Installation

```bash
npm install @cnx-dev/angular-devextreme devextreme devextreme-angular
```

## Setup

1. Add the DevExtreme Light Compact Theme to your `angular.json`:

```json
"styles": [
  "node_modules/devextreme/dist/css/dx.light.compact.css",
  "src/styles.css"
]
```

2. Add the `dx-viewport` class to your `<body>` in `src/index.html`:

```html
<body class="dx-viewport">
  <app-root></app-root>
</body>
```

3. Import the module in your application (e.g., `app.module.ts`):

```typescript
import { DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CnxSelectBoxModule } from '@cnx-dev/angular-devextreme';
import { AppSelectBoxService } from './services/app-select-box.service';

@NgModule({
  imports: [DxSelectBoxModule, DxTemplateModule, CnxSelectBoxModule.forRoot(AppSelectBoxService)],
})
export class AppModule {}
```

## SelectBox Usage

Implement the `SelectBoxDataProvider` interface in your service:

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectBoxDataProvider, SelectBoxKey, SelectBoxParam, SelectBoxLoadResult } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppSelectBoxService implements SelectBoxDataProvider {
  getService(key: SelectBoxKey, param: SelectBoxParam): Observable<SelectBoxLoadResult> {
    if (key === 'bank') {
      const data = [{ text: 'Bangkok Bank', value: 'BBL', dropdownText: 'BBL - Bangkok Bank' }];
      return of({ data, totalCount: data.length });
    }
    return of(new SelectBoxLoadResult());
  }
}
```

Use in your template:

```html
<cnx-select-box [selectBoxKey]="'bank'" [placeholder]="'Select Bank...'" (onValueChanged)="onBankChanged($event)"> </cnx-select-box>
```

## License

UNLICENSED
