import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryFormComponent } from './category-form/category-form.component';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    CategoriesRoutingModule,
    ReactiveFormsModule,
  ],

  declarations: [
    CategoryListComponent,
    CategoryFormComponent
  ]
})
export class CategoriesModule { }
