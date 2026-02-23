import { Observable } from 'rxjs';
import { CheckBoxKey, CheckBoxParam, CheckBoxViewModel } from '../models/cnx-check-box-group.model';

export interface CheckBoxDataProvider {
  getService(key: CheckBoxKey | null | undefined, param: CheckBoxParam): Observable<CheckBoxViewModel[]>;
}
