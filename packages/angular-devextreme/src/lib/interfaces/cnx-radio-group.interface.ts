import { Observable } from 'rxjs';
import { RadioGroupKey, RadioGroupParam, RadioGroupViewModel } from '../models/cnx-radio-group.model';

export interface RadioGroupDataProvider {
  getService(key: RadioGroupKey | null | undefined, param: RadioGroupParam): Observable<RadioGroupViewModel[]>;
}
