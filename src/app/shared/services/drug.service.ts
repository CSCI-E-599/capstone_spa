import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { DrugSearchType } from '../../search/drug-search-type.enum';
import { OpenFDADrug } from './open-fdadrug.interface';

@Injectable({
  providedIn: 'root'
})
export class DrugService {

  constructor(private http: HttpClient) { }

  /**
   *
   * @param searchQuery
   * @param searchType
   */
  findDrug(searchQuery: string, searchType: string): Observable<any> {
    return this.http.get(`https://api.pharmadb.org/drugs?searchQuery=${searchQuery}&searchType=${searchType}`);
  }

  getDrugByApplicationNumber(applicationNumber: string): Observable<any> {
    const getCurrentSplLabel = false;
    const getSPLHistoryMetadata = false;
    const getImages = true;
    const getLabels = true;
    const getPatents = true;

    return this.http.get(`https://api.pharmadb.org/drugs/${applicationNumber}?splHistory=${getSPLHistoryMetadata}&images=${getImages}&currentSplLabel=${getCurrentSplLabel}&labels=${getLabels}&patents=${getPatents}`);
  }
}
