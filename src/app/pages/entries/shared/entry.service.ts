import { CategoryService } from './../../categories/shared/category.service';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entry } from './entry.model';
import { map, catchError, flatMap, mergeMap, switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class EntryService {
  private apiPath: string = "api/entries";

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
    ) { }

    getAll(): Observable<Entry[]> {
      return this.http.get(this.apiPath).pipe(
        catchError(this.handleError),
        map(this.jsonDataToEntries)
      )
    }

    getById(id:string): Observable<Entry> {
      const url = `${this.apiPath}/${id}`;
      return this.http.get(url).pipe(
        catchError(this.handleError),
        map(this.jsonDataToEntry)
      )
    }
   
    create(entry: Entry): Observable<Entry> {
      return this.categoryService.getById(entry.categoryId).pipe(
        mergeMap(category => {
          entry.category = category;
          return this.http.post(this.apiPath, entry).pipe(
            catchError(this.handleError),
            map(this.jsonDataToEntry)
          )
        })
      );
    }

    update(entry: Entry): Observable<Entry> {
      const url = `${this.apiPath}/${entry.id}`;
      return this.http.put(url, entry).pipe(
        catchError(this.handleError),
        map(() => entry)
      )
    }

    delete(id: number): Observable<any> {
      const url = `${this.apiPath}/${id}`;
      return this.http.delete(url).pipe(
        catchError(this.handleError),
        map(() => null)
      )
    } 

    private jsonDataToEntries(jsonData: any[]): Entry[] {
      const categories: Entry[] = [];
      jsonData.forEach(element => categories.push(Object.assign(new Entry(), element)));
      return categories;
    }

    private jsonDataToEntry(jsonData: any): Entry {
      return Object.assign(new Entry(), jsonData)
      
    }

    handleError(error: any): Observable<any> {
      console.log('Erro na requisição: ', error)
      return throwError(error);
    }

}
