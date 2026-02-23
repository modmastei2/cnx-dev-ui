import { Observable } from 'rxjs';
import { TagBoxKey, TagBoxLoadResult, TagBoxParam } from '../models/cnx-tag-box.model';

export interface TagBoxDataProvider {
  getService(key: TagBoxKey | null | undefined, param: TagBoxParam): Observable<TagBoxLoadResult>;
}
