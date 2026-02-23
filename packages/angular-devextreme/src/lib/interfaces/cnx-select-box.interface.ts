import { Observable } from 'rxjs';
import { SelectBoxKey, SelectBoxLoadResult, SelectBoxParam } from '../models/cnx-select-box.model';

/**
 * Interface ที่ Consumer App ต้อง implement เพื่อให้ SelectBoxComponent ดึงข้อมูลได้
 * วิธีนี้ทำให้ Library ไม่ผูกติดกับ API ของโปรเจกต์ใดโปรเจกต์หนึ่ง
 */
export interface SelectBoxDataProvider {
  getService(key: SelectBoxKey | null | undefined, param: SelectBoxParam): Observable<SelectBoxLoadResult>;
}
