import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked { 
  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new") {
    this.currentAction = "new";
    } else {
      this.currentAction = "edit";
    }
  }

  buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  loadCategory() {
    if(this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(params.get("id")))
        //
      ).subscribe({
        next: (category) => {
          this.category = category;
          this.categoryForm.patchValue(category);
        },
        error: () => {alert('Ocorreu um erro no servidor, tente novamente mais tade.')
      }
        
      })
    }
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  setPageTitle() {
    if(this.currentAction == "new") {
      this.pageTitle = "Cadastro de Nova Categoria"
    } else {
      const categoryName = this.category.name || "";
      this.pageTitle = `Editando Categoria: ${categoryName}` 
    }
  }

  //called after setting all page loading
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  actionsForSuccess(category: Category) {
    toastr.success("Solicitação processada com sucesso");
    //skipLocationChange: browser does not return to the previous screen
    this.router.navigateByUrl("categories", {skipLocationChange: true}).then(
      () => this.router.navigate(["categories", category.id, "edit"])
    )
  }

  actionForError(error) {
    toastr.error("Ocorreu um erro ao processar sua solicitação!");
    this.submittingForm = false;
    if(error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
    }
  }

  createCategory() {
    //creates a new category and set form values ​​in the category
    let category: Category = Object.assign(new Category(), this.categoryForm.value);
    category = {...category,
      id: uuidv4()
    }
    this.categoryService.create(category).subscribe({
      next:() => this.actionsForSuccess(category),
      error: (error) => this.actionForError(error) 
    })
  }

  updateCategory() {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category).subscribe({
      next:() => this.actionsForSuccess(category),
      error: (error) => this.actionForError(error) 
    })
  }

  submitForm() {
    this.submittingForm = true;
    if(this.currentAction == "new") {
      this.createCategory();
    } else {
      this.updateCategory();
    }
  } 
}
