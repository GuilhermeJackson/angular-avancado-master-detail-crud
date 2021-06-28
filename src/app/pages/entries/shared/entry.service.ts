import { CategoryService } from './../../categories/shared/category.service';
import { Observable, throwError } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entry } from './entry.model';
import { mergeMap, switchMap } from 'rxjs/operators';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';


@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry>{  
  constructor(
    protected http: HttpClient,
    protected categoryService: CategoryService,
    protected injector: Injector,
    ) {
      super("api/entries", injector, Entry.fromJson)
     }
   
    create(entry: Entry): Observable<Entry> {
      debugger
      return this.categoryService.getById(entry.categoryId).pipe(
        switchMap(category => {
          entry.category = category;
          return super.create(entry)
        })
      );
      
    }

    update(entry: Entry): Observable<Entry> {
      return this.categoryService.getById(entry.categoryId).pipe(
        mergeMap(category => {
          entry.category = category;
          return super.update(entry)
        })
      )
    }

    protected jsonDataToResources(jsonData: any[]): Entry[] {
      const categories: Entry[] = [];
      jsonData.forEach(element => Entry.fromJson(element));
      return categories;
    }

    protected jsonDataToResource(jsonData: any): Entry {
      return Entry.fromJson(jsonData);
    }

    handleError(error: any): Observable<any> {
      console.log('Erro na requisição: ', error)
      return throwError(error);
    }
}
