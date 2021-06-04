import { CategoryService } from './../../categories/shared/category.service';
import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { switchMap } from 'rxjs/operators';

import toastr from 'toastr';
import { Category } from '../../categories/shared/category.model';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked { 
  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  categories: Array<Category>;
  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZero: true,
    radix: ','
  }
  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new") {
    this.currentAction = "new";
    } else {
      this.currentAction = "edit";
    }
  }

  buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: ["expense", [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]],
    });
  }

  loadEntry() {
    if(this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(params.get("id")))
        //
      ).subscribe({
        next: (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(entry);
        },
        error: () => {alert('Ocorreu um erro no servidor, tente novamente mais tade.')
      }
        
      })
    }
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }
  private loadCategories() {
    this.categoryService.getAll().subscribe({
      next: categories => this.categories = categories,
      error: (error) => this.actionForError(error) 
    })
  }

  setPageTitle() {
    if(this.currentAction == "new") {
      this.pageTitle = "Cadastro de Nova Categoria"
    } else {
      const entryName = this.entry.name || "";
      this.pageTitle = `Editando Categoria: ${entryName}` 
    }
  }

  //called after setting all page loading
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  actionsForSuccess(entry: Entry) {
    toastr.success("Solicitação processada com sucesso");
    //skipLocationChange: browser does not return to the previous screen
    this.router.navigateByUrl("entries", {skipLocationChange: true}).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
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

  createEntry() {
    //creates a new entry and set form values ​​in the entry
    let entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    entry = {
      ...entry,
      id: uuidv4(),
      paidText: entry.paidText
    }

    this.entryService.create(entry).subscribe({
      next:() => this.actionsForSuccess(entry),
      error: (error) => this.actionForError(error) 
    })
  }

  updateEntry() {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.update(entry).subscribe({
      next:() => this.actionsForSuccess(entry),
      error: (error) => this.actionForError(error) 
    })
  }

  submitForm() {
    this.submittingForm = true;
    if(this.currentAction == "new") {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  get typeOptions(): Array<any> {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        }
      }
    )
  }
}
