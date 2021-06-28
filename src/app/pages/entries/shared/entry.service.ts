import { CategoryService } from './../../categories/shared/category.service';
import { Observable, throwError } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entry } from './entry.model';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
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
      return this.setCategoryAndSendToServer(entry, super.create.bind(this))
    }

    update(entry: Entry): Observable<Entry> {
      return this.setCategoryAndSendToServer(entry, super.update.bind(this))
    }

    private setCategoryAndSendToServer(entry: Entry, sendFn: any): Observable<Entry> {
      return this.categoryService.getById(entry.categoryId).pipe(
        mergeMap(category => { 
          entry.category = category;
          return sendFn(entry)
        }),
        catchError(this.handleError)
      )
    }
}
